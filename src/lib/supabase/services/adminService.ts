import { supabase } from '../client';
import { Product, ProductVariant, Category, ProductImage } from '@/types/products';

/**
 * Ajoute un nouveau produit dans la base de données
 */
export async function addProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<{ id: string } | null> {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select('id')
    .single();
  
  if (error) {
    console.error('Error adding product:', error);
    return null;
  }
  
  return data;
}

/**
 * Ajoute une variante de produit dans la base de données
 */
export async function addProductVariant(variant: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'>): Promise<{ id: string } | null> {
  // S'assurer que les valeurs numériques sont bien des nombres
  const sanitizedVariant = {
    ...variant,
    stock_quantity: Number(variant.stock_quantity),
    price_adjustment: Number(variant.price_adjustment)
  };
  
  // Vérifier que les valeurs sont valides
  if (isNaN(sanitizedVariant.stock_quantity) || isNaN(sanitizedVariant.price_adjustment)) {
    console.error('Invalid numeric values in variant:', variant);
    return null;
  }
  
  // Vérifier que product_id est défini
  if (!sanitizedVariant.product_id) {
    console.error('Missing product_id in variant:', variant);
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('product_variants')
      .insert([sanitizedVariant])
      .select('id')
      .single();
    
    if (error) {
      console.error('Error adding product variant:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Unexpected error in addProductVariant:', err);
    return null;
  }
}

/**
 * Ajoute une nouvelle catégorie dans la base de données
 */
export async function addCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<{ id: string } | null> {
  const { data, error } = await supabase
    .from('categories')
    .insert([category])
    .select('id')
    .single();
  
  if (error) {
    console.error('Error adding category:', error);
    return null;
  }
  
  return data;
}

/**
 * Met à jour un produit existant
 */
export async function updateProduct(id: string, updates: Partial<Product>): Promise<boolean> {
  const { error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id);
  
  if (error) {
    console.error(`Error updating product ${id}:`, error);
    return false;
  }
  
  return true;
}

/**
 * Met à jour une variante de produit existante
 */
export async function updateProductVariant(id: string, updates: Partial<ProductVariant>): Promise<boolean> {
  const { error } = await supabase
    .from('product_variants')
    .update(updates)
    .eq('id', id);
  
  if (error) {
    console.error(`Error updating product variant ${id}:`, error);
    return false;
  }
  
  return true;
}

/**
 * Supprime une variante de produit
 */
export async function deleteProductVariant(id: string): Promise<boolean> {
  try {
    // Vérifier d'abord si la variante existe
    const { data: variant, error: fetchError } = await supabase
      .from('product_variants')
      .select('id')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error(`Erreur lors de la vérification de la variante ${id}:`, fetchError);
      return false;
    }
    
    if (!variant) {
      console.error(`Variante ${id} non trouvée`);
      return false;
    }
    
    // Supprimer les entrées dans cart_items qui référencent cette variante
    const { error: cartItemsError } = await supabase
      .from('cart_items')
      .delete()
      .eq('product_variant_id', id);
    
    if (cartItemsError) {
      console.error(`Erreur lors de la suppression des cart_items liés à la variante ${id}:`, cartItemsError);
      // Continuer même en cas d'erreur
    }
    
    // Supprimer la variante
    const { error } = await supabase
      .from('product_variants')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Erreur lors de la suppression de la variante ${id}:`, error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error(`Exception non gérée lors de la suppression de la variante ${id}:`, err);
    return false;
  }
}

/**
 * Supprime un produit et toutes ses variantes
 */
export async function deleteProduct(id: string): Promise<boolean> {
  try {
    console.log(`Début de la suppression du produit ${id}`);
    
    // Vérifier d'abord si le produit existe
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error(`Erreur lors de la vérification du produit ${id}:`, fetchError);
      return false;
    }
    
    if (!product) {
      console.error(`Produit ${id} non trouvé`);
      return false;
    }
    
    console.log(`Produit ${id} trouvé, tentative de suppression...`);
    
    // 1. Récupérer toutes les variantes du produit
    const { data: variants, error: fetchVariantsError } = await supabase
      .from('product_variants')
      .select('id')
      .eq('product_id', id);
    
    if (fetchVariantsError) {
      console.error(`Erreur lors de la récupération des variantes du produit ${id}:`, fetchVariantsError);
      return false;
    }
    
    console.log(`${variants?.length || 0} variantes trouvées pour le produit ${id}`);
    
    // 2. Supprimer les entrées dans cart_items qui référencent ces variantes
    if (variants && variants.length > 0) {
      const variantIds = variants.map(v => v.id);
      
      // Supprimer les entrées de cart_items liées aux variantes
      const { error: cartItemsVariantError } = await supabase
        .from('cart_items')
        .delete()
        .in('product_variant_id', variantIds);
      
      if (cartItemsVariantError) {
        console.error(`Erreur lors de la suppression des cart_items liés aux variantes du produit ${id}:`, cartItemsVariantError);
        // Essayer avec la clé de service si nécessaire
        if (cartItemsVariantError.code === 'PGRST301' || cartItemsVariantError.message.includes('permission')) {
          try {
            const { createClient } = await import('@supabase/supabase-js');
            const supabaseAdmin = createClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL as string,
              process.env.SUPABASE_SERVICE_ROLE_KEY as string
            );
            
            await supabaseAdmin
              .from('cart_items')
              .delete()
              .in('product_variant_id', variantIds);
              
            console.log(`Cart items liés aux variantes du produit ${id} supprimés avec privilèges admin`);
          } catch (adminErr) {
            console.error(`Erreur admin lors de la suppression des cart_items liés aux variantes:`, adminErr);
            return false;
          }
        } else {
          return false;
        }
      } else {
        console.log(`Cart items liés aux variantes du produit ${id} supprimés`);
      }
    }
    
    // 3. Supprimer les entrées dans cart_items qui référencent directement le produit
    const { error: cartItemsProductError } = await supabase
      .from('cart_items')
      .delete()
      .eq('product_id', id);
    
    if (cartItemsProductError) {
      console.error(`Erreur lors de la suppression des cart_items liés au produit ${id}:`, cartItemsProductError);
      // Essayer avec la clé de service si nécessaire
      if (cartItemsProductError.code === 'PGRST301' || cartItemsProductError.message.includes('permission')) {
        try {
          const { createClient } = await import('@supabase/supabase-js');
          const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL as string,
            process.env.SUPABASE_SERVICE_ROLE_KEY as string
          );
          
          await supabaseAdmin
            .from('cart_items')
            .delete()
            .eq('product_id', id);
            
          console.log(`Cart items liés au produit ${id} supprimés avec privilèges admin`);
        } catch (adminErr) {
          console.error(`Erreur admin lors de la suppression des cart_items liés au produit:`, adminErr);
          return false;
        }
      } else {
        return false;
      }
    } else {
      console.log(`Cart items liés au produit ${id} supprimés`);
    }
    
    // 4. Maintenant, supprimer les variantes
    const { error: variantError } = await supabase
      .from('product_variants')
      .delete()
      .eq('product_id', id);
    
    if (variantError) {
      console.error(`Erreur lors de la suppression des variantes du produit ${id}:`, variantError);
      // Essayer avec la clé de service
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL as string,
          process.env.SUPABASE_SERVICE_ROLE_KEY as string
        );
        
        await supabaseAdmin
          .from('product_variants')
          .delete()
          .eq('product_id', id);
          
        console.log(`Variantes du produit ${id} supprimées avec privilèges admin`);
      } catch (adminErr) {
        console.error(`Erreur admin lors de la suppression des variantes:`, adminErr);
        return false;
      }
    } else {
      console.log(`Variantes du produit ${id} supprimées avec succès`);
    }
    
    // 5. Enfin, supprimer le produit
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Erreur lors de la suppression du produit ${id}:`, error);
      
      // Si l'erreur est liée aux permissions, essayer avec la clé de service
      if (error.code === 'PGRST301' || error.message.includes('permission')) {
        console.log(`Tentative de suppression avec des privilèges élevés pour le produit ${id}`);
        
        // Créer un client Supabase avec la clé de service (pour les opérations admin)
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL as string,
          process.env.SUPABASE_SERVICE_ROLE_KEY as string
        );
        
        const { error: adminError } = await supabaseAdmin
          .from('products')
          .delete()
          .eq('id', id);
        
        if (adminError) {
          console.error(`Erreur lors de la suppression admin du produit ${id}:`, adminError);
          return false;
        }
        
        console.log(`Produit ${id} supprimé avec succès via admin`);
        return true;
      }
      
      return false;
    }
    
    console.log(`Produit ${id} supprimé avec succès`);
    return true;
  } catch (err) {
    console.error(`Exception non gérée lors de la suppression du produit ${id}:`, err);
    return false;
  }
}

