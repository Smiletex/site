'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Category } from '@/types/products';
import { fetchCategories } from '@/lib/supabase/services/productService';
import { 
  addProduct, 
  addProductVariant, 
  uploadProductImage, 
  addProductImage 
} from '@/lib/supabase/services/adminService';

type ProductFormData = {
  name: string;
  description: string;
  base_price: number;
  category_id: string;
  is_featured: boolean;
  is_new: boolean;
  image_file: File | null; // Image principale (pour compatibilité)
  image_files: File[]; // Images multiples
  weight_gsm: number | null;
  supplier_reference: string;
  material: string;
};

type ProductImageData = {
  file: File;
  preview: string;
  isPrimary: boolean;
};

type VariantFormData = {
  size: string;
  color: string;
  stock_quantity: number;
  price_adjustment: number;
  sku: string;
  images: ProductImageData[];
};

// Tailles et couleurs prédéfinies pour faciliter la génération de variantes
const PREDEFINED_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const PREDEFINED_COLORS = [
  { name: 'Blanc', hex: '#FFFFFF' },
  { name: 'Noir', hex: '#000000' },
  { name: 'Gris', hex: '#808080' },
  { name: 'Bleu', hex: '#0000FF' },
  { name: 'Rouge', hex: '#FF0000' },
  { name: 'Vert', hex: '#008000' }
];

