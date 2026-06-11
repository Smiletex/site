import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/admin/guard';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;

    if (!id) {
      console.error('API: ID de produit manquant');
      return NextResponse.json({ success: false, error: 'ID de produit manquant' }, { status: 400 });
    }
    
    // Récupérer le produit
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`API: Erreur lors de la récupération du produit ${id}:`, error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    
    if (!product) {
      return NextResponse.json({ success: false, error: 'Produit non trouvé' }, { status: 404 });
    }
    
    // Récupérer les variantes du produit
    const { data: variants, error: variantsError } = await supabaseAdmin
      .from('product_variants')
      .select('*')
      .eq('product_id', id);
    
    if (variantsError) {
      console.error(`API: Erreur lors de la récupération des variantes du produit ${id}:`, variantsError);
      // Continuer même en cas d'erreur pour les variantes
    }
    
    // Récupérer les images du produit
    const { data: images, error: imagesError } = await supabaseAdmin
      .from('product_images')
      .select('*')
      .eq('product_id', id)
      .order('position', { ascending: true });
    
    if (imagesError) {
      console.error(`API: Erreur lors de la récupération des images du produit ${id}:`, imagesError);
      // Continuer même en cas d'erreur pour les images
    }
    
    return NextResponse.json({
      success: true,
      product: {
        ...product,
        variants: variants || [],
        images: images || []
      }
    });
    
  } catch (err) {
    console.error('API: Exception non gérée lors de la récupération du produit:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}
