# Audit Smiletex — état avant lancement

> Audit initial en lecture seule. Périmètre : Sécurité, Fonctionnel/bugs, Perf/SEO.
> Stack : Next.js 15 (App Router), Supabase, Stripe, nodemailer.
> Suivi des travaux de remédiation : voir la section "Journal" en bas.

## TL;DR

En l'état, **le site ne doit pas être lancé tel quel**. Trois problèmes se recoupent dans les trois audits et sont bloquants à eux seuls :

1. **Les prix viennent du client** : on peut payer un produit 0,01 €.
2. **La confirmation de paiement dépend du navigateur** (webhook neutralisé) : argent encaissé, commande jamais enregistrée ni confirmée.
3. **Aucune sécurité base de données (RLS absente)** + clé admin `Admin123` en clair dans le JS : toutes les données clients (RGPD) et l'admin sont accessibles à n'importe qui.

Le reste (stock jamais décrémenté, 3 paniers concurrents, SEO produits inexistant) aggrave mais découle souvent de ces fondations.

---

## 🔴 BLOQUANTS (à corriger avant tout lancement)

### B1. Prix du checkout fournis par le client
`src/app/api/checkout/route.ts:88-97,146`
Les montants Stripe et `total_amount` sont calculés depuis `item.price` du panier (localStorage). Aucun recalcul serveur depuis la base. → fraude triviale (payer 0,01 € un produit à 50 €).
**Fix** : recharger chaque prix depuis `products`/`product_variants` côté serveur, ignorer tout prix client.

### B2. Confirmation de paiement pilotée par le navigateur (webhook neutralisé)
`src/app/api/webhook/route.ts:44-65`, `src/app/checkout/success/page.tsx:69-84`, `src/app/api/orders/update-status/route.ts`
Le webhook Stripe (signature pourtant bien vérifiée) laisse volontairement la commande en `unpaid`. C'est la page `success` côté client qui passe la commande à payé. Si le client ferme l'onglet après paiement → **payé chez Stripe, `unpaid` en base, aucun email**. Le `clearCart()` déclenche en plus un `window.location.reload()` (`useCart.ts:122`) qui peut couper `update-status` en cours.
**Fix** : toute la logique métier (statut payé, email, décrément stock, vidage panier) dans le webhook `checkout.session.completed`. La page success ne fait que lire/afficher.

### B3. RLS Supabase totalement absente
`db/*.sql`, `src/database/orders.sql` (aucun `ENABLE ROW LEVEL SECURITY`, aucune policy)
Le client anon (clé `NEXT_PUBLIC_*`, donc publique) lit/écrit `orders`, `order_items`, `customer_profiles`… → avec la seule clé anon (extractible du JS), un attaquant lit toutes les commandes, adresses, emails clients (RGPD) et peut écrire/supprimer.
**Fix** : activer RLS sur toutes les tables + policies `auth.uid()`, ne jamais exposer de PII via le client anon.

### B4. Mot de passe admin en clair + identifiants par défaut
`src/app/admin/products/page.tsx:80,99` (et autres), `src/app/api/admin/login/route.ts:4-5`, `src/middleware.ts:30-31`
`'Authorization': 'Bearer Admin123'` est codé en dur côté client → public dans le bundle JS. Fallback `admin`/`admin123` si l'env n'est pas défini. Cookie `admin_auth=true` non signé et… jamais vérifié nulle part.
**Fix** : vraie session admin server-side (rôle Supabase), aucun secret ni fallback d'identifiant dans le code.

### B5. Routes admin sans aucune authentification
`api/admin/products/[id]` (`isAuthenticated = true`, auth commentée), `api/admin/categories/[id]`, `api/admin/inspirations`(+`[id]`), `api/admin/upload`, `admin/promotions/api`(+`[id]`), `api/orders/set-unpaid`, `api/orders/update-status`
Le middleware ne matche que `/admin/:path*` (les pages), pas `/api/admin/*`. Plusieurs routes ont l'auth explicitement désactivée. Les routes promotions créent/suppriment des **coupons Stripe réels** sans auth ; `set-unpaid`/`update-status` utilisent la service_role (bypass RLS) sans auth et acceptent `userId` du client.
**Fix** : vérification de session admin server-side sur chaque handler `/api/admin/*`.