export default function AddProductPage() {
  const router = useRouter();
  
  // États pour le formulaire de produit
  const [productData, setProductData] = useState<ProductFormData>({
    name: '',
    description: '',
    base_price: 0,
    category_id: '',
    is_featured: false,
    is_new: false,
    image_file: null,
    image_files: [],
    weight_gsm: null,
    supplier_reference: '',
    material: '',
  });
  
  // État pour gérer les images multiples avec prévisualisation
  const [productImages, setProductImages] = useState<ProductImageData[]>([]);
  
  // État pour les variantes
  const [variants, setVariants] = useState<VariantFormData[]>([
    { size: '', color: '', stock_quantity: 0, price_adjustment: 0, sku: '', images: [] }
  ]);
  
  // États pour les catégories
  const [categories, setCategories] = useState<Category[]>([]);
  
  // États pour le chargement et les erreurs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // États pour le système simplifié de génération de variantes
  const [sizesInput, setSizesInput] = useState<string>('');
  const [colorsInput, setColorsInput] = useState<string>('');
  const [defaultStock, setDefaultStock] = useState<number>(10);
  const [defaultPriceAdjustment, setDefaultPriceAdjustment] = useState<number>(0);
  const [variantGeneratorImages, setVariantGeneratorImages] = useState<ProductImageData[]>([]);
  
  // Charger les catégories au chargement de la page
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        console.error('Erreur lors du chargement des catégories:', err);
      }
    };
    
    loadCategories();
  }, []);
  
  // Gérer les changements dans le formulaire de produit
  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setProductData({ ...productData, [name]: checked });
    } else {
      setProductData({ ...productData, [name]: value });
    }
  };
  
  // Gérer le téléchargement d'images multiples
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Pour la compatibilité, conserver également l'image principale
    if (files.length > 0 && !productData.image_file) {
      setProductData(prev => ({ ...prev, image_file: files[0] }));
    }
    
    // Ajouter les nouvelles images à la liste existante
    const newImages: ProductImageData[] = [];
    
    Array.from(files).forEach(file => {
      // Vérifier si l'image existe déjà dans la liste
      const fileExists = productImages.some(img => 
        img.file.name === file.name && 
        img.file.size === file.size && 
        img.file.type === file.type
      );
      
      if (!fileExists) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const isPrimary = productImages.length === 0 && newImages.length === 0;
          
          newImages.push({
            file,
            preview: reader.result as string,
            isPrimary
          });
          
          // Si c'est la dernière image à traiter, mettre à jour l'état
          if (newImages.length === Array.from(files).filter(f => 
            !productImages.some(img => 
              img.file.name === f.name && 
              img.file.size === f.size && 
              img.file.type === f.type
            )
          ).length) {
            setProductImages(prev => [...prev, ...newImages]);
            setProductData(prev => ({ 
              ...prev, 
              image_files: [...prev.image_files, ...newImages.map(img => img.file)] 
            }));
            
            // Mettre à jour l'aperçu de l'image principale pour la compatibilité
            if (!imagePreview && newImages.length > 0) {
              setImagePreview(newImages[0].preview);
            }
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };
  
  // Supprimer une image de la liste
  const removeImage = (index: number) => {
    const newImages = [...productImages];
    const removedImage = newImages.splice(index, 1)[0];
    
    // Si l'image supprimée était l'image principale, définir la première image restante comme principale
    if (removedImage.isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true;
    }
    
    setProductImages(newImages);
    setProductData(prev => ({
      ...prev,
      image_files: newImages.map(img => img.file),
      image_file: newImages.length > 0 ? newImages[0].file : null
    }));
    
    // Mettre à jour l'aperçu de l'image principale
    if (newImages.length > 0) {
      const primaryImage = newImages.find(img => img.isPrimary) || newImages[0];
      setImagePreview(primaryImage.preview);
    } else {
      setImagePreview(null);
    }
  };
  
  // Définir une image comme principale
  const setAsPrimary = (index: number) => {
    const newImages = productImages.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }));
    
    setProductImages(newImages);
    setProductData(prev => ({
      ...prev,
      image_file: newImages[index].file
    }));
    
    // Mettre à jour l'aperçu de l'image principale
    setImagePreview(newImages[index].preview);
  };
  
  // Gérer les changements dans les variantes
  const handleVariantChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [name]: value };
    setVariants(newVariants);
  };
  
  // Gérer le téléchargement d'images pour le générateur de variantes
  const handleVariantGeneratorImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Ajouter les nouvelles images à la liste existante
    const newImages: ProductImageData[] = [];
    
    Array.from(files).forEach(file => {
      // Vérifier si l'image existe déjà dans la liste
      const fileExists = variantGeneratorImages.some(img => 
        img.file.name === file.name && 
        img.file.size === file.size && 
        img.file.type === file.type
      );
      
      if (!fileExists) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const isPrimary = variantGeneratorImages.length === 0 && newImages.length === 0;
          
          newImages.push({
            file,
            preview: reader.result as string,
            isPrimary
          });
          
          // Si c'est la dernière image à traiter, mettre à jour l'état
          if (newImages.length === Array.from(files).filter(f => 
            !variantGeneratorImages.some(img => 
              img.file.name === f.name && 
              img.file.size === f.size && 
              img.file.type === f.type
            )
          ).length) {
            setVariantGeneratorImages([...variantGeneratorImages, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };
  
  // Supprimer une image du générateur de variantes
  const removeVariantGeneratorImage = (imageIndex: number) => {
    const updatedImages = [...variantGeneratorImages];
    const removedImage = updatedImages.splice(imageIndex, 1)[0];
    
    // Si l'image supprimée était l'image principale, définir la première image restante comme principale
    if (removedImage.isPrimary && updatedImages.length > 0) {
      updatedImages[0].isPrimary = true;
    }
    
    setVariantGeneratorImages(updatedImages);
  };
  
  // Définir une image comme principale pour le générateur de variantes
  const setVariantGeneratorImageAsPrimary = (imageIndex: number) => {
    const updatedImages = variantGeneratorImages.map((img, i) => ({
      ...img,
      isPrimary: i === imageIndex
    }));
    
    setVariantGeneratorImages(updatedImages);
  };
  
  // Gérer le téléchargement d'images pour une variante spécifique
  const handleVariantImageChange = (variantIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Ajouter les nouvelles images à la liste existante pour cette variante
    const newImages: ProductImageData[] = [];
    
    Array.from(files).forEach(file => {
      // Vérifier si l'image existe déjà dans la liste
      const fileExists = variants[variantIndex].images.some(img => 
        img.file.name === file.name && 
        img.file.size === file.size && 
        img.file.type === file.type
      );
      
      if (!fileExists) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const isPrimary = variants[variantIndex].images.length === 0 && newImages.length === 0;
          
          newImages.push({
            file,
            preview: reader.result as string,
            isPrimary
          });
          
          // Si c'est la dernière image à traiter, mettre à jour l'état
          if (newImages.length === Array.from(files).filter(f => 
            !variants[variantIndex].images.some(img => 
              img.file.name === f.name && 
              img.file.size === f.size && 
              img.file.type === f.type
            )
          ).length) {
            const updatedVariants = [...variants];
            updatedVariants[variantIndex] = {
              ...updatedVariants[variantIndex],
              images: [...updatedVariants[variantIndex].images, ...newImages]
            };
            setVariants(updatedVariants);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };
  
  // Supprimer une image d'une variante
  const removeVariantImage = (variantIndex: number, imageIndex: number) => {
    const updatedVariants = [...variants];
    const variantImages = [...updatedVariants[variantIndex].images];
    const removedImage = variantImages.splice(imageIndex, 1)[0];
    
    // Si l'image supprimée était l'image principale, définir la première image restante comme principale
    if (removedImage.isPrimary && variantImages.length > 0) {
      variantImages[0].isPrimary = true;
    }
    
    updatedVariants[variantIndex] = {
      ...updatedVariants[variantIndex],
      images: variantImages
    };
    
    setVariants(updatedVariants);
  };
  
  // Définir une image comme principale pour une variante
  const setVariantImageAsPrimary = (variantIndex: number, imageIndex: number) => {
    const updatedVariants = [...variants];
    const variantImages = updatedVariants[variantIndex].images.map((img, i) => ({
      ...img,
      isPrimary: i === imageIndex
    }));
    
    updatedVariants[variantIndex] = {
      ...updatedVariants[variantIndex],
      images: variantImages
    };
    
    setVariants(updatedVariants);
  };
  
  // Ajouter une nouvelle variante
  const addVariant = () => {
    setVariants([...variants, { size: '', color: '', stock_quantity: 0, price_adjustment: 0, sku: '', images: [] }]);
  };
  
  // Supprimer une variante
  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      const newVariants = [...variants];
      newVariants.splice(index, 1);
      setVariants(newVariants);
    }
  };
  
  // Générer les variantes à partir des entrées simples de tailles et couleurs
  const generateVariants = () => {
    // Extraction des tailles et couleurs à partir des entrées séparées par des virgules
    const sizes = sizesInput.split(',').map(s => s.trim()).filter(s => s !== '');
    const colors = colorsInput.split(',').map(c => c.trim()).filter(c => c !== '');
    
    if (sizes.length === 0 || colors.length === 0) {
      setError('Veuillez entrer au moins une taille et une couleur');
      return;
    }
    
    const newVariants: VariantFormData[] = [];
    
    // Génération de toutes les combinaisons possibles
    sizes.forEach(size => {
      colors.forEach(color => {
        // Utiliser le code hexadécimal sans le # pour le SKU
        const colorHex = color.replace('#', '');
        
        // Générer un SKU basique
        const sku = `${productData.name.substring(0, 3).toUpperCase() || 'PRD'}-${size}-${colorHex}`;
        
        // Copier les images du générateur pour cette variante
        const variantImages = variantGeneratorImages.map(img => ({
          ...img,
          // Créer une copie du fichier pour éviter les références partagées
          file: new File([img.file], img.file.name, { type: img.file.type })
        }));
        
        newVariants.push({
          size,
          color, // Le code hexa complet est stocké comme couleur
          stock_quantity: defaultStock,
          price_adjustment: defaultPriceAdjustment,
          sku,
          images: variantImages
        });
      });
    });
    
    // Vérifier si des variantes avec les mêmes tailles et couleurs existent déjà
    const existingVariants = [...variants];
    const updatedVariants = [...existingVariants];
    
    // Ajouter uniquement les nouvelles combinaisons qui n'existent pas déjà
    newVariants.forEach(newVariant => {
      // Vérifier si cette combinaison taille/couleur existe déjà
      const existingVariantIndex = existingVariants.findIndex(
        v => v.size === newVariant.size && v.color === newVariant.color
      );
      
      if (existingVariantIndex === -1) {
        // Cette combinaison n'existe pas encore, l'ajouter
        updatedVariants.push(newVariant);
      }
      // Si la combinaison existe déjà, on la conserve telle quelle
    });
    
    setVariants(updatedVariants);
  };
  
  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Valider les données
      if (!productData.name || !productData.description || productData.base_price <= 0) {
        throw new Error('Veuillez remplir tous les champs obligatoires du produit');
      }
      
      if (!productData.category_id) {
        throw new Error('Veuillez sélectionner une catégorie');
      }
      
      // Vérifier que toutes les variantes ont des données valides
      for (const variant of variants) {
        if (!variant.size || !variant.color || variant.stock_quantity < 0) {
          throw new Error('Veuillez remplir correctement toutes les variantes');
        }
      }
      
      // Télécharger les images
      let imageUrl = '';
      const uploadedImages = [];
      
      // Télécharger toutes les images
      if (productImages.length > 0) {
        for (const imageData of productImages) {
          try {
            // Télécharger directement vers Supabase Storage
            const fileName = `${Date.now()}-${imageData.file.name.replace(/\s+/g, '-')}`;
            const supabaseUrl = await uploadProductImage(imageData.file, fileName);
            
            if (supabaseUrl) {
              uploadedImages.push({
                url: supabaseUrl,
                isPrimary: imageData.isPrimary
              });
              
              // Conserver l'URL de l'image principale pour la compatibilité
              if (imageData.isPrimary) {
                imageUrl = supabaseUrl;
              }
            }
          } catch (uploadError) {
            console.warn(`Erreur lors du téléchargement de l'image ${imageData.file.name}:`, uploadError);
          }
        }
      } 
      // Pour la compatibilité, télécharger l'image principale si aucune image multiple n'a été ajoutée
      else if (productData.image_file) {
        try {
          const fileName = `${Date.now()}-${productData.image_file.name.replace(/\s+/g, '-')}`;
          const supabaseUrl = await uploadProductImage(productData.image_file, fileName);
          if (supabaseUrl) {
            imageUrl = supabaseUrl;
            uploadedImages.push({
              url: supabaseUrl,
              isPrimary: true
            });
          } else {
            console.warn('Impossible de télécharger l\'image, continuation sans image');
          }
        } catch (uploadError) {
          console.warn('Erreur lors du téléchargement de l\'image, continuation sans image:', uploadError);
        }
      }
      
      // Créer le produit
      const productToAdd = {
        name: productData.name,
        description: productData.description,
        base_price: productData.base_price,
        image_url: imageUrl,
        category_id: productData.category_id,
        is_featured: productData.is_featured,
        is_new: productData.is_new,
        weight_gsm: productData.weight_gsm,
        supplier_reference: productData.supplier_reference,
        material: productData.material,
      };
      
      const newProduct = await addProduct(productToAdd);
      if (!newProduct) {
        throw new Error('Erreur lors de la création du produit');
      }
      
      // Ajouter les images à la base de données
      // S'assurer qu'une seule image est marquée comme primaire
      let primaryImageAdded = false;
      
      for (const image of uploadedImages) {
        try {
          // Si une image primaire a déjà été ajoutée, marquer les suivantes comme non-primaires
          const isPrimary = image.isPrimary && !primaryImageAdded;
          
          // Si cette image est primaire, mettre à jour le flag
          if (isPrimary) {
            primaryImageAdded = true;
          }
          
          const productImageData = {
            product_id: newProduct.id,
            variant_id: null, // Images associées au produit principal
            image_url: image.url,
            is_primary: isPrimary
            // position omis car non nécessaire pour l'instant
          };
          
          const result = await addProductImage(productImageData);
          if (!result) {
            console.error('Erreur lors de l\'ajout de l\'image');
          }
        } catch (error) {
          console.error('Erreur lors de l\'ajout de l\'image:', error);
        }
      }
      
      // Ajouter les variantes
      for (const variant of variants) {
        try {
          // Valider les données de la variante
          if (!variant.size || !variant.color) {
            setError('Chaque variante doit avoir une taille et une couleur');
            continue; // Passer à la variante suivante au lieu d'arrêter complètement
          }
          
          // Convertir explicitement en nombres et vérifier que ce sont des nombres valides
          const stockQuantity = Number(variant.stock_quantity);
          const priceAdjustment = Number(variant.price_adjustment);
          
          if (isNaN(stockQuantity) || isNaN(priceAdjustment)) {
            setError(`Valeurs numériques invalides pour la variante ${variant.size} ${variant.color}`);
            continue;
          }
          
          // Générer un SKU unique pour chaque variante
          // Utiliser un timestamp pour garantir l'unicité même si les tailles et couleurs sont identiques
          const timestamp = Date.now();
          const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
          
          const variantToAdd = {
            product_id: newProduct.id,
            size: variant.size,
            color: variant.color,
            stock_quantity: stockQuantity,
            price_adjustment: priceAdjustment,
            sku: variant.sku || `${newProduct.id.substring(0, 8)}-${variant.size}-${variant.color}-${timestamp}-${randomSuffix}`.toLowerCase(),
          };
          
          console.log('Ajout de la variante:', variantToAdd);
          
          const result = await addProductVariant(variantToAdd);
          if (!result) {
            console.error(`Échec de l'ajout de la variante ${variant.size} ${variant.color}`);
            setError(`Échec de l'ajout de la variante ${variant.size} ${variant.color}. Vérifiez la console pour plus de détails.`);
            // Continuer avec les autres variantes au lieu d'arrêter complètement
          } else {
            console.log(`Variante ${variant.size} ${variant.color} ajoutée avec succès, ID: ${result.id}`);
            
            // Ajouter les images spécifiques à cette variante
            if (variant.images && variant.images.length > 0) {
              // S'assurer qu'une seule image est marquée comme primaire pour cette variante
              let variantPrimaryImageAdded = false;
              
              for (const imageData of variant.images) {
                try {
                  // Télécharger l'image vers Supabase Storage
                  const fileName = `${Date.now()}-${imageData.file.name.replace(/\s+/g, '-')}`;
                  const supabaseUrl = await uploadProductImage(imageData.file, fileName);
                  
                  if (supabaseUrl) {
                    // Pour les variantes, ne jamais marquer les images comme primaires
                    // car cela viole la contrainte d'unicité idx_product_primary_image
                    
                    // Ajouter l'image à la base de données, associée à cette variante
                    const variantImageData = {
                      product_id: newProduct.id,
                      variant_id: result.id, // Associer l'image à cette variante spécifique
                      image_url: supabaseUrl,
                      is_primary: false // Toujours false pour les images de variantes
                      // position omis car non nécessaire pour l'instant
                    };
                    
                    const imageResult = await addProductImage(variantImageData);
                    if (!imageResult) {
                      console.error(`Échec de l'ajout de l'image pour la variante ${variant.size} ${variant.color}`);
                    }
                  }
                } catch (imageError) {
                  console.error(`Erreur lors de l'ajout d'une image pour la variante ${variant.size} ${variant.color}:`, imageError);
                }
              }
            }
          }
        } catch (variantError) {
          console.error('Erreur lors de l\'ajout d\'une variante:', variantError);
          setError(`Erreur lors de l'ajout de la variante ${variant.size} ${variant.color}: ${variantError instanceof Error ? variantError.message : 'Erreur inconnue'}`);
          // Continuer avec les autres variantes au lieu d'arrêter complètement
        }
      }
      
      // Vérifier si nous avons des erreurs mais continuer quand même
      if (error) {
        console.warn('Des erreurs sont survenues lors de l\'ajout des variantes, mais le produit a été créé.');
      }
      
      // Succès !
      setSuccess(true);
      
      // Rediriger vers la liste des produits après 2 secondes
      setTimeout(() => {
        router.push('/admin/products');
      }, 2000);
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 text-black">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ajouter un Produit</h1>
        <Link
          href="/admin/products"
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
        >
          Retour à la liste
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Produit ajouté avec succès ! Redirection en cours...
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Informations du Produit</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Nom du Produit *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={productData.name}
                onChange={handleProductChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="base_price">
                Prix de Base (€) *
              </label>
              <input
                type="number"
                id="base_price"
                name="base_price"
                value={productData.base_price}
                onChange={handleProductChange}
                min="0"
                step="0.01"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category_id">
                Catégorie *
              </label>
              <select
                id="category_id"
                name="category_id"
                value={productData.category_id}
                onChange={handleProductChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
                Images du Produit
              </label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                multiple
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              
              {/* Affichage des images téléchargées */}
              {productImages.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold mb-2">Images téléchargées:</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {productImages.map((image, index) => (
                      <div 
                        key={`${image.file.name}-${index}`} 
                        className={`relative rounded-md overflow-hidden border-2 ${image.isPrimary ? 'border-indigo-600' : 'border-gray-200'}`}
                      >
                        <img 
                          src={image.preview} 
                          alt={`Image ${index + 1}`} 
                          className="h-24 w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                          <div className="flex space-x-1">
                            {!image.isPrimary && (
                              <button 
                                type="button"
                                onClick={() => setAsPrimary(index)}
                                className="bg-indigo-600 text-white p-1 rounded-full hover:bg-indigo-700 transition-colors"
                                title="Définir comme image principale"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                            )}
                            <button 
                              type="button"
                              onClick={() => removeImage(index)}
                              className="bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                              title="Supprimer l'image"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        {image.isPrimary && (
                          <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs px-1 py-0.5 rounded-bl-md">
                            Principale
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">L'image marquée comme "Principale" sera utilisée comme image par défaut du produit.</p>
                </div>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={productData.description}
                onChange={handleProductChange}
                rows={4}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              ></textarea>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_featured"
                name="is_featured"
                checked={productData.is_featured}
                onChange={handleProductChange}
                className="mr-2"
              />
              <label className="text-gray-700 text-sm font-bold" htmlFor="is_featured">
                Produit en Vedette
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_new"
                name="is_new"
                checked={productData.is_new}
                onChange={handleProductChange}
                className="mr-2"
              />
              <label className="text-gray-700 text-sm font-bold" htmlFor="is_new">
                Nouveau Produit
              </label>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="weight_gsm">
                Grammage (g/m²)
              </label>
              <input
                type="number"
                id="weight_gsm"
                name="weight_gsm"
                value={productData.weight_gsm || ''}
                onChange={handleProductChange}
                min="0"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Ex: 180"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="supplier_reference">
                Référence Fournisseur
              </label>
              <input
                type="text"
                id="supplier_reference"
                name="supplier_reference"
                value={productData.supplier_reference}
                onChange={handleProductChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Ex: REF-12345"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="material">
                Matière
              </label>
              <input
                type="text"
                id="material"
                name="material"
                value={productData.material}
                onChange={handleProductChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Ex: 100% coton bio"
              />
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Variantes du Produit</h2>
            <button
              type="button"
              onClick={addVariant}
              className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md hover:bg-indigo-200 transition-colors"
            >
              + Ajouter une variante
            </button>
          </div>
          
          <div className="bg-gray-100 p-6 rounded-lg mb-6 border border-gray-200">
            <h3 className="font-medium text-lg mb-4 text-gray-800">Générateur automatique de variantes</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Tailles (séparées par des virgules)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={sizesInput}
                    onChange={(e) => setSizesInput(e.target.value)}
                    placeholder="XS,S,M,L,XL"
                    className="shadow appearance-none border rounded w-full py-2 px-3 pr-8 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Exemple: XS,S,M,L,XL</p>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Couleurs (séparées par des virgules)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={colorsInput}
                    onChange={(e) => setColorsInput(e.target.value)}
                    placeholder="#000000,#FFFFFF,#FF0000,#0000FF"
                    className="shadow appearance-none border rounded w-full py-2 px-3 pr-8 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {PREDEFINED_COLORS.map((color) => (
                    <div 
                      key={color.hex} 
                      className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded"
                      onClick={() => {
                        const currentColors = colorsInput.split(',').map(c => c.trim()).filter(c => c !== '');
                        if (!currentColors.includes(color.hex)) {
                          const newColors = [...currentColors, color.hex].join(',');
                          setColorsInput(newColors);
                        }
                      }}
                    >
                      <div 
                        className="w-6 h-6 mr-1 rounded border border-gray-300" 
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-xs">{color.name}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Exemple: #000000,#FFFFFF,#FF0000 (codes hexadécimaux)</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">  
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Stock par défaut
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={defaultStock}
                    onChange={(e) => setDefaultStock(Number(e.target.value))}
                    className="shadow appearance-none border rounded w-full py-2 px-3 pr-8 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500"
                    min="0"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Ajustement de prix par défaut (€)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={defaultPriceAdjustment}
                    onChange={(e) => setDefaultPriceAdjustment(Number(e.target.value))}
                    className="shadow appearance-none border rounded w-full py-2 px-3 pr-8 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500"
                    step="0.01"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Section d'images pour le générateur de variantes */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Images communes à toutes les variantes générées
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleVariantGeneratorImageChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                multiple
              />
              <p className="text-xs text-gray-500 mt-1">Ces images seront ajoutées à toutes les variantes générées automatiquement.</p>
              
              {/* Affichage des images téléchargées pour le générateur */}
              {variantGeneratorImages.length > 0 && (
                <div className="mt-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {variantGeneratorImages.map((image, imgIndex) => (
                      <div 
                        key={`generator-image-${imgIndex}`} 
                        className={`relative rounded-md overflow-hidden border-2 ${image.isPrimary ? 'border-indigo-600' : 'border-gray-200'}`}
                      >
                        <img 
                          src={image.preview} 
                          alt={`Image générateur ${imgIndex + 1}`} 
                          className="h-20 w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                          <div className="flex space-x-1">
                            {!image.isPrimary && (
                              <button 
                                type="button"
                                onClick={() => setVariantGeneratorImageAsPrimary(imgIndex)}
                                className="bg-indigo-600 text-white p-1 rounded-full hover:bg-indigo-700 transition-colors"
                                title="Définir comme image principale"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                            )}
                            <button 
                              type="button"
                              onClick={() => removeVariantGeneratorImage(imgIndex)}
                              className="bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                              title="Supprimer l'image"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        {image.isPrimary && (
                          <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs px-1 py-0.5 rounded-bl-md">
                            Principale
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-center">
              <button
                type="button"
                onClick={generateVariants}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md flex items-center transition-all duration-200 transform hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Générer les variantes
              </button>
            </div>
          </div>
          
          {variants.map((variant, index) => (
            <div key={index} className="border p-4 rounded-md mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Variante #{index + 1}</h3>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Supprimer
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`size-${index}`}>
                    Taille *
                  </label>
                  <input
                    type="text"
                    id={`size-${index}`}
                    name="size"
                    value={variant.size}
                    onChange={(e) => handleVariantChange(index, e)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`color-${index}`}>
                    Couleur *
                  </label>
                  <input
                    type="text"
                    id={`color-${index}`}
                    name="color"
                    value={variant.color}
                    onChange={(e) => handleVariantChange(index, e)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                
                {/* Images spécifiques à la variante */}
                <div className="md:col-span-3 mt-2">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Images spécifiques à cette variante
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleVariantImageChange(index, e)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    multiple
                  />
                  <p className="text-xs text-gray-500 mt-1">Ces images seront associées uniquement à cette variante de couleur/taille.</p>
                  
                  {/* Affichage des images téléchargées pour cette variante */}
                  {variant.images.length > 0 && (
                    <div className="mt-2">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {variant.images.map((image, imgIndex) => (
                          <div 
                            key={`variant-${index}-image-${imgIndex}`} 
                            className={`relative rounded-md overflow-hidden border-2 ${image.isPrimary ? 'border-indigo-600' : 'border-gray-200'}`}
                          >
                            <img 
                              src={image.preview} 
                              alt={`Variante ${variant.color} ${variant.size} - Image ${imgIndex + 1}`} 
                              className="h-20 w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                              <div className="flex space-x-1">
                                {!image.isPrimary && (
                                  <button 
                                    type="button"
                                    onClick={() => setVariantImageAsPrimary(index, imgIndex)}
                                    className="bg-indigo-600 text-white p-1 rounded-full hover:bg-indigo-700 transition-colors"
                                    title="Définir comme image principale"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </button>
                                )}
                                <button 
                                  type="button"
                                  onClick={() => removeVariantImage(index, imgIndex)}
                                  className="bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                                  title="Supprimer l'image"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            {image.isPrimary && (
                              <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs px-1 py-0.5 rounded-bl-md">
                                Principale
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`stock-${index}`}>
                    Stock *
                  </label>
                  <input
                    type="number"
                    id={`stock-${index}`}
                    name="stock_quantity"
                    value={variant.stock_quantity}
                    onChange={(e) => handleVariantChange(index, e)}
                    min="0"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`price-adj-${index}`}>
                    Ajustement de Prix (€)
                  </label>
                  <input
                    type="number"
                    id={`price-adj-${index}`}
                    name="price_adjustment"
                    value={variant.price_adjustment}
                    onChange={(e) => handleVariantChange(index, e)}
                    step="0.01"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`sku-${index}`}>
                    SKU
                  </label>
                  <input
                    type="text"
                    id={`sku-${index}`}
                    name="sku"
                    value={variant.sku}
                    onChange={(e) => handleVariantChange(index, e)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer le Produit'}
          </button>
        </div>
      </form>
    </div>
  );
}
