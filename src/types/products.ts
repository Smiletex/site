// Types produits correspondant au schéma de la base de données Supabase.
// Les données réelles sont chargées via src/lib/supabase/services/productService.ts.

export type Product = {
  id: string; // UUID dans la base de données réelle
  name: string;
  description: string;
  base_price: number;
  image_url: string; // Image principale (conservée pour compatibilité)
  category_id: string;
  is_featured: boolean;
  is_new?: boolean;
  weight_gsm?: number | null; // Grammage du produit en g/m²
  supplier_reference?: string; // Référence du produit chez le fournisseur
  material?: string; // Matière principale du produit
  created_at?: string;
  updated_at?: string;
  variants?: ProductVariant[]; // Ajout du champ variants optionnel
  images?: ProductImage[]; // Nouvelles images multiples
};

// Nouveau type pour les images de produit
export type ProductImage = {
  id: string;
  product_id: string;
  variant_id?: string | null; // Optionnel, si l'image est liée à une variante spécifique
  image_url: string;
  is_primary: boolean;
  position?: number | null; // Pour l'ordre d'affichage, optionnel
  created_at?: string;
  updated_at?: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  size: string;
  color: string | null;
  color_url?: string | null; // Ajout du champ pour l'URL de l'image de couleur
  stock_quantity: number;
  price_adjustment: number;
  sku?: string;
  created_at?: string;
  updated_at?: string;
};

export type Category = {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  created_at?: string;
  updated_at?: string;
  slug?: string; // Pour la navigation, non présent dans le schéma
};
