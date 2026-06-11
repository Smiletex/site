import React from 'react';

export default function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    "name": "Smiletex",
    "description": "Spécialiste de la personnalisation de vêtements à Lyon. Impression textile, flocage, broderie pour particuliers et professionnels.",
    "url": "https://www.smiletex.fr",
    "logo": "https://www.smiletex.fr/images/logo_comp.png",
    "image": "https://www.smiletex.fr/images/logo_comp.png",
    "telephone": "+33000000000", // Remplacez par votre vrai numéro
    "email": "contact@smiletex.fr", // Remplacez par votre vrai email
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Rue de Lyon", // Remplacez par votre vraie adresse
      "addressLocality": "Lyon",
      "addressRegion": "Rhône-Alpes",
      "postalCode": "69000",
      "addressCountry": "FR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 45.7578137, // Remplacez par vos vraies coordonnées
      "longitude": 4.8320114
    },
    "openingHours": "Mo,Tu,We,Th,Fr 09:00-18:00", // Ajustez selon vos horaires réels
    "priceRange": "€€",
    "paymentAccepted": "Cash, Credit Card",
    "currenciesAccepted": "EUR",
    "areaServed": ["Lyon", "Villeurbanne", "Rhône-Alpes", "France"],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Vêtements personnalisés",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "T-shirts personnalisés",
            "description": "T-shirts personnalisables avec votre design ou logo"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Sweatshirts personnalisés",
            "description": "Sweatshirts personnalisables avec votre design ou logo"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Polos personnalisés",
            "description": "Polos personnalisables avec votre design ou logo"
          }
        }
      ]
    },
    "makesOffer": [
      {
        "@type": "Offer",
        "name": "Impression textile",
        "description": "Service d'impression textile professionnel"
      },
      {
        "@type": "Offer",
        "name": "Flocage",
        "description": "Service de flocage de vêtements"
      },
      {
        "@type": "Offer",
        "name": "Broderie",
        "description": "Service de broderie personnalisée"
      }
    ],
    "potentialAction": {
      "@type": "OrderAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.smiletex.fr/devis",
        "inLanguage": "fr-FR",
        "actionPlatform": [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform"
        ]
      },
      "result": {
        "@type": "Quote",
        "name": "Devis personnalisé"
      }
    },
    "sameAs": [
      "https://www.facebook.com/smiletex", // Remplacez par vos vrais liens
      "https://www.instagram.com/smiletex",
      "https://twitter.com/smiletex"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
