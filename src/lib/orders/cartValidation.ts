import { supabaseAdmin } from '@/lib/supabase/admin';
import { ProductCustomization } from '@/types/customization';
import {
  calculateUnitPrice,
  resolveShipping,
  ShippingType,
} from './pricing';

/** Article tel qu'envoyé par le client. Aucun champ de prix n'est digne de confiance. */
export interface ClientCartItem {
  productId: string;
  variantId: string;
  quantity: number;
  customization?: ProductCustomization | null;
  shippingType?: ShippingType;
}

/** Article validé et chiffré côté serveur (source de vérité pour le paiement). */
export interface ValidatedItem {
  productId: string;
  variantId: string;
  quantity: number;
  /** Nom du produit rechargé depuis la base (jamais celui du client). */
  name: string;
  size: string | null;
  color: string | null;
  /** Prix unitaire recalculé serveur : base + ajustement variante + personnalisation. */
  unitPrice: number;
  lineTotal: number;
  customization: ProductCustomization | null;
}

export interface CartValidationResult {
  ok: boolean;
  error?: string;
  items: ValidatedItem[];
  shipping: { type: ShippingType; cost: number; label: string };
  /** Total articles + livraison, recalculé serveur. */
  totalAmount: number;
}

interface VariantRow {
  id: string;
  price_adjustment: number | null;
  stock_quantity: number | null;
  size: string | null;
  color: string | null;
  products: {
    id: string;
    name: string;
    base_price: number;
  } | null;
}

const round2 = (n: number): number => Math.round(n * 100) / 100;

/**
 * Valide un panier côté serveur :
 *  - recharge chaque variante (+ produit) depuis la base,
 *  - recalcule le prix unitaire (ignore tout prix venant du client),
 *  - vérifie la disponibilité du stock,
 *  - recalcule la livraison et le total.
 *
 * Renvoie une erreur explicite si une variante est introuvable ou en rupture.
 */
export async function validateCart(
  items: ClientCartItem[]
): Promise<CartValidationResult> {
  const shipping = resolveShipping(items.map((i) => i.shippingType));
  const empty: CartValidationResult = {
    ok: false,
    items: [],
    shipping,
    totalAmount: 0,
  };

  if (!items || items.length === 0) {
    return { ...empty, error: 'Le panier est vide.' };
  }

  if (items.some((i) => !i.variantId || !i.productId || !i.quantity || i.quantity < 1)) {
    return { ...empty, error: 'Article invalide dans le panier.' };
  }

  const variantIds = [...new Set(items.map((i) => i.variantId))];

  const { data, error } = await supabaseAdmin
    .from('product_variants')
    .select(
      'id, price_adjustment, stock_quantity, size, color, products!inner(id, name, base_price)'
    )
    .in('id', variantIds);

  if (error) {
    return { ...empty, error: `Erreur de validation du panier : ${error.message}` };
  }

  const variants = new Map<string, VariantRow>();
  for (const row of (data ?? []) as unknown as VariantRow[]) {
    variants.set(row.id, row);
  }

  // Cumul des quantités par variante (un même produit peut apparaître sur
  // plusieurs lignes avec des personnalisations différentes).
  const requestedQtyByVariant = new Map<string, number>();
  for (const item of items) {
    requestedQtyByVariant.set(
      item.variantId,
      (requestedQtyByVariant.get(item.variantId) ?? 0) + item.quantity
    );
  }

  const validated: ValidatedItem[] = [];

  for (const item of items) {
    const variant = variants.get(item.variantId);
    if (!variant || !variant.products) {
      return { ...empty, error: 'Un article du panier n\'existe plus.' };
    }

    const totalRequested = requestedQtyByVariant.get(item.variantId) ?? item.quantity;
    if ((variant.stock_quantity ?? 0) < totalRequested) {
      return {
        ...empty,
        error: `Stock insuffisant pour « ${variant.products.name} »${
          variant.size ? ` (${variant.size})` : ''
        }.`,
      };
    }

    const unitPrice = calculateUnitPrice({
      basePrice: Number(variant.products.base_price),
      variantPriceAdjustment: Number(variant.price_adjustment ?? 0),
      customization: item.customization,
    });

    validated.push({
      productId: variant.products.id,
      variantId: variant.id,
      quantity: item.quantity,
      name: variant.products.name,
      size: variant.size,
      color: variant.color,
      unitPrice,
      lineTotal: round2(unitPrice * item.quantity),
      customization: item.customization ?? null,
    });
  }

  const itemsTotal = validated.reduce((sum, i) => sum + i.lineTotal, 0);
  const totalAmount = round2(itemsTotal + shipping.cost);

  return { ok: true, items: validated, shipping, totalAmount };
}
