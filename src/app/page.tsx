'use client';

import { useState, useEffect } from 'react';
import BrandsMarquee from "@/components/home/BrandsMarquee";
import TrustBadge from "@/components/home/TrustBadge";
import TechniquesMarquage from "@/components/home/TechniquesMarquage";
import Hero from "@/components/home/Hero";
import ProductCategories from "@/components/home/ProductCategories";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Inspiration from "@/components/home/Inspiration";
import Testimonials from "@/components/home/Testimonials";
import ProjectStepsSection from "@/components/home/ProjectStepsSection";
import UrgentQuoteSection from "@/components/home/UrgentQuoteSection";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';


type Product = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  base_price: number;
  is_featured: boolean;
  is_new: boolean;
  category: string;
  created_at: string;
  weight_gsm?: number;        // Grammage du tissu en g/m²
  supplier_reference?: string; // Référence du produit chez le fournisseur
};

// Composant pour les courbes souriantes
const SmileCurve = ({ className, color = "text-white", rotate = false }: { className: string; color?: string; rotate?: boolean }) => (
  <svg 
    viewBox="0 0 1200 120" 
    preserveAspectRatio="none" 
    className={`${className} ${color} ${rotate ? 'transform rotate-180' : ''}`}
  >
    <path 
      d="M0,120 L1200,120 L1200,60 C1000,100 800,120 600,80 C400,40 200,60 0,80 L0,120 Z" 
      fill="currentColor" 
    />
  </svg>
);

// Le composant UrgentQuoteForm a été déplacé dans UrgentQuoteSection.tsx

export default function Home() {
  const supabase = createClientComponentClient();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<{[key: string]: Product[]}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  
  const categories = [
    { id: 't-shirt', name: 'T-shirts' },
    { id: 'polo', name: 'Polos' },
    { id: 'sweat', name: 'Sweats' },
    { id: 'pull', name: 'Pulls' },
    { id: 'veste', name: 'Vestes' },
    { id: 'workwear', name: 'Tenues de travail' },
    { id: 'accessoire', name: 'Accessoires' },
    { id: 'bas', name: 'Bas' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Récupérer d'abord les catégories depuis la base de données
        const { data: dbCategories, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');
          
        if (categoriesError) throw categoriesError;
        
        // Mapper les catégories de la base de données avec nos catégories locales
        const categoryMapping: {[key: string]: string} = {};
        const categoryData: {[key: string]: Product[]} = {};
        
        // Initialiser les tableaux vides pour chaque catégorie
        categories.forEach(localCat => {
          // Trouver la catégorie correspondante dans la base de données
          const dbCategory = dbCategories.find(dbCat => 
            dbCat.name.toLowerCase() === localCat.name.toLowerCase() ||
            dbCat.name.toLowerCase().includes(localCat.id.toLowerCase())
          );
          
          if (dbCategory) {
            // Stocker la correspondance entre notre ID local et l'ID de la base de données
            categoryMapping[localCat.id] = dbCategory.id;
            categoryData[localCat.id] = [];
          } else {
            console.log(`Catégorie non trouvée dans la base de données: ${localCat.name}`);
            categoryData[localCat.id] = [];
          }
        });
        
        console.log('Mapping des catégories:', categoryMapping);
        
        // 2. Récupérer tous les produits
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (productsError) throw productsError;
        
        // Filtrer les produits mis en avant
        const featured = products?.filter(product => product.is_featured) || [];
        setFeaturedProducts(featured);
        
        // Organiser les produits par catégorie
        products?.forEach(product => {
          // Pour chaque catégorie dans notre mapping
          Object.entries(categoryMapping).forEach(([localId, dbId]) => {
            // Si le produit appartient à cette catégorie
            if (product.category_id === dbId) {
              categoryData[localId].push(product);
            }
          });
        });
        
        // Log pour débogage
        console.log('Catégories dans la base de données:', dbCategories);
        console.log('Produits par catégorie:', categoryData);
        
        setCategoryProducts(categoryData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Ajout d'une dépendance vide pour éviter les rechargements infinis


  return (
    <>
      <div className="bg-gray-50">
      {/* Hero Section */}
      <Hero />

      {/* Trust Badge */}
      <TrustBadge />

      {/* Catégories de produits */}
      <ProductCategories />

      {/* Marques partenaires */}
      <BrandsMarquee />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Techniques de marquage Section */}
      <TechniquesMarquage />

      {/* Inspiration Section */}
      <Inspiration />
      
      {/* Testimonials */}
      <Testimonials />

      {/* Section des 5 étapes du projet */}
      <ProjectStepsSection />

      {/* Formulaire de devis urgent */}
      <UrgentQuoteSection />
      </div>
    </>
  );
}