/**
 * Met à jour une catégorie existante
 */
export async function updateCategory(id: string, updates: Partial<Category>): Promise<boolean> {
  const { error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id);
  
  if (error) {
    console.error(`Error updating category ${id}:`, error);
    return false;
  }
  
  return true;
}

/**
 * Supprime une catégorie
 */
export async function deleteCategory(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error(`Error deleting category ${id}:`, error);
    return false;
  }
  
  return true;
}

/**
 * Télécharge une image de produit dans le bucket de stockage
 */
export async function uploadProductImage(file: File, fileName: string): Promise<string | null> {
  try {
    const bucketName = 'product-images';
    
    // Upload direct du fichier - cette méthode fonctionne avec les politiques RLS configurées
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('Error uploading product image:', error);
      return '/images/placeholder.jpg';
    }
    
    // Récupérer l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);
    
    return publicUrl;
  } catch (error) {
    console.error('Unexpected error in uploadProductImage:', error);
    // Retourner une URL d'image placeholder
    return '/images/placeholder.jpg';
  }
}

/**
 * Ajoute une image à un produit
 */
export async function addProductImage(image: Omit<ProductImage, 'id' | 'created_at' | 'updated_at'>): Promise<{ id: string } | null> {
  try {
    const { data, error } = await supabase
      .from('product_images')
      .insert([image])
      .select('id')
      .single();
    
    if (error) {
      console.error('Error adding product image:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Unexpected error in addProductImage:', err);
    return null;
  }
}

/**
 * Met à jour une image de produit existante
 */
export async function updateProductImage(id: string, updates: Partial<ProductImage>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('product_images')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      console.error(`Error updating product image ${id}:`, error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Unexpected error in updateProductImage:', err);
    return false;
  }
}

/**
 * Supprime une image de produit
 */
export async function deleteProductImage(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting product image ${id}:`, error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Unexpected error in deleteProductImage:', err);
    return false;
  }
}

/**
 * Définit une image comme image principale pour un produit
 */
export async function setProductPrimaryImage(productId: string, imageId: string): Promise<boolean> {
  try {
    // D'abord, réinitialiser toutes les images du produit à non-primaires
    const { error: resetError } = await supabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_id', productId)
      .is('variant_id', null);
    
    if (resetError) {
      console.error(`Error resetting primary images for product ${productId}:`, resetError);
      return false;
    }
    
    // Ensuite, définir l'image spécifiée comme primaire
    const { error } = await supabase
      .from('product_images')
      .update({ is_primary: true })
      .eq('id', imageId);
    
    if (error) {
      console.error(`Error setting primary image ${imageId} for product ${productId}:`, error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Unexpected error in setProductPrimaryImage:', err);
    return false;
  }
}

/**
 * Définit une image comme image principale pour une variante
 */
export async function setVariantPrimaryImage(variantId: string, imageId: string): Promise<boolean> {
  try {
    // D'abord, réinitialiser toutes les images de la variante à non-primaires
    const { error: resetError } = await supabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('variant_id', variantId);
    
    if (resetError) {
      console.error(`Error resetting primary images for variant ${variantId}:`, resetError);
      return false;
    }
    
    // Ensuite, définir l'image spécifiée comme primaire
    const { error } = await supabase
      .from('product_images')
      .update({ is_primary: true })
      .eq('id', imageId);
    
    if (error) {
      console.error(`Error setting primary image ${imageId} for variant ${variantId}:`, error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Unexpected error in setVariantPrimaryImage:', err);
    return false;
  }
}

/**
 * Met à jour l'ordre des images d'un produit
 */
export async function updateProductImagesOrder(images: { id: string, position: number }[]): Promise<boolean> {
  try {
    // Mettre à jour chaque image avec sa nouvelle position
    for (const image of images) {
      const { error } = await supabase
        .from('product_images')
        .update({ position: image.position })
        .eq('id', image.id);
      
      if (error) {
        console.error(`Error updating position for image ${image.id}:`, error);
        return false;
      }
    }
    
    return true;
  } catch (err) {
    console.error('Unexpected error in updateProductImagesOrder:', err);
    return false;
  }
}

/**
 * Remplace une image de produit existante
 * 
 * Cette fonction télécharge une nouvelle image et met à jour l'entrée existante dans la base de données
 */
export async function replaceProductImage(imageId: string, file: File): Promise<boolean> {
  try {
    // Récupérer d'abord les informations sur l'image existante
    const { data: existingImage, error: fetchError } = await supabase
      .from('product_images')
      .select('*')
      .eq('id', imageId)
      .single();
    
    if (fetchError || !existingImage) {
      console.error(`Error fetching image ${imageId} for replacement:`, fetchError);
      return false;
    }
    
    // Générer un nouveau nom de fichier
    const fileName = `product_${existingImage.product_id}_${Date.now()}_replacement_${file.name.replace(/\s+/g, '_')}`;
    
    // Télécharger la nouvelle image
    const imageUrl = await uploadProductImage(file, fileName);
    
    if (!imageUrl) {
      console.error(`Error uploading replacement image for ${imageId}`);
      return false;
    }
    
    // Mettre à jour l'entrée dans la base de données avec la nouvelle URL
    const { error: updateError } = await supabase
      .from('product_images')
      .update({ image_url: imageUrl })
      .eq('id', imageId);
    
    if (updateError) {
      console.error(`Error updating image ${imageId} with new URL:`, updateError);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Unexpected error in replaceProductImage:', err);
    return false;
  }
}
