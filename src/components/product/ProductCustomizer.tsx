'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ProductCustomization, SingleCustomization, Face, ContentType } from '@/types/customization';
import { isSingleCustomizationComplete, isCustomizationComplete } from '@/lib/customization';

// Définition des prix pour chaque type de personnalisation et position
const CUSTOMIZATION_PRICES = {
  // Prix par type d'impression (prix de base)
  types: {
    'broderie': 8.50,
    'impression': 5.00,
  },
  // Prix fixes par position (en euros)
  positions: {
    'devant-pec': 7.84,     // Pec gauche = 7,84€
    'devant-pecs': 12.00,    // Deux pecs = 12€
    'devant-centre': 29.60,  // Très grand logo = 29,60€
    'devant-complet': 17.88, // Devant complet = 17,88€
    'dos-haut': 9.40,        // Dos haut (prix ajusté)
    'dos-complet': 33.00,    // Dos complet (prix ajusté)
  },
};

interface ProductCustomizerProps {
  onSave: (customization: ProductCustomization, price: number) => void;
  initialCustomization?: ProductCustomization | null;
  basePrice?: number;
}

// Composant pour afficher les informations sur la position sélectionnée
const PositionInfo = ({ 
  face, 
  position
}: { 
  face: Face, 
  position: string | undefined
}) => {
  if (!position) return null;
  
  // Vérifier si la position sélectionnée correspond à la face actuelle
  const isCurrentFacePosition = position.startsWith(face === 'derriere' ? 'dos' : 'devant');
  if (!isCurrentFacePosition) return null;
  
  // Définir les zones avec leurs noms
  const zones: Record<string, { name: string, description: string }> = {
    'devant-pec': { 
      name: 'Pec Gauche', 
      description: 'Petite zone sur le côté gauche de la poitrine'
    },
    'devant-pecs': { 
      name: 'Deux Pecs', 
      description: 'Zone horizontale couvrant les deux côtés de la poitrine'
    },
    'devant-complet': { 
      name: 'Devant Complet', 
      description: 'Grande zone couvrant l\'ensemble du devant du t-shirt'
    },
    'devant-centre': { 
      name: 'Très grand logo', 
      description: 'Grand logo au centre du t-shirt'
    },
    'dos-haut': { 
      name: 'Haut du Dos', 
      description: 'Zone horizontale en haut du dos'
    },
    'dos-complet': { 
      name: 'Dos Complet', 
      description: 'Grande zone couvrant l\'ensemble du dos du t-shirt'
    }
  };
  
  const zoneInfo = zones[position] || { 
    name: 'Zone personnalisée', 
    description: 'Position personnalisée sur le t-shirt'
  };
  
  return (
    <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
      <h4 className="font-semibold text-indigo-800 mb-1">{zoneInfo.name}</h4>
      <p className="text-sm text-indigo-600">{zoneInfo.description}</p>
    </div>
  );
};

