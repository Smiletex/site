import { useState, useEffect } from 'react';
import { Product, ProductVariant, Category, ProductImage } from '@/types/products';
import * as productService from '@/lib/supabase/services/productService';

// Interface étendue pour les produits avec image principale
interface ProductWithPrimaryImage extends Product {
  primaryImage?: ProductImage | null;
}

export function useAllProducts() {
  const [products, setProducts] = useState<ProductWithPrimaryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const data = await productService.fetchAllProducts();
        // Conversion explicite vers le type ProductWithPrimaryImage
        setProducts(data as ProductWithPrimaryImage[]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return { products, loading, error };
}

// Interface étendue pour les produits avec images et variantes avec images
interface ProductWithImagesAndVariants extends Product {
  images?: ProductImage[];
  variants?: (ProductVariant & { images?: ProductImage[] })[];
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<ProductWithImagesAndVariants | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const productData = await productService.fetchProductById(id);
        
        if (productData) {
          // La fonction fetchProductById récupère déjà les variantes et les images
          setProduct(productData as ProductWithImagesAndVariants);
        } else {
          setProduct(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProduct();
    }
  }, [id]);

  return { product, loading, error };
}

// Type pour représenter une catégorie avec ses sous-catégories
export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}

export function useCategories(parentIdFilter: boolean = false) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [hierarchicalCategories, setHierarchicalCategories] = useState<CategoryWithChildren[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fonction utilitaire pour construire une structure hiérarchique des catégories
  const buildCategoryHierarchy = (categories: Category[]): CategoryWithChildren[] => {
    // Créer une map pour un accès rapide aux catégories par ID
    const categoryMap: Record<string, CategoryWithChildren> = {};
    
    // Convertir toutes les catégories en CategoryWithChildren
    categories.forEach(category => {
      categoryMap[category.id] = { ...category, children: [] };
    });
    
    // Construire la hiérarchie
    const rootCategories: CategoryWithChildren[] = [];
    
    categories.forEach(category => {
      if (category.parent_id && categoryMap[category.parent_id]) {
        // C'est une sous-catégorie, l'ajouter à son parent
        if (!categoryMap[category.parent_id].children) {
          categoryMap[category.parent_id].children = [];
        }
        categoryMap[category.parent_id].children!.push(categoryMap[category.id]);
      } else {
        // C'est une catégorie racine
        rootCategories.push(categoryMap[category.id]);
      }
    });
    
    return rootCategories;
  };

  useEffect(() => {
    async function fetchCategoriesData() {
      try {
        setLoading(true);
        const data = await productService.fetchCategories(parentIdFilter);
        setCategories(data);
        
        // Construire la hiérarchie des catégories
        const hierarchical = buildCategoryHierarchy(data);
        setHierarchicalCategories(hierarchical);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchCategoriesData();
  }, [parentIdFilter]);

  return { categories, hierarchicalCategories, loading, error };
}

export function useFeaturedProducts() {
  const [products, setProducts] = useState<ProductWithPrimaryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        setLoading(true);
        const data = await productService.fetchFeaturedProducts();
        setProducts(data as ProductWithPrimaryImage[]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchFeatured();
  }, []);

  return { products, loading, error };
}

export function useProductsByCategory(categoryId: string) {
  const [products, setProducts] = useState<ProductWithPrimaryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchProductsByCategory() {
      try {
        setLoading(true);
        const data = await productService.fetchProductsByCategory(categoryId);
        setProducts(data as ProductWithPrimaryImage[]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    if (categoryId) {
      fetchProductsByCategory();
    }
  }, [categoryId]);

  return { products, loading, error };
}

export function useNewProducts() {
  const [products, setProducts] = useState<ProductWithPrimaryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchNewProducts() {
      try {
        setLoading(true);
        const data = await productService.fetchNewProducts();
        setProducts(data as ProductWithPrimaryImage[]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchNewProducts();
  }, []);

  return { products, loading, error };
}

export function useStockCheck() {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const checkStock = async (variantId: string, quantity: number = 1) => {
    try {
      setChecking(true);
      return await productService.checkProductStock(variantId, quantity);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return false;
    } finally {
      setChecking(false);
    }
  };

  return { checkStock, checking, error };
}

export function useStockUpdate() {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateStock = async (variantId: string, quantityChange: number) => {
    try {
      setUpdating(true);
      return await productService.updateProductStock(variantId, quantityChange);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return false;
    } finally {
      setUpdating(false);
    }
  };

  return { updateStock, updating, error };
}
