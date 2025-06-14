import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const rekapPmUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/rekap-pm`

    // 1. Ambil daftar unik idAset dari tabel PCUsage
    console.log('Fetching unique asset IDs from PCUsage table...');
    const { data: assetsWithLogs, error: assetsError } = await supabaseAdmin
      .from('PCUsage')
      .select('idAset');

    if (assetsError) throw assetsError;

    // Buat daftar ID yang unik untuk menghindari pemanggilan ganda
    const uniqueAssetIds = [...new Set(assetsWithLogs.map(item => item.idAset))];

    if (uniqueAssetIds.length === 0) {
      console.log('No assets with logs found to process.');
      return new Response(JSON.stringify({ message: 'No assets with logs to process.' }), { status: 200 });
    }
    
    console.log(`Found ${uniqueAssetIds.length} unique assets to process. Starting individual calls...`);

    // 2. Loop dan panggil fungsi 'rekap-pm' untuk setiap aset
    const allPromises = uniqueAssetIds.map(assetId =>
      fetch(rekapPmUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
        body: JSON.stringify({ assetId: assetId }),
      })
    );

    await Promise.all(allPromises);
    
    console.log(`Successfully triggered rekap for ${uniqueAssetIds.length} assets.`);
    return new Response(JSON.stringify({ message: `Successfully triggered rekap for ${uniqueAssetIds.length} assets.` }), { status: 200 });

  } catch (error) {
    console.error('Error in scheduler function:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
})