import { supabase } from './client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Vérifie si un bucket existe dans Supabase Storage et le crée si nécessaire
 * @param bucketName Nom du bucket à vérifier/créer
 * @returns true si le bucket existe ou a été créé avec succès
 */
async function ensureBucketExists(bucketName: string): Promise<boolean> {
  try {
    // Vérifier si le bucket existe déjà
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Erreur lors de la vérification des buckets:', listError);
      return false;
    }
    
    // Vérifier si notre bucket existe dans la liste
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (bucketExists) {
      console.log(`Le bucket ${bucketName} existe déjà`);
      return true;
    }
    
    // Si le bucket n'existe pas, essayer de le créer
    console.log(`Le bucket ${bucketName} n'existe pas, tentative de création...`);
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true // Rendre le bucket public pour faciliter l'accès aux images
    });
    
    if (createError) {
      console.error(`Erreur lors de la création du bucket ${bucketName}:`, createError);
      return false;
    }
    
    console.log(`Bucket ${bucketName} créé avec succès`);
    return true;
  } catch (error) {
    console.error('Erreur lors de la vérification/création du bucket:', error);
    return false;
  }
}

/**
 * Télécharge une image vers Supabase Storage et retourne l'URL publique
 * @param file Fichier image à télécharger
 * @param bucket Bucket de stockage (par défaut 'customizations')
 * @returns URL publique de l'image téléchargée
 */
export const uploadImage = async (file: File, bucket: string = 'customizations'): Promise<string> => {
  try {
    // Vérifier que le fichier est une image
    if (!file.type.startsWith('image/')) {
      throw new Error('Le fichier doit être une image');
    }
    
    // S'assurer que le bucket existe
    const bucketExists = await ensureBucketExists(bucket);
    if (!bucketExists) {
      throw new Error(`Impossible d'accéder ou de créer le bucket ${bucket}. Vérifiez vos permissions Supabase.`);
    }
    
    // Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    console.log(`Téléchargement de l'image ${fileName} vers le bucket ${bucket}...`);
    
    // Télécharger le fichier vers Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // Utiliser upsert: true pour écraser si le fichier existe déjà
      });
    
    if (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
      throw new Error(`Erreur de téléchargement: ${error.message}`);
    }
    
    // Obtenir l'URL publique du fichier
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    if (!urlData || !urlData.publicUrl) {
      throw new Error('Impossible d\'obtenir l\'URL publique de l\'image');
    }
    
    console.log(`Image téléchargée avec succès: ${urlData.publicUrl}`);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Erreur lors du téléchargement de l\'image:', error);
    // Convertir l'erreur en message lisible
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    throw new Error(errorMessage);
  }
};

/**
 * Convertit une image en base64 pour prévisualisation
 * @param file Fichier image à convertir
 * @returns Promise avec la chaîne base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
