import { ProductCustomization } from '@/types/customization';

/**
 * Source UNIQUE de vérité pour le prix d'une personnalisation.
 *
 * Utilisée à la fois côté client (affichage dans le customizer) et côté serveur
 * (recalcul du prix au checkout). Le client n'envoie JAMAIS de prix de confiance :
 * le serveur recalcule toujours à partir de ces barèmes.
 *
 * Règle métier (validée avec le client) :
 *   prix perso = Σ par face personnalisée ( prix_type + prix_position )
 *   - le prix du type est compté PAR FACE
 *   - remise de 15% appliquée sur la part POSITION uniquement quand recto + verso
 */

export const TYPE_PRICES: Record<string, number> = {
  impression: 5.0,
  broderie: 8.5,
};

export const POSITION_PRICES: Record<string, number> = {
  'devant-pec': 7.84,
  'devant-pecs': 12.0,
  'devant-centre': 29.6,
  'devant-complet': 17.88,
  'dos-haut': 9.4,
  'dos-complet': 33.0,
};

/** Remise appliquée à la part "position" lorsque le devant ET le derrière sont personnalisés. */
export const RECTO_VERSO_DISCOUNT = 0.15;

const round2 = (n: number): number => Math.round(n * 100) / 100;

/** Déduit la face d'une personnalisation, avec repli sur le préfixe de la position. */
function resolveFace(face?: string, position?: string): 'devant' | 'derriere' {
  if (face === 'derriere' || face === 'devant') return face;
  if (typeof position === 'string' && position.startsWith('dos')) return 'derriere';
  return 'devant';
}

/**
 * Calcule le supplément de prix d'une personnalisation (en euros).
 * Tolère les données stockées (une entrée par face avec `position`) et renvoie 0
 * pour toute valeur inconnue (jamais d'erreur, jamais de NaN).
 */
export function calculateCustomizationPrice(
  customization?: ProductCustomization | null
): number {
  const entries = customization?.customizations ?? [];
  if (entries.length === 0) return 0;

  let typeTotal = 0;
  let positionTotal = 0;
  let hasFront = false;
  let hasBack = false;

  for (const entry of entries) {
    if (!entry) continue;

    typeTotal += TYPE_PRICES[entry.type_impression] ?? 0;

    const position = (entry.position ?? '') as string;
    positionTotal += POSITION_PRICES[position] ?? 0;

    if (resolveFace(entry.face, position) === 'derriere') hasBack = true;
    else hasFront = true;
  }

  if (hasFront && hasBack) {
    positionTotal *= 1 - RECTO_VERSO_DISCOUNT;
  }

  return round2(typeTotal + positionTotal);
}

/**
 * Prix unitaire serveur d'un article (hors livraison) :
 *   base_price du produit + price_adjustment de la variante + prix de la personnalisation.
 */
export function calculateUnitPrice(params: {
  basePrice: number;
  variantPriceAdjustment: number;
  customization?: ProductCustomization | null;
}): number {
  const { basePrice, variantPriceAdjustment, customization } = params;
  return round2(
    basePrice + (variantPriceAdjustment ?? 0) + calculateCustomizationPrice(customization)
  );
}

/** Barème de livraison (fixe, côté serveur). Le client choisit un mode, jamais un prix. */
export type ShippingType = 'normal' | 'fast' | 'urgent';

export const SHIPPING_OPTIONS: Record<
  ShippingType,
  { cost: number; label: string }
> = {
  normal: { cost: 4.99, label: 'Livraison classique (3 semaines)' },
  fast: { cost: 9.99, label: 'Livraison prioritaire (2 semaines)' },
  urgent: { cost: 14.99, label: 'Livraison express (1 semaine)' },
};

/** Détermine le mode de livraison le plus rapide demandé par le panier. */
export function resolveShipping(shippingTypes: Array<ShippingType | undefined>): {
  type: ShippingType;
  cost: number;
  label: string;
} {
  const type: ShippingType = shippingTypes.includes('urgent')
    ? 'urgent'
    : shippingTypes.includes('fast')
    ? 'fast'
    : 'normal';
  return { type, ...SHIPPING_OPTIONS[type] };
}
