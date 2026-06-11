import { supabase } from '../client';
import { Product, ProductVariant, Category, ProductImage } from '@/types/products';

export async function fetchAllProducts(): Promise<Product[]> {
  // Récupérer tous les produits
  const { data, error } = await supabase
    .from('products')
    .select('*');
  
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  
  if (!data || data.length === 0) return [];
  
  // Récupérer les images principales pour chaque produit
  const productsWithImages = await Promise.all(data.map(async (product) => {
    // Récupérer l'image principale du produit
    const primaryImage = await fetchPrimaryProductImage(product.id);
    
    return {
      ...product,
      primaryImage: primaryImage
    };
  }));
  
  return productsWithImages;
}

export async function fetchProductById(id: string): Promise<Product | null> {
  // Récupérer le produit de base
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    return null;
  }
  
  if (!data) return null;
  
  // Récupérer les images du produit
  const productImages = await fetchProductImages(id);
  
  // Récupérer les variantes
  const variants = await fetchProductVariants(id);
  
  // Pour chaque variante, récupérer ses images spécifiques
  const variantsWithImages = await Promise.all(variants.map(async (variant) => {
    const variantImages = await fetchVariantImages(variant.id);
    return {
      ...variant,
      images: variantImages
    };
  }));
  
  // Retourner le produit avec ses images et ses variantes
  return {
    ...data,
    images: productImages,
    variants: variantsWithImages
  };
}

export async function fetchProductVariants(productId: string): Promise<ProductVariant[]> {
  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId);
  
  if (error) {
    console.error(`Error fetching variants for product ${productId}:`, error);
    return [];
  }
  
  return data || [];
}

export async function fetchCategories(parentIdFilter?: boolean): Promise<Category[]> {
  let query = supabase
    .from('categories')
    .select('*');
    
  // Si parentIdFilter est true, ne récupérer que les catégories principales (sans parent_id)
  if (parentIdFilter) {
    query = query.is('parent_id', null);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  
  return data || [];
}

// Récupérer une catégorie par son ID
export async function fetchCategoryById(id: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching category with id ${id}:`, error);
    return null;
  }
  
  return data;
}

// Récupérer toutes les sous-catégories d'une catégorie parent
export async function fetchSubcategories(parentId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_id', parentId);
  
  if (error) {
    console.error(`Error fetching subcategories for parent ${parentId}:`, error);
    return [];
  }
  
  return data || [];
}

// Récupérer le chemin complet d'une catégorie (catégorie -> parent -> grand-parent...)
export async function fetchCategoryPath(categoryId: string): Promise<Category[]> {
  const path: Category[] = [];
  let currentCategoryId = categoryId;
  
  while (currentCategoryId) {
    const category = await fetchCategoryById(currentCategoryId);
    
    if (!category) break;
    
    path.unshift(category); // Ajouter au début du tableau pour avoir le chemin dans l'ordre
    
    if (!category.parent_id) break;
    
    currentCategoryId = category.parent_id;
  }
  
  return path;
}

export async function fetchProductsByCategory(categoryId: string): Promise<Product[]> {
  // Récupérer les produits de la catégorie
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId);
  
  if (error) {
    console.error(`Error fetching products for category ${categoryId}:`, error);
    return [];
  }
  
  if (!data || data.length === 0) return [];
  
  // Récupérer les images principales pour chaque produit
  const productsWithImages = await Promise.all(data.map(async (product) => {
    // Récupérer l'image principale du produit
    const primaryImage = await fetchPrimaryProductImage(product.id);
    
    return {
      ...product,
      primaryImage: primaryImage
    };
  }));
  
  return productsWithImages;
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  // Récupérer les produits mis en avant
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true);
  
  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
  
  if (!data || data.length === 0) return [];
  
  // Récupérer les images principales pour chaque produit
  const productsWithImages = await Promise.all(data.map(async (product) => {
    // Récupérer l'image principale du produit
    const primaryImage = await fetchPrimaryProductImage(product.id);
    
    return {
      ...product,
      primaryImage: primaryImage
    };
  }));
  
  return productsWithImages;
}

export async function fetchNewProducts(): Promise<Product[]> {
  // Récupérer les nouveaux produits
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_new', true);
  
  if (error) {
    console.error('Error fetching new products:', error);
    return [];
  }
  
  if (!data || data.length === 0) return [];
  
  // Récupérer les images principales pour chaque produit
  const productsWithImages = await Promise.all(data.map(async (product) => {
    // Récupérer l'image principale du produit
    const primaryImage = await fetchPrimaryProductImage(product.id);
    
    return {
      ...product,
      primaryImage: primaryImage
    };
  }));
  
  return productsWithImages;
}

export async function updateProductStock(variantId: string, quantityChange: number): Promise<boolean> {
  // D'abord, récupérer la quantité actuelle
  const { data: variant, error: fetchError } = await supabase
    .from('product_variants')
    .select('stock_quantity')
    .eq('id', variantId)
    .single();
  
  if (fetchError || !variant) {
    console.error(`Error fetching stock for variant ${variantId}:`, fetchError);
    return false;
  }
  
  // Calculer la nouvelle quantité
  const newQuantity = variant.stock_quantity + quantityChange;
  
  // S'assurer que la quantité ne devient pas négative
  if (newQuantity < 0) {
    console.error(`Cannot update stock: would result in negative quantity for variant ${variantId}`);
    return false;
  }
  
  // Mettre à jour la quantité
  const { error: updateError } = await supabase
    .from('product_variants')
    .update({ stock_quantity: newQuantity })
    .eq('id', variantId);
  
  if (updateError) {
    console.error(`Error updating stock for variant ${variantId}:`, updateError);
    return false;
  }
  
  return true;
}

// Fonction pour vérifier si un produit est en stock
export async function checkProductStock(variantId: string, requestedQuantity: number = 1): Promise<boolean> {
  const { data, error } = await supabase
    .from('product_variants')
    .select('stock_quantity')
    .eq('id', variantId)
    .single();
  
  if (error || !data) {
    console.error(`Error checking stock for variant ${variantId}:`, error);
    return false;
  }
  
  return data.stock_quantity >= requestedQuantity;
}

// Récupérer toutes les images d'un produit
export async function fetchProductImages(productId: string): Promise<ProductImage[]> {
  const { data, error } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', productId)
    .order('position', { ascending: true });
  
  if (error) {
    console.error(`Error fetching images for product ${productId}:`, error);
    return [];
  }
  
  return data || [];
}

// Récupérer les images d'une variante spécifique
export async function fetchVariantImages(variantId: string): Promise<ProductImage[]> {
  const { data, error } = await supabase
    .from('product_images')
    .select('*')
    .eq('variant_id', variantId)
    .order('position', { ascending: true });
  
  if (error) {
    console.error(`Error fetching images for variant ${variantId}:`, error);
    return [];
  }
  
  return data || [];
}

// Récupérer l'image principale d'un produit
export async function fetchPrimaryProductImage(productId: string): Promise<ProductImage | null> {
  const { data, error } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', productId)
    .eq('is_primary', true)
    .maybeSingle();
  
  if (error) {
    console.error(`Error fetching primary image for product ${productId}:`, error);
    return null;
  }
  
  return data;
}

// Récupérer l'image principale d'une variante
export async function fetchPrimaryVariantImage(variantId: string): Promise<ProductImage | null> {
  const { data, error } = await supabase
    .from('product_images')
    .select('*')
    .eq('variant_id', variantId)
    .eq('is_primary', true)
    .maybeSingle();
  
  if (error) {
    console.error(`Error fetching primary image for variant ${variantId}:`, error);
    return null;
  }
  
  return data;
}
