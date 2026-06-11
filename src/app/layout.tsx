import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Smiletex - Personnalisation de vêtements à Lyon | Impression textile",
  description: "Spécialiste de la personnalisation de vêtements à Lyon. Impression textile, flocage, broderie pour particuliers et professionnels. Devis rapide et livraison sur toute la France.",
  keywords: "personnalisation vêtements lyon, impression textile lyon, flocage vêtements lyon, broderie lyon, t-shirts personnalisés, vêtements sur mesure, impression textile professionnelle, vêtements d'entreprise personnalisés",
  authors: [{ name: "Smiletex" }],
  creator: "Smiletex",
  publisher: "Smiletex",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.smiletex.fr'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Smiletex - Personnalisation de vêtements à Lyon | Impression textile",
    description: "Spécialiste de la personnalisation de vêtements à Lyon. Impression textile, flocage, broderie pour particuliers et professionnels. Devis rapide et livraison sur toute la France.",
    url: 'https://www.smiletex.fr',
    siteName: 'Smiletex',
    images: [
      {
        url: '/images/logo_comp.png',
        width: 800,
        height: 600,
        alt: 'Smiletex - Personnalisation de vêtements à Lyon',
      }
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Smiletex - Personnalisation de vêtements à Lyon",
    description: "Spécialiste de la personnalisation de vêtements à Lyon. Impression textile, flocage, broderie pour particuliers et professionnels.",
    images: ['/images/logo_comp.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: [
    { rel: "icon", url: "/favicon.ico", sizes: "any" },
    { rel: "icon", url: "/images/logo_comp.png" },
    { rel: "apple-touch-icon", url: "/images/logo_comp.png" },
    { rel: "shortcut icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon-precomposed", url: "/images/logo_comp.png" }
  ],
  manifest: "/manifest.json",
  other: {
    "msapplication-TileImage": "/images/logo_comp.png",
    "msapplication-TileColor": "#ffffff",
    "msapplication-config": "none"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="google-site-verification" content="_M_Oh-m-2Nt3STjF8S6dITKn1q6zkS30V37opRpEAe8" />
        <link rel="icon" href="/images/logo_comp.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/images/logo_comp.png" />
        <link rel="apple-touch-icon-precomposed" href="/images/logo_comp.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileImage" content="/images/logo_comp.png" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="geo.region" content="FR-69" />
        <meta name="geo.placename" content="Lyon" />
        <meta name="geo.position" content="45.7578137;4.8320114" />
        <meta name="ICBM" content="45.7578137, 4.8320114" />
        <JsonLd />
        <script dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', function() {
              document.body.classList.add('loaded');
            });
          `
        }} />
      </head>
      <body className="bg-gray-50 min-h-screen flex flex-col">
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