### B6. Exécution de SQL arbitraire via `exec_sql` (service_role)
`src/app/api/admin/products/force-delete/route.ts:80-117`, `src/app/api/admin/products/schema/route.ts`
POST de SQL brut vers `/rest/v1/rpc/exec_sql` avec la `SERVICE_ROLE_KEY` + fonctions `SECURITY DEFINER` avec `EXECUTE format(...)`. Protégé seulement par le Bearer `Admin123` (public, cf B4) → exfiltration/destruction totale de la base.
**Fix** : supprimer tout endpoint d'exécution SQL générique ; migrations versionnées ; retirer `exec_sql` de Supabase.

### B7. Le stock n'est jamais décrémenté
`src/app/api/checkout/route.ts`, `webhook/route.ts`, `productService.ts:238` (`updateProductStock` jamais appelé dans le tunnel) + check stock désactivé à l'ajout panier (`ProductDetail.tsx:173`)
→ survente illimitée, le stock affiché ne reflète jamais les ventes.
**Fix** : décrémenter le stock dans le webhook (transaction), réintroduire le check de dispo avant la session Stripe.

---

## 🟠 ÉLEVÉS

### E1. Trois implémentations de panier concurrentes
`src/contexts/CartContext.tsx` (mort), `src/components/CartProvider.tsx` (monté), `src/hooks/useCart.ts`+`src/lib/cart.ts` (utilisé par la page panier). Clés d'unicité divergentes, articles personnalisés jamais considérés égaux, mutation d'état + `setTimeout`/`dispatchEvent('cartUpdated')` manuels → compteur faux, quantités incohérentes entre fiche produit et panier.
**Fix** : une seule source de panier, supprimer les deux implémentations mortes.

### E2. Images de perso stockées en base64 dans localStorage puis en base
`ProductCustomizer.tsx:1010-1045`, `cart.ts:42,153`, `checkout/route.ts:78,171`
Une image 5 Mo → ~6,7 Mo de base64 dans `localStorage['cart']` → quota explosé, panier qui ne se sauvegarde plus. L'admin récupère un blob base64, pas un fichier imprimable. `src/lib/uploadService.ts` existe déjà mais n'est pas utilisé ici.
**Fix** : upload vers Supabase Storage, ne stocker que l'URL.

### E3. Barèmes de prix de personnalisation contradictoires
`ProductCustomizer.tsx:9-24` et `:241-281` (dupliqué) vs `src/lib/customization.ts:14-50` (barème totalement différent : flocage/broderie/longueur texte). Selon le chemin, le client voit un prix et en paie un autre.
**Fix** : un seul barème centralisé côté serveur.

### E4. Race condition sur le prix de perso à l'ajout panier
`ProductDetail.tsx:242-271` : `handleAddToCartWithCustomization(data, price)` fait `setCustomizationPrice(price)` puis lit l'ancien state `customizationPrice` → premier ajout sous-facturé (souvent 0).
**Fix** : utiliser l'argument `price`, pas le state. (Voir aussi sauvegarde debouncée 800 ms, `ProductCustomizer.tsx:417-438`.)

### E5. IDOR sur les commandes
`api/orders/session/route.ts:24-27`, `api/orders/session/[sessionId]/route.ts:22-31` : aucune vérif d'appartenance → avec un `sessionId`/`orderId` deviné, on lit commande, adresse, montants.
**Fix** : vérifier l'appartenance via la session utilisateur.

### E6. Upload de fichiers sans auth ni validation
`api/admin/upload/route.ts:77-104` : aucune auth, aucune validation MIME/extension/taille, bucket public, `upsert: true`.
**Fix** : auth + whitelist types/tailles + extension générée serveur.

### E7. Pas de fusion panier invité → connecté
`AuthModal.tsx`, `AuthContext.tsx`, `cart.ts` : `getCart(userId)` écrase le localStorage → articles invité perdus, ou panier invité qui pollue une autre session sur le même navigateur.
**Fix** : stratégie de merge explicite à la connexion.

### E8. Email de confirmation fragile et incomplet
`api/orders/update-status/route.ts:114-204` : email envoyé uniquement si la page success s'exécute (cf B2) ; la requête `order_items` ne joint pas `product_variants` donc taille/couleur toujours `undefined` ; `sendEmail` échoue silencieusement si creds absents.
**Fix** : envoyer depuis le webhook, joindre les variantes, logguer/alerter sur échec.

### E9. SEO — pages produits sans metadata et 100% client-side
`products/[id]/page.tsx` (pas de `generateMetadata`), `ProductDetail.tsx:1` (`'use client'`, fetch en useEffect). Toutes les fiches partagent le même title/description, contenu invisible au crawl initial. Pour un e-commerce neuf, c'est la perte SEO la plus coûteuse.
**Fix** : `generateMetadata` + fetch produit en Server Component, données en props au composant client.

### E10. SEO local — NAP faux dans le JSON-LD
`JsonLd.tsx:12-27,95-99` et page Lyon `:286-298` : `+33000000000`, `123 Rue de Lyon`, email placeholder. Le NAP est le pilier du référencement local Google ; faux/incohérent = aucun ranking local Lyon.
**Fix** : vrais NAP partout, cohérents avec la fiche Google Business.

---

## 🟡 MOYENS

- **M1. Injection HTML / spam via formulaires contact & devis** — `api/contact/route.ts:26-41`, `api/send-devis/route.ts:8-23` : entrées interpolées dans le HTML sans échappement, pas de rate limiting/captcha.
- **M2. Secrets et PII loggés en console** — `mailer.ts:40,82-83`, `checkout/route.ts:19,151,159`, `update-status`.
- **M3. Homepage sans `<h1>` et rendue client** — `app/page.tsx` : signal SEO majeur manquant.
- **M4. Metadata absente sur ~15 pages publiques** — about, contact, devis, faq, shipping, inspiration, products… (souvent à cause de `'use client'` sur la page entière).
- **M5. Sitemap statique** — `public/sitemap.xml` figé, sans URLs produits. Pas de `app/sitemap.ts` dynamique.
- **M6. Pas de schema Product / BreadcrumbList** — pas de rich results (prix, dispo) dans les SERP.
- **M7. N+1 Supabase + tout le catalogue chargé sur une fiche produit** — `productService.ts` (image par produit), `ProductDetail.tsx:45-47` (`useAllProducts` pour 3 produits similaires), aucun cache dans `useProducts.ts`.
- **M8. Images locales énormes** — `hero-bg.png` 1,86 Mo, `logo_comp.png` 1,5 Mo, `dtg.png` 1,4 Mo, `broderie.png` 1 Mo → LCP catastrophique sur mobile.
- **M9. Pas de dynamic import** — `ProductCustomizer.tsx` (1360 lignes) importé statiquement dans la page produit ; `next/dynamic` jamais utilisé. `fabric` semble être une dépendance morte.
- **M10. `next.config.ts` images** — `remotePatterns: '**'` (http+https, tout hôte), pas de `formats` avif/webp.
- **M11. TVA codée en dur** — `cart/page.tsx:498-503` (`/1.2`), faux si taux différent (impact facture/légal).
- **M12. Versions d'API Stripe incohérentes** entre routes — `2025-02-24.acacia` vs `2023-10-16`.

---

## 🟢 FAIBLES

- **F1. Build ignore TS + ESLint** — `next.config.ts:5-12` (`ignoreBuildErrors`, `ignoreDuringBuilds`). Masque des bugs ; à réactiver vu le contexte.
- **F2. `params` non awaité (Next 15)** — `api/orders/session/[sessionId]/route.ts:10-13`.
- **F3. Route morte `stripe_session_id`** — `api/orders/session/route.ts:27` lit une colonne jamais écrite.
- **F4. `useEffect` success deps incomplètes** — `success/page.tsx:157` : `user` capturé null → commande mal rattachée.
- **F5. Mutation d'état React dans le panier** — `CartProvider.tsx:165`, `CartContext.tsx:87,115`.
- **F6. `customer_creation: 'always'` sans email** — `checkout/route.ts:205,207` : customers Stripe orphelins.
- **F7. OG image = logo 1,5 Mo en 800×600** — `layout.tsx:30-36`, pas une vraie image de partage 1200×630.
- **F8. Logs verbeux en prod** — `ProductCustomizer.tsx`, `cart.ts`, routes API.
- **F9. Types `any` masquant des bugs** — `checkout/route.ts:73,88`, `admin/orders/page.tsx:25,38`.

