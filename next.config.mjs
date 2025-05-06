import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const withTM = require('next-transpile-modules')(['fabric']);

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['flivdthkxkcxyeaescrk.supabase.co'],
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    
    // Ajouter une règle pour gérer les importations de fabric.js
    config.module.rules.push({
      test: /fabric(\.node)?\.js$/,
      use: {
        loader: 'null-loader',
      },
    });

    // Ajouter le support pour les fichiers CSS
    config.module.rules.push({
      test: /\.css$/,
      use: ['style-loader', 'css-loader', 'postcss-loader'],
    });
    
    // Ajouter une condition pour vérifier si nous sommes dans un environnement navigateur
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      child_process: false,
      net: false,
      tls: false,
      canvas: false,
      jsdom: false,
    };
    
    return config;
  },
};

export default withTM(nextConfig);