export default function ProductCustomizer({ onSave, initialCustomization = null, basePrice = 0 }: ProductCustomizerProps) {
  console.log('Rendu du composant ProductCustomizer', { initialCustomization, basePrice });
  // Initialisation d'une personnalisation vide
  const emptyCustomization: ProductCustomization = {
    customizations: []
  };
  
  // État pour stocker la personnalisation complète
  const [productCustomization, setProductCustomization] = useState<ProductCustomization>(initialCustomization || emptyCustomization);
  
  // État pour la face actuellement sélectionnée pour la prévisualisation (devant ou derrière)
  const [currentFace, setCurrentFace] = useState<Face>('devant');
  
  // État initial des personnalisations
  const [frontCustomization, setFrontCustomization] = useState<SingleCustomization>({
    type: 'text',
    type_impression: 'impression', // Impression par défaut au lieu de broderie
    face: 'devant', // Pour rétro-compatibilité
    image_url: undefined, // Initialiser explicitement image_url
    position: undefined // Initialiser explicitement position
  });
  
  const [backCustomization, setBackCustomization] = useState<SingleCustomization>({
    type: 'text',
    type_impression: 'impression', // Impression par défaut au lieu de broderie
    face: 'derriere', // Pour rétro-compatibilité
    image_url: undefined, // Initialiser explicitement image_url
    position: undefined // Initialiser explicitement position
  });
  
  // Helper pour obtenir la personnalisation actuelle en fonction de la face
  const getCurrentCustomization = (): SingleCustomization => {
    return currentFace === 'devant' ? frontCustomization : backCustomization;
  };
  
  // Vérifier si la personnalisation avant est active
  const hasFrontCustomization = (): boolean => {
    return !!frontCustomization.position || !!frontCustomization.position_avant;
  };
  
  // Vérifier si la personnalisation arrière est active
  const hasBackCustomization = (): boolean => {
    return !!backCustomization.position || !!backCustomization.position_arriere;
  };
  
  // Fonction pour mettre à jour la personnalisation actuelle
  const updateCurrentCustomization = (updates: Partial<SingleCustomization>) => {
    // Créer une copie pour éviter les modifications directes de l'état
    const updatedValues = { ...updates };
    console.log('Mise à jour de la personnalisation:', updatedValues);
    
    if (currentFace === 'devant') {
      setFrontCustomization(prev => {
        const newState = { ...prev, ...updatedValues };
        console.log('Nouvelle personnalisation avant:', newState);
        return newState;
      });
    } else {
      setBackCustomization(prev => {
        const newState = { ...prev, ...updatedValues };
        console.log('Nouvelle personnalisation arrière:', newState);
        return newState;
      });
    }
    
    // Ne pas déclencher handleSaveOnly() automatiquement ici pour éviter les boucles infinies
    // La sauvegarde sera déclenchée explicitement après les changements importants
  };

  // Types de contenu pour l'avant et l'arrière
  const [frontContentType, setFrontContentType] = useState<'texte' | 'image'>('image');
  const [backContentType, setBackContentType] = useState<'texte' | 'image'>('image');
  
  // Debug: Afficher les états à chaque render
  console.log('=== RENDER DEBUG ===');
  console.log('frontCustomization.position:', frontCustomization.position);
  console.log('backCustomization.position:', backCustomization.position);
  console.log('currentFace:', currentFace);
  console.log('=== FIN RENDER DEBUG ===');
  
  // Helper pour obtenir le type de contenu en fonction de la face actuelle
  const getContentType = (): 'texte' | 'image' => {
    return currentFace === 'devant' ? frontContentType : backContentType;
  };
  
  // Helper pour définir le type de contenu en fonction de la face actuelle
  const setContentType = (type: 'texte' | 'image') => {
    if (currentFace === 'devant') {
      setFrontContentType(type);
    } else {
      setBackContentType(type);
    }
  };
  
  // Helper pour obtenir le type de contenu actuel en fonction de la face
  const getCurrentContentType = (): 'texte' | 'image' => {
    return currentFace === 'devant' ? frontContentType : backContentType;
  };
  
  // État pour stocker le prix total des personnalisations
  const [customizationPrice, setCustomizationPrice] = useState<number>(0);
  
  // État pour suivre si l'initialisation a déjà été faite
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Ne s'exécuter qu'une seule fois au montage du composant
    if (!isInitialized && initialCustomization && initialCustomization.customizations) {
      console.log('Initialisation avec les données existantes:', initialCustomization);
      setProductCustomization(initialCustomization);
      
      // Si des personnalisations existent déjà, charger les personnalisations avant et arrière
      const frontCustom = initialCustomization.customizations.find(c => c.face === 'devant');
      const backCustom = initialCustomization.customizations.find(c => c.face === 'derriere');
      
      if (frontCustom) {
        console.log('Personnalisation avant trouvée:', frontCustom);
        setFrontCustomization(frontCustom);
        // Définir le type sélectionné en fonction de la personnalisation existante
        if (frontCustom.type === 'text') {
          setFrontContentType('texte');
        } else {
          setFrontContentType('image');
        }
        // Définir la face actuelle comme étant devant
        setCurrentFace('devant');
      }
      
      if (backCustom) {
        console.log('Personnalisation arrière trouvée:', backCustom);
        setBackCustomization(backCustom);
        // Si pas de personnalisation avant, utiliser le type de la personnalisation arrière
        if (!frontCustom) {
          if (backCustom.type === 'text') {
            setBackContentType('texte');
          } else {
            setBackContentType('image');
          }
          // Définir la face actuelle comme étant derrière
          setCurrentFace('derriere');
        }
      }
      
      // Calculer le prix initial
      const initialPrice = calculateCustomizationPrice(initialCustomization);
      setCustomizationPrice(initialPrice);
      console.log('Prix total de la personnalisation:', initialPrice.toFixed(2) + '€');
      
      // Marquer comme initialisé
      setIsInitialized(true);
    }
  }, [initialCustomization, isInitialized]);

  // Fonction pour calculer le prix des personnalisations
  const calculateCustomizationPrice = (customization: ProductCustomization): number => {
    let totalPrice = 0;
    
    // Parcourir toutes les personnalisations
    customization.customizations.forEach(custom => {
      if (custom.type_impression) {
        // Prix fixes pour les positions
        let positionPrice = 0;
        
        // Prix pour la position avant
        if (custom.position_avant) {
          const positionCost = CUSTOMIZATION_PRICES.positions[custom.position_avant as keyof typeof CUSTOMIZATION_PRICES.positions] || 0;
          positionPrice += positionCost;
          console.log(`Prix pour position avant ${custom.position_avant}: ${positionCost}€`);
        }
        
        // Prix pour la position arrière
        if (custom.position_arriere) {
          const positionCost = CUSTOMIZATION_PRICES.positions[custom.position_arriere as keyof typeof CUSTOMIZATION_PRICES.positions] || 0;
          positionPrice += positionCost;
          console.log(`Prix pour position arrière ${custom.position_arriere}: ${positionCost}€`);
        }
        
        // Appliquer une réduction de 15% si les deux faces sont personnalisées
        if (custom.position_avant && custom.position_arriere) {
          const reductionAmount = positionPrice * 0.15; // Réduction de 15%
          positionPrice = positionPrice - reductionAmount;
          console.log(`Réduction appliquée pour personnalisation recto-verso: -15% (${reductionAmount.toFixed(2)}€)`);
        }
        
        // Ajouter au prix total
        totalPrice += positionPrice;
        console.log(`Prix total de la personnalisation: ${positionPrice.toFixed(2)}€`);
      }
    });
    
    // Mettre à jour l'état du prix
    setCustomizationPrice(totalPrice);
    
    return totalPrice;
  };
  
  // Fonction pour sauvegarder les personnalisations (définie avec useCallback pour éviter les références circulaires)
  const handleSaveOnly = useCallback(() => {
    console.log('Début de la sauvegarde des personnalisations');
    console.log('État actuel - Front:', {
      position: frontCustomization.position,
      type: frontCustomization.type,
      type_impression: frontCustomization.type_impression,
      image_url: frontCustomization.image_url ? 'Présent (longueur: ' + frontCustomization.image_url.length + ')' : 'Absent'
    });
    console.log('État actuel - Back:', {
      position: backCustomization.position,
      type: backCustomization.type,
      type_impression: backCustomization.type_impression,
      image_url: backCustomization.image_url ? 'Présent (longueur: ' + backCustomization.image_url.length + ')' : 'Absent'
    });
    console.log('Types de contenu - Front:', frontContentType, 'Back:', backContentType);
    
    // Créer deux objets de personnalisation distincts (un pour l'avant et un pour l'arrière)
    const updatedCustomizations = [];
    
    // Personnalisation pour l'avant
    if (frontCustomization.position) {
      const frontType = frontContentType === 'texte' ? 'text' : 'image';
      const frontCustomizationObj: SingleCustomization = {
        face: 'devant',
        type: frontType,
        type_impression: frontCustomization.type_impression || 'impression',
        position: frontCustomization.position,
        
        // Informations spécifiques au type
        texte: frontType === 'text' ? (frontCustomization.texte || '') : undefined,
        couleur_texte: frontType === 'text' ? (frontCustomization.couleur_texte || '#000000') : undefined,
        police: frontType === 'text' ? (frontCustomization.police || 'Arial') : undefined,
        image_url: frontType === 'image' ? frontCustomization.image_url : undefined,
      };
      
      // Vérification supplémentaire pour s'assurer que l'URL de l'image est bien définie
      if (frontType === 'image' && frontCustomization.image_url) {
        console.log('Image avant détectée et sauvegardée, longueur:', frontCustomization.image_url.length);
        console.log('Début de l\'image avant:', frontCustomization.image_url.substring(0, 50) + '...');
      } else if (frontType === 'image') {
        console.warn('Type image sélectionné pour l\'avant mais aucune image_url trouvée');
      }
      
      updatedCustomizations.push(frontCustomizationObj);
      console.log('Personnalisation avant ajoutée:', {
        face: frontCustomizationObj.face,
        type: frontCustomizationObj.type,
        position: frontCustomizationObj.position,
        image_url: frontCustomizationObj.image_url ? 'Présent' : 'Absent'
      });
    }
    
    // Personnalisation pour l'arrière
    if (backCustomization.position) {
      const backType = backContentType === 'texte' ? 'text' : 'image';
      const backCustomizationObj: SingleCustomization = {
        face: 'derriere',
        type: backType,
        type_impression: backCustomization.type_impression || 'impression',
        position: backCustomization.position,
        
        // Informations spécifiques au type
        texte: backType === 'text' ? (backCustomization.texte || '') : undefined,
        couleur_texte: backType === 'text' ? (backCustomization.couleur_texte || '#000000') : undefined,
        police: backType === 'text' ? (backCustomization.police || 'Arial') : undefined,
        image_url: backType === 'image' ? backCustomization.image_url : undefined,
      };
      
      // Vérification supplémentaire pour s'assurer que l'URL de l'image est bien définie
      if (backType === 'image' && backCustomization.image_url) {
        console.log('Image arrière détectée et sauvegardée, longueur:', backCustomization.image_url.length);
        console.log('Début de l\'image arrière:', backCustomization.image_url.substring(0, 50) + '...');
      } else if (backType === 'image') {
        console.warn('Type image sélectionné pour l\'arrière mais aucune image_url trouvée');
      }
      
      updatedCustomizations.push(backCustomizationObj);
      console.log('Personnalisation arrière ajoutée:', {
        face: backCustomizationObj.face,
        type: backCustomizationObj.type,
        position: backCustomizationObj.position,
        image_url: backCustomizationObj.image_url ? 'Présent' : 'Absent'
      });
    }
    
    // Créer l'objet final de personnalisation
    const finalProductCustomization: ProductCustomization = {
      customizations: updatedCustomizations
    };
    
    // Calculer le prix en fonction des positions sélectionnées avec les prix fixes
    let totalPrice = 0;
    
    // Prix fixes pour les positions
    let positionPrice = 0;
    
    // Prix pour la position avant
    if (frontCustomization.position) {
      const positionCost = CUSTOMIZATION_PRICES.positions[frontCustomization.position as keyof typeof CUSTOMIZATION_PRICES.positions] || 0;
      positionPrice += positionCost;
      console.log(`Prix pour position avant ${frontCustomization.position}: ${positionCost}€`);
    }
    
    // Prix pour la position arrière
    if (backCustomization.position) {
      const positionCost = CUSTOMIZATION_PRICES.positions[backCustomization.position as keyof typeof CUSTOMIZATION_PRICES.positions] || 0;
      positionPrice += positionCost;
      console.log(`Prix pour position arrière ${backCustomization.position}: ${positionCost}€`);
    }
    
    // Appliquer une réduction de 15% si les deux faces sont personnalisées
    if (frontCustomization.position && backCustomization.position) {
      const reductionAmount = positionPrice * 0.15; // Réduction de 15%
      positionPrice = positionPrice - reductionAmount;
      console.log(`Réduction appliquée pour personnalisation recto-verso: -15% (${reductionAmount.toFixed(2)}€)`);
    }
    
    // Le prix total est simplement le prix des positions
    totalPrice = positionPrice;
    console.log(`Prix final de la personnalisation: ${totalPrice.toFixed(2)}€`);
    
    // Mettre à jour l'état global
    setProductCustomization(finalProductCustomization);
    setCustomizationPrice(totalPrice);
    
    // Envoyer la personnalisation avec le prix
    console.log('Sauvegarde des personnalisations terminée:', finalProductCustomization, 'Prix:', totalPrice);
    onSave(finalProductCustomization, totalPrice);
  }, [frontCustomization, backCustomization, frontContentType, backContentType, onSave]);
  
  // Effet pour déclencher la sauvegarde lorsque les personnalisations changent
  // Désactivé temporairement pour éviter les boucles infinies
  // Effet pour déclencher la sauvegarde automatique lorsque les personnalisations changent
  useEffect(() => {
    // Vérifier si les personnalisations ont été initialisées
    if (!frontCustomization && !backCustomization) return;
    
    // Vérifier si les personnalisations ont changé par rapport à l'état initial
    const initialFront = initialCustomization?.customizations?.find(c => c.face === 'devant');
    const initialBack = initialCustomization?.customizations?.find(c => c.face === 'derriere');
    
    const hasChanges = JSON.stringify(frontCustomization) !== JSON.stringify(initialFront) || 
                      JSON.stringify(backCustomization) !== JSON.stringify(initialBack);
    
    if (hasChanges) {
      console.log('Personnalisations modifiées, déclenchement de la sauvegarde automatique');
      // Utiliser un délai pour éviter les sauvegardes trop fréquentes
      const saveTimer = setTimeout(() => {
        handleSaveOnly();
      }, 800); // Délai légèrement plus long pour éviter les sauvegardes trop fréquentes
      
      // Nettoyer le timer si le composant est démonté ou si les personnalisations changent à nouveau
      return () => clearTimeout(saveTimer);
    }
  }, [frontCustomization, backCustomization, handleSaveOnly, initialCustomization]);

  // Fonction pour mettre à jour le texte sur les deux faces
  const updateTexte = (texte: string) => {
    // Mettre à jour le texte pour la face actuelle
    if (currentFace === 'devant') {
      setFrontCustomization(prev => ({
        ...prev,
        texte,
        type: 'text',
        image_url: undefined
      }));
    } else {
      setBackCustomization(prev => ({
        ...prev,
        texte,
        type: 'text',
        image_url: undefined
      }));
    }
    
    // Synchroniser le texte sur l'autre face si elle a une position sélectionnée
    if (currentFace === 'devant' && backCustomization.position) {
      setBackCustomization(prev => ({
        ...prev,
        texte,
        type: 'text',
        image_url: undefined
      }));
    } else if (currentFace === 'derriere' && frontCustomization.position) {
      setFrontCustomization(prev => ({
        ...prev,
        texte,
        type: 'text',
        image_url: undefined
      }));
    }
    
    // Mettre à jour le type sélectionné
    setContentType('texte');
    
    // Déclencher la mise à jour des personnalisations
    setTimeout(() => handleSaveOnly(), 50);
  };

  const switchPreviewFace = (newFace: Face) => {
    // Mettre à jour la face pour la prévisualisation
    setCurrentFace(newFace);
  };
  
  // Fonction pour mettre à jour la couleur du texte sur les deux faces
  const updateCouleurTexte = (couleur: string) => {
    // Mettre à jour la couleur pour la face actuelle
    if (currentFace === 'devant') {
      setFrontCustomization(prev => ({
        ...prev,
        couleur_texte: couleur
      }));
    } else {
      setBackCustomization(prev => ({
        ...prev,
        couleur_texte: couleur
      }));
    }
    
    // Synchroniser la couleur sur l'autre face si elle a une position sélectionnée et un texte
    if (currentFace === 'devant' && backCustomization.position && backCustomization.texte) {
      setBackCustomization(prev => ({
        ...prev,
        couleur_texte: couleur
      }));
    } else if (currentFace === 'derriere' && frontCustomization.position && frontCustomization.texte) {
      setFrontCustomization(prev => ({
        ...prev,
        couleur_texte: couleur
      }));
    }
    
    // Déclencher la mise à jour des personnalisations
    setTimeout(() => handleSaveOnly(), 50);
  };

  // Fonction pour mettre à jour le type d'impression sur les deux faces
  const updateImpression = (type: string) => {
    console.log(`Mise à jour du type d'impression: ${type}`);
    
    // Mettre à jour le type d'impression pour la face actuelle
    if (currentFace === 'devant') {
      setFrontCustomization(prev => ({
        ...prev,
        type_impression: type
      }));
    } else {
      setBackCustomization(prev => ({
        ...prev,
        type_impression: type
      }));
    }
    
    // Synchroniser le type d'impression sur l'autre face si elle a une position sélectionnée
    if (currentFace === 'devant' && (backCustomization.position || backCustomization.position_arriere)) {
      setBackCustomization(prev => ({
        ...prev,
        type_impression: type
      }));
    } else if (currentFace === 'derriere' && (frontCustomization.position || frontCustomization.position_avant)) {
      setFrontCustomization(prev => ({
        ...prev,
        type_impression: type
      }));
    }
    
    // Déclencher immédiatement la mise à jour des personnalisations pour mettre à jour le prix
    handleSaveOnly();
  };

  // Fonction pour mettre à jour la position avant
  const updateFrontPosition = (position: string) => {
    console.log('Mise à jour de la position avant:', position);
    // Vérifier si on clique sur la position déjà sélectionnée (pour décocher)
    if (frontCustomization.position === position) {
      // Désélectionner la position (mettre à undefined)
      setFrontCustomization(prev => {
        const newState = {
          ...prev,
          position: undefined as unknown as string, // Type cast pour satisfaire TypeScript
          position_avant: undefined
        };
        console.log('Position avant désélectionnée:', newState);
        return newState;
      });
    } else {
      // Mettre à jour la position avant et synchroniser le type d'impression et le type avec la face arrière
      setFrontCustomization(prev => {
        // Utiliser le type d'impression et le type de la face arrière si disponible
        const type_impression = backCustomization.type_impression || prev.type_impression;
        const type = backCustomization.type || prev.type;
        
        // Synchroniser les informations d'image ou de texte
        let updatedState = { 
          ...prev, 
          position, // Pour rétro-compatibilité
          position_avant: position,
          type_impression,
          type
        };
        
        // Conserver le type de contenu actuel (image ou texte) pour la position avant
        if (frontContentType === 'image') {
          // Si le type de contenu est image, s'assurer que le type est correctement défini
          updatedState.type = 'image';
          // Garder l'image existante si elle existe
          updatedState.texte = undefined;
          updatedState.couleur_texte = undefined;
          updatedState.police = undefined;
        } 
        else if (frontContentType === 'texte') {
          // Si le type de contenu est texte, s'assurer que le type est correctement défini
          updatedState.type = 'text';
          // Garder le texte existant si il existe
          updatedState.image_url = undefined;
        }
        
        console.log('Nouvelle position avant avec synchronisation:', updatedState);
        return updatedState;
      });
    }
    
    // Passer à la prévisualisation avant sans changer la face si on est déjà sur cette face
    if (currentFace !== 'devant') {
      setCurrentFace('devant');
    }
  };

  // Fonction pour mettre à jour la position arrière
  const updateBackPosition = (position: string) => {
    console.log('=== DEBUG updateBackPosition ===');
    console.log('Position demandée:', position);
    console.log('Position actuelle backCustomization.position:', backCustomization.position);
    console.log('Comparaison (backCustomization.position === position):', backCustomization.position === position);
    console.log('Type de backCustomization.position:', typeof backCustomization.position);
    console.log('Type de position:', typeof position);
    console.log('backCustomization complet:', backCustomization);
    console.log('=== FIN DEBUG ===');
    
    // Vérifier si on clique sur la position déjà sélectionnée (pour décocher)
    if (backCustomization.position === position) {
      // Désélectionner la position (mettre à undefined)
      setBackCustomization(prev => {
        const newState = {
          ...prev,
          position: undefined as unknown as string, // Type cast pour satisfaire TypeScript
          position_arriere: undefined
        };
        console.log('Position arrière désélectionnée:', newState);
        return newState;
      });
    } else {
      console.log('ELSE: Mise à jour de la position arrière vers:', position);
      // Mettre à jour la position arrière et synchroniser le type d'impression et le type avec la face avant
      setBackCustomization(prev => {
        // Utiliser le type d'impression et le type de la face avant si disponible
        const type_impression = frontCustomization.type_impression || prev.type_impression;
        const type = frontCustomization.type || prev.type;
        
        // Synchroniser les informations d'image ou de texte
        let updatedState = { 
          ...prev, 
          position, // Pour rétro-compatibilité
          position_arriere: position,
          type_impression,
          type
        };
        
        // Conserver le type de contenu actuel (image ou texte) pour la position arrière
        if (backContentType === 'image') {
          // Si le type de contenu est image, s'assurer que le type est correctement défini
          updatedState.type = 'image';
          // Garder l'image existante si elle existe
          updatedState.texte = undefined;
          updatedState.couleur_texte = undefined;
          updatedState.police = undefined;
        } 
        else if (backContentType === 'texte') {
          // Si le type de contenu est texte, s'assurer que le type est correctement défini
          updatedState.type = 'text';
          // Garder le texte existant si il existe
          updatedState.image_url = undefined;
        }
        
        console.log('Nouvelle position arrière avec synchronisation:', updatedState);
        return updatedState;
      });
    }
    
    // Passer à la prévisualisation arrière sans changer la face si on est déjà sur cette face
    if (currentFace !== 'derriere') {
      setCurrentFace('derriere');
    }
    
    // Appeler handleSaveOnly après la mise à jour pour recalculer le prix
    // Utiliser un setTimeout pour s'assurer que l'état a été mis à jour
    setTimeout(() => {
      console.log('Appel de handleSaveOnly après mise à jour de la position arrière');
      handleSaveOnly();
    }, 50);
  };
  

  
  // Cette fonction n'est plus nécessaire car nous n'avons plus besoin de fermer le composant
  // Nous utilisons uniquement handleSaveOnly maintenant

  const isFormValid = () => {
    const frontValid = isSingleCustomizationComplete({
      ...frontCustomization,
      type: frontContentType === 'texte' ? 'text' : 'image'
    });
    
    const backValid = isSingleCustomizationComplete({
      ...backCustomization,
      type: backContentType === 'texte' ? 'text' : 'image'
    });
    
    // Le formulaire est valide si au moins une des personnalisations est complète
    const isValid = frontValid || backValid;
    console.log('Validation du formulaire:', { frontValid, backValid, isValid });
    return isValid;
  };
  


  return (
    <div className="bg-white w-full">
        {/* Options de personnalisation */}
        <div className="col-span-1 lg:col-span-9 space-y-6 w-full">
          {/* Section 1: Type d'impression */}
          <div className="mb-8 pb-6 bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-sm w-full flex flex-col items-center">
                  <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    Type d'impression
                  </h3>
                  <div className="flex justify-center gap-4 sm:gap-8 md:gap-16 lg:gap-24 mt-2">
                    <button
                      className={`relative overflow-hidden rounded-lg transition-all duration-200 w-32 sm:w-36 md:w-40 ${backCustomization.type_impression === 'impression' ? 'ring-2 ring-indigo-600 shadow-md' : 'border border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
                      onClick={() => setBackCustomization(prev => ({ ...prev, type_impression: 'impression' }))}
                    >
                      <div className="h-32 bg-gray-50 overflow-hidden relative">
                        <Image
                          src="/images/flocage.jpg"
                          alt="Impression"
                          fill
                          className="object-cover"
                        />
                        {backCustomization.type_impression === 'impression' && (
                          <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1 shadow-md z-10">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-2 bg-white text-center border-t">
                        <div className="flex items-center justify-center">
                          <svg className="w-4 h-4 mr-1 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                          </svg>
                          <span className="font-medium">Impression</span>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      className={`relative overflow-hidden rounded-lg transition-all duration-200 w-32 sm:w-36 md:w-40 ${backCustomization.type_impression === 'broderie' ? 'ring-2 ring-indigo-600 shadow-md' : 'border border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
                      onClick={() => setBackCustomization(prev => ({ ...prev, type_impression: 'broderie' }))}
                    >
                      <div className="h-32 bg-gray-50 overflow-hidden relative">
                        <Image
                          src="/images/broderie.png"
                          alt="Broderie"
                          fill
                          className="object-cover"
                        />
                        {backCustomization.type_impression === 'broderie' && (
                          <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1 shadow-md z-10">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-2 bg-white text-center border-t">
                        <div className="flex items-center justify-center">
                          <svg className="w-4 h-4 mr-1 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span className="font-medium">Broderie</span>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Section 2: Position */}
                <div className="mb-8 pb-6 bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Position
                  </h3>
                  
                    <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center justify-center">
                      <svg className="w-4 h-4 mr-1.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      Position Avant
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 max-w-3xl mx-auto">
                      <button
                        className={`relative overflow-hidden rounded-lg transition-all duration-200 w-full ${frontCustomization.position === 'devant-pec' ? 'ring-2 ring-indigo-600 shadow-md' : 'border border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
                        onClick={() => updateFrontPosition('devant-pec')}
                      >
                        <div className="bg-gray-50 overflow-hidden relative" style={{ height: '100px' }}>
                          <Image
                            src="/images/positions/devant-pec.png"
                            alt="Pec Gauche"
                            fill
                            className="object-contain p-1"
                          />
                          {frontCustomization.position === 'devant-pec' && (
                            <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1 shadow-md z-10">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-1 bg-white text-center border-t text-sm">
                          <div className="flex items-center justify-center">
                            <svg className="w-4 h-4 mr-1 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            <span className="font-medium">Pec Gauche</span>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        className={`relative overflow-hidden rounded-lg transition-all duration-200 w-full ${frontCustomization.position === 'devant-pecs' ? 'ring-2 ring-indigo-600 shadow-md' : 'border border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
                        onClick={() => updateFrontPosition('devant-pecs')}
                      >
                        <div className="bg-gray-50 overflow-hidden relative" style={{ height: '100px' }}>
                          <Image
                            src="/images/positions/devant-pecs.png"
                            alt="Deux Pecs"
                            fill
                            className="object-contain p-1"
                          />
                          {frontCustomization.position === 'devant-pecs' && (
                            <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1 shadow-md z-10">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-1 bg-white text-center border-t text-sm">
                          <div className="flex items-center justify-center">
                            <svg className="w-4 h-4 mr-1 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            <span className="font-medium">Deux Pecs</span>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        className={`relative overflow-hidden rounded-lg transition-all duration-200 w-full ${frontCustomization.position === 'devant-complet' ? 'ring-2 ring-indigo-600 shadow-md' : 'border border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
                        onClick={() => updateFrontPosition('devant-complet')}
                      >
                        <div className="bg-gray-50 overflow-hidden relative" style={{ height: '100px' }}>
                          <Image
                            src="/images/positions/devant-complet.png"
                            alt="Devant Complet"
                            fill
                            className="object-contain p-1"
                          />
                          {frontCustomization.position === 'devant-complet' && (
                            <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1 shadow-md z-10">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-1 bg-white text-center border-t text-sm">
                          <div className="flex items-center justify-center">
                            <svg className="w-4 h-4 mr-1 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            <span className="font-medium">Grand Logo</span>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        className={`relative overflow-hidden rounded-lg transition-all duration-200 w-full ${frontCustomization.position === 'devant-centre' ? 'ring-2 ring-indigo-600 shadow-md' : 'border border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
                        onClick={() => updateFrontPosition('devant-centre')}
                      >
                        <div className="bg-gray-50 overflow-hidden relative" style={{ height: '100px' }}>
                          <Image
                            src="/images/positions/devant-centre.png"
                            alt="Centre"
                            fill
                            className="object-contain p-1"
                          />
                          {frontCustomization.position === 'devant-centre' && (
                            <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1 shadow-md z-10">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-1 bg-white text-center border-t text-sm">
                          <div className="flex items-center justify-center">
                            <svg className="w-4 h-4 mr-1 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            <span className="font-medium">Très grand logo</span>
                          </div>
                        </div>
                      </button>
                    </div>

                  {/* Section: Contenu pour l'avant */}
                  <h3 className="font-bold text-gray-800 text-lg mb-4 mt-6 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Contenu de la personnalisation Avant
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    <button
                      className={`p-4 border rounded-lg transition-all duration-200 flex flex-col items-center justify-center ${frontContentType === 'image' ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                      onClick={() => setFrontContentType('image')}
                    >
                      <svg className="w-6 h-6 mb-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium">Image</span>
                    </button>
                    
                    <button
                      className={`p-4 border rounded-lg transition-all duration-200 flex flex-col items-center justify-center ${frontContentType === 'texte' ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                      onClick={() => setFrontContentType('texte')}
                    >
                      <svg className="w-6 h-6 mb-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                      <span className="text-sm font-medium">Texte</span>
                    </button>
                  </div>
                  
                  {/* Contenu spécifique pour l'avant selon le type sélectionné */}
                  {frontContentType === 'texte' ? (
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Votre texte (Avant)
                        </label>
                        <input
                          type="text"
                          value={frontCustomization.texte || ''}
                          onChange={(e) => setFrontCustomization(prev => ({ ...prev, texte: e.target.value, type: 'text' }))}
                          className="w-full p-2 border rounded-md"
                          placeholder="Entrez votre texte pour l'avant"
                          style={{ fontFamily: frontCustomization.police || 'Arial' }}
                        />
                        {frontCustomization.texte && (
                          <div className="mt-2 p-3 border border-gray-200 rounded-md bg-white">
                            <p 
                              className="text-center" 
                              style={{ 
                                fontFamily: frontCustomization.police || 'Arial',
                                color: frontCustomization.couleur_texte || '#000000',
                                fontSize: '18px'
                              }}
                            >
                              {frontCustomization.texte}
                            </p>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Couleur
                        </label>
                        <input
                          type="color"
                          value={frontCustomization.couleur_texte || '#000000'}
                          onChange={(e) => setFrontCustomization(prev => ({ ...prev, couleur_texte: e.target.value }))}
                          className="w-full h-10 p-1 border rounded-md"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Choisir l'image pour l'avant
                      </label>
                      <div className="space-y-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              console.log('Fichier sélectionné pour l\'avant:', file.name, file.size);
                              try {
                                // Vérifier la taille du fichier (max 5 Mo)
                                const maxSize = 5 * 1024 * 1024; // 5 Mo en octets
                                if (file.size > maxSize) {
                                  throw new Error(`L'image est trop volumineuse. Taille maximale: 5 Mo`);
                                }
                                
                                // Convertir le fichier en base64 pour stockage permanent
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  if (event.target?.result) {
                                    // Stocker directement le base64 comme valeur de image_url
                                    const base64String = event.target.result as string;
                                    console.log('Image avant convertie en base64, longueur:', base64String.length);
                                    
                                    // Mettre à jour le type de contenu
                                    setFrontContentType('image');
                                    
                                    // Mettre à jour la personnalisation avant avec l'image en base64
                                    // Utiliser le type ContentType correct pour éviter les erreurs TypeScript
                                    const imageType: ContentType = 'image';
                                    
                                    const updatedCustomization: SingleCustomization = {
                                      ...frontCustomization,
                                      image_url: base64String,
                                      type: imageType
                                    };
                                    
                                    // Mettre à jour l'état
                                    setFrontCustomization(updatedCustomization);
                                    
                                    // Afficher les données pour débogage
                                    console.log('Base64 avant sauvegardé:', base64String.substring(0, 50) + '...');
                                    console.log('Mise à jour de frontCustomization avec image_url:', updatedCustomization.image_url ? 'Présent' : 'Absent');
                                    
                                    // Pas besoin de forcer la sauvegarde ici pour éviter les boucles infinies
                                    // L'image est déjà sauvegardée dans l'état local
                                  }
                                };
                                reader.onerror = (error) => {
                                  console.error('Erreur FileReader:', error);
                                  alert('Erreur lors de la lecture du fichier. Veuillez réessayer.');
                                };
                                reader.readAsDataURL(file);
                              } catch (error) {
                                // Récupérer le message d'erreur
                                const errorMessage = error instanceof Error 
                                  ? error.message 
                                  : 'Erreur inconnue lors du chargement';
                                
                                console.error('Erreur lors du chargement de l\'image avant:', error);
                                alert(`Erreur: ${errorMessage}`);
                              }
                            }
                          }}
                          className="w-full p-2 border rounded-md"
                          title="Choisir l'image pour l'avant"
                        />
                        
                        {frontCustomization.image_url && (
                          <div className="flex flex-col items-center mt-3">
                            <div className="relative h-32 w-32 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img 
                                src={frontCustomization.image_url} 
                                alt="Aperçu de l'image avant" 
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <p className="text-xs text-green-600 mt-1">Image avant prête à être utilisée</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center justify-center">
                      <svg className="w-4 h-4 mr-1.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      Position Arrière
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 max-w-3xl mx-auto">

                      <button
                        className={`relative overflow-hidden rounded-lg transition-all duration-200 w-32 ${backCustomization.position === 'dos-haut' ? 'ring-2 ring-indigo-600 shadow-md' : 'border border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
                        onClick={() => {
                          console.log('BOUTON HAUT DU DOS CLIQUÉ !');
                          updateBackPosition('dos-haut');
                        }}
                      >
                        <div className="bg-gray-50 overflow-hidden relative" style={{ height: '100px' }}>
                          <Image
                            src="/images/positions/dos-haut.png"
                            alt="Haut du Dos"
                            fill
                            className="object-contain p-1"
                          />
                          {backCustomization.position === 'dos-haut' && (
                            <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1 shadow-md z-10">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-1 bg-white text-center border-t text-sm">
                          <div className="flex items-center justify-center">
                            <svg className="w-4 h-4 mr-1 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            <span className="font-medium">Haut du Dos</span>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        className={`relative overflow-hidden rounded-lg transition-all duration-200 w-32 ${backCustomization.position === 'dos-complet' ? 'ring-2 ring-indigo-600 shadow-md' : 'border border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
                        onClick={() => {
                          console.log('BOUTON DOS COMPLET CLIQUÉ !');
                          updateBackPosition('dos-complet');
                        }}
                      >
                        <div className="bg-gray-50 overflow-hidden relative" style={{ height: '100px' }}>
                          <Image
                            src="/images/positions/dos-complet.png"
                            alt="Dos Complet"
                            fill
                            className="object-contain p-1"
                          />
                          {backCustomization.position === 'dos-complet' && (
                            <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1 shadow-md z-10">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-1 bg-white text-center border-t text-sm">
                          <div className="flex items-center justify-center">
                            <svg className="w-4 h-4 mr-1 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            <span className="font-medium">Dos Complet</span>
                          </div>
                        </div>
                      </button>
                    </div>
                
                {/* Section 3: Contenu */}
                  <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Contenu de la personnalisation Arrière
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    <button
                      className={`p-4 border rounded-lg transition-all duration-200 flex flex-col items-center justify-center ${backContentType === 'image' ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                      onClick={() => setBackContentType('image')}
                    >
                      <svg className="w-8 h-8 mb-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">Image</span>
                    </button>
                    <button
                      className={`p-4 border rounded-lg transition-all duration-200 flex flex-col items-center justify-center ${backContentType === 'texte' ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                      onClick={() => setBackContentType('texte')}
                    >
                      <svg className="w-8 h-8 mb-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="font-medium">Texte</span>
                    </button>
                  </div>

                  {backContentType === 'texte' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Votre texte
                        </label>
                        <input
                          type="text"
                          value={backCustomization.texte || ''}
                          onChange={(e) => setBackCustomization(prev => ({ ...prev, texte: e.target.value, type: 'text' }))}
                          className="w-full p-2 border rounded-md"
                          placeholder="Entrez votre texte pour l'arrière"
                          style={{ fontFamily: backCustomization.police || 'Arial' }}
                        />
                        {backCustomization.texte && (
                          <div className="mt-2 p-3 border border-gray-200 rounded-md bg-white">
                            <p 
                              className="text-center" 
                              style={{ 
                                fontFamily: backCustomization.police || 'Arial',
                                color: backCustomization.couleur_texte || '#000000',
                                fontSize: '18px'
                              }}
                            >
                              {backCustomization.texte}
                            </p>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Couleur
                        </label>
                        <input
                          type="color"
                          value={backCustomization.couleur_texte || '#000000'}
                          onChange={(e) => setBackCustomization(prev => ({ ...prev, couleur_texte: e.target.value }))}
                          className="w-full h-10 p-1 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Police
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                          <button
                            type="button"
                            onClick={() => setBackCustomization(prev => ({ ...prev, police: 'Arial' }))}
                            className={`p-3 border ${backCustomization.police === 'Arial' ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600' : 'border-gray-300'} rounded-lg transition-all hover:border-indigo-400`}
                          >
                            <p style={{ fontFamily: 'Arial' }} className="text-center font-medium">
                              Arial
                            </p>
                            <p style={{ fontFamily: 'Arial' }} className="text-xs text-gray-500 mt-1">
                              ABCDEFG abcdefg
                            </p>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => setBackCustomization(prev => ({ ...prev, police: 'Helvetica' }))}
                            className={`p-3 border ${backCustomization.police === 'Helvetica' ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600' : 'border-gray-300'} rounded-lg transition-all hover:border-indigo-400`}
                          >
                            <p style={{ fontFamily: 'Helvetica' }} className="text-center font-medium">
                              Helvetica
                            </p>
                            <p style={{ fontFamily: 'Helvetica' }} className="text-xs text-gray-500 mt-1">
                              ABCDEFG abcdefg
                            </p>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => setBackCustomization(prev => ({ ...prev, police: 'Times New Roman' }))}
                            className={`p-3 border ${backCustomization.police === 'Times New Roman' ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600' : 'border-gray-300'} rounded-lg transition-all hover:border-indigo-400`}
                          >
                            <p style={{ fontFamily: '"Times New Roman"' }} className="text-center font-medium">
                              Times New Roman
                            </p>
                            <p style={{ fontFamily: '"Times New Roman"' }} className="text-xs text-gray-500 mt-1">
                              ABCDEFG abcdefg
                            </p>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Choisir l'image pour l'arrière
                      </label>
                      <div className="space-y-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              console.log('Fichier sélectionné pour l\'arrière:', file.name, file.size);
                              try {
                                // Vérifier la taille du fichier (max 5 Mo)
                                const maxSize = 5 * 1024 * 1024; // 5 Mo en octets
                                if (file.size > maxSize) {
                                  throw new Error(`L'image est trop volumineuse. Taille maximale: 5 Mo`);
                                }
                                
                                // Convertir le fichier en base64 pour stockage permanent
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  if (event.target?.result) {
                                    // Stocker directement le base64 comme valeur de image_url
                                    const base64String = event.target.result as string;
                                    console.log('Image arrière convertie en base64, longueur:', base64String.length);
                                    
                                    // Mettre à jour le type de contenu
                                    setBackContentType('image');
                                    
                                    // Mettre à jour la personnalisation arrière avec l'image en base64
                                    // Utiliser le type ContentType correct pour éviter les erreurs TypeScript
                                    const imageType: ContentType = 'image';
                                    
                                    const updatedCustomization: SingleCustomization = {
                                      ...backCustomization,
                                      image_url: base64String,
                                      type: imageType
                                    };
                                    
                                    // Mettre à jour l'état
                                    setBackCustomization(updatedCustomization);
                                    
                                    // Afficher les données pour débogage
                                    console.log('Base64 arrière sauvegardé:', base64String.substring(0, 50) + '...');
                                    console.log('Mise à jour de backCustomization avec image_url:', updatedCustomization.image_url ? 'Présent' : 'Absent');
                                    
                                    // Pas besoin de forcer la sauvegarde ici pour éviter les boucles infinies
                                    // L'image est déjà sauvegardée dans l'état local
                                  }
                                };
                                reader.onerror = (error) => {
                                  console.error('Erreur FileReader:', error);
                                  alert('Erreur lors de la lecture du fichier. Veuillez réessayer.');
                                };
                                reader.readAsDataURL(file);
                              } catch (error) {
                                // Récupérer le message d'erreur
                                const errorMessage = error instanceof Error 
                                  ? error.message 
                                  : 'Erreur inconnue lors du chargement';
                                
                                console.error('Erreur lors du chargement de l\'image arrière:', error);
                                alert(`Erreur: ${errorMessage}`);
                              }
                            }
                          }}
                          className="w-full p-2 border rounded-md"
                          title="Choisir l'image pour l'arrière"
                        />
                        
                        {backCustomization.image_url && (
                          <div className="flex flex-col items-center mt-3">
                            <div className="relative h-32 w-32 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img 
                                src={backCustomization.image_url} 
                                alt="Aperçu de l'image arrière" 
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <p className="text-xs text-green-600 mt-1">Image arrière prête à être utilisée</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
  );
};