---

## Points corrects relevés

- Signature du webhook Stripe **bien vérifiée** (`webhook/route.ts:23-27`) — le souci est l'inversion de logique (B2), pas la signature.
- `/api/admin/users` et `/api/admin/customer-emails` : seules routes correctement protégées (session + rôle admin).
- La service_role n'est pas réellement bundlée côté client (Next n'injecte que `NEXT_PUBLIC_*`), mais le code de fallback dans un module client reste à supprimer.
- `.gitignore` couvre bien `.env*`.

---

## Ordre de remédiation conseillé

1. **B1, B2, B7** — pour qu'une commande payée soit enregistrée, au bon prix, avec stock à jour. (cœur métier)
2. **B3, B4, B5, B6** — sécurité : RLS + vraie auth admin + suppression des endpoints SQL/non protégés.
3. **E1, E2, E3, E4, E8** — fiabiliser panier, perso et email.
4. **E9, E10, M3–M8** — SEO/perf pour l'acquisition Lyon.
5. Le reste en fiabilisation continue.

---

## Journal de remédiation

### Étape 1 — Sécurité des dépendances + nettoyage code mort + mises à jour
- `npm audit` : **30 → 3 vulnérabilités** (2 critiques Next.js éliminées).
- Mises à jour : Next 15.2.0 → 15.5.x, nodemailer 6 → 8 (injection SMTP corrigée), postcss/autoprefixer, transitives via `npm audit fix`.
- Restantes : `xlsx` (haute, pas de fix npm → remplacer la lib) + 2 modérées dans le postcss embarqué de Next (build-time only).
- Dépendances mortes désinstallées : `fabric`, `@types/fabric`, `@supabase/auth-helpers-react`, `@supabase/ssr`, `resend`, `next-transpile-modules`.
- Fichiers morts supprimés : `custom.txt`, `fix-build-errors.js`, `src/contexts/CartContext.tsx`, `src/pages/_document.tsx`, `src/app/api/orders/session/route.ts`, `src/components/CartButton.tsx`, `src/components/ClientLayout.tsx`.
- Build complet OK de bout en bout.

### Étape 2 — Rangement de l'arborescence
- `components/` réorganisé par domaine : `admin/`, `cart/`, `home/` (ex-`Acceuil`), `layout/`, `modals/`, `product/`, `seo/` (ex-`SEO`), `ui/`. Tous les imports `@/components/*` mis à jour.
- `lib/products.ts` : retrait des données mockées + 8 fonctions statiques mortes (190 → 56 lignes), ne reste que les types.
- `lib/uploadService.ts` → `lib/supabase/uploadService.ts` (util Storage, logique).
- SQL consolidé : `src/database/orders.sql` → `db/` ; dossier `src/database/` supprimé.
- Docs regroupées dans `docs/` (`AI_INSTRUCTIONS.md`, `CHECKOUT_INTEGRATION.md`, `AUDIT.md`) ; `README.md` reste à la racine.

## Dette technique repérée pendant le rangement (à traiter petit à petit)

- **Duplication de types** : `Product`, `ProductVariant`, `Category` sont définis À LA FOIS dans `src/lib/products.ts` ET `src/types/index.ts`. `Order`/`OrderItem` sont dupliqués entre `src/types/index.ts` et `src/types/order.ts`. Risque d'incohérence selon le fichier importé. À fusionner en une source unique (de préférence `src/types/`).
- **Erreurs TypeScript pré-existantes** masquées par `ignoreBuildErrors: true` dans `next.config.ts` :
  - API async Next 15 : `cookies()` et `params` utilisés en synchrone (`api/admin/login/route.ts`, routes `[id]`).
  - Types `null`/`undefined` mal gérés dans `products/[id]/ProductDetail.tsx` (couleur de variante).
- **`ReferenceError: location is not defined`** au prérendu (build) : un composant utilise `location`/`window.location` sans garde `typeof window`. Non bloquant (build OK) mais à corriger proprement (l'ancien hack `fix-build-errors.js`, supprimé, visait ce problème).
- **218 erreurs + 119 warnings ESLint** pré-existantes (`any` explicites, variables inutilisées) : dette de typage à éroder progressivement.
