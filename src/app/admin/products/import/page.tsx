'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Category } from '@/types/products';
import { fetchCategories } from '@/lib/supabase/services/productService';
import { ImportProgress } from './components/sologroup/services/importService';
import SoloGroupImport from './components/sologroup/SoloGroupImport';
import TopTexGroupImport from './components/toptex/TopTexGroupImport';
import ImbretexImport from './components/imbretex/ImbretexImport';

const ProductImportPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<'sologroup' | 'toptex' | 'imbretex'>('sologroup');
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    current: 0,
    total: 0,
    status: '',
    errors: [],
  });
  const [error, setError] = useState<string | null>(null);

  // Charger les catégories au chargement de la page
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fetchedCategories = await fetchCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
        setError('Impossible de charger les catégories. Veuillez réessayer.');
      }
    };

    loadCategories();
  }, []);

  // Changer de fournisseur
  const changeSupplier = (supplier: 'sologroup' | 'toptex' | 'imbretex') => {
    setSelectedSupplier(supplier);
    setError(null);
  };

  // Gérer la progression de l'importation
  const handleImportProgress = (progress: ImportProgress) => {
    setImportProgress(progress);
  };

  return (
    <div className="container mx-auto px-4 py-8 text-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Importation de produits</h1>
        <Link href="/admin/products" className="text-indigo-600 hover:text-indigo-800">
          Retour à la liste des produits
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">1. Sélectionner un fournisseur</h2>
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 font-medium text-sm focus:outline-none ${selectedSupplier === 'sologroup' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => changeSupplier('sologroup')}
          >
            SoloGroup
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm focus:outline-none ${selectedSupplier === 'toptex' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => changeSupplier('toptex')}
          >
            TopTex
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm focus:outline-none ${selectedSupplier === 'imbretex' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => changeSupplier('imbretex')}
          >
            Imbretex
          </button>
        </div>
      </div>

      {selectedSupplier === 'sologroup' && (
        <SoloGroupImport 
        categories={categories} 
        defaultCategory={categories.length > 0 ? categories[0].id : ''}
        onImportComplete={handleImportProgress}
      />
      )}

      {selectedSupplier === 'toptex' && (
       <TopTexGroupImport 
          categories={categories} 
          defaultCategory={categories.length > 0 ? categories[0].id : ''}
          onImportComplete={handleImportProgress}
        />
      )}

      {selectedSupplier === 'imbretex' && (
       <ImbretexImport 
          categories={categories} 
          defaultCategory={categories.length > 0 ? categories[0].id : ''}
          onImportComplete={handleImportProgress}
        />
      )}
    </div>
  );
};

export default ProductImportPage;
