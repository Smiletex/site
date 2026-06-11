import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * Upload d'image de personnalisation (côté client, visiteurs compris).
 *
 * Remplace le stockage base64 dans le localStorage / la base (E2) : l'image
 * est validée et envoyée vers Supabase Storage, seule l'URL est conservée.
 * Validation (type + taille) pour éviter les abus (E6). L'upload passe par le
 * service_role côté serveur (le client n'écrit pas directement dans Storage).
 *
 * Pré-requis : un bucket public `customizations` dans Supabase Storage.
 */

const BUCKET = 'customizations';
const MAX_BYTES = 5 * 1024 * 1024; // 5 Mo
const ALLOWED: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }
    const ext = ALLOWED[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: 'Format non autorisé (PNG, JPEG ou WebP uniquement).' },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: 'Image trop volumineuse (5 Mo maximum).' },
        { status: 400 }
      );
    }

    const path = `${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur lors de l\'upload' },
      { status: 500 }
    );
  }
}
