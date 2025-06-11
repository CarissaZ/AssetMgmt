// supabase/cron/rekap_pm_job.ts
 import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
 import { cron } from 'https://deno.land/x/deno_cron@v1.0.0/cron.ts';

 // Definisikan fungsi yang akan memanggil Edge Function Anda
 async function callRekapPmEdgeFunction() {
  console.log("Cron job started: Calling rekap-pm Edge Function...");

  // Dapatkan URL fungsi dari environment variable Supabase
  // Pastikan SUPABASE_URL_FUNCTIONS diatur di Project Settings > Environment Variables
  // Defaultnya biasanya: https://<PROJECT_REF>.supabase.co/functions/v1
  const SUPABASE_FUNCTIONS_BASE_URL = Deno.env.get('SUPABASE_URL_FUNCTIONS');
  // Gunakan SUPABASE_SERVICE_ROLE_KEY untuk otentikasi
  const SUPABASE_AUTH_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!SUPABASE_FUNCTIONS_BASE_URL || !SUPABASE_AUTH_KEY) {
  console.error('Environment variables for function base URL or Service Role Key not set. Please set SUPABASE_URL_FUNCTIONS and SUPABASE_SERVICE_ROLE_KEY in Supabase Project Settings.');
  return;
  }

  const rekapPmUrl = `${SUPABASE_FUNCTIONS_BASE_URL}/rekap-pm`;

  // Inisialisasi Supabase client untuk mengambil ID aset
  const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '', // SUPABASE_URL dari environment variable
  SUPABASE_AUTH_KEY // Gunakan service_role key untuk izin penuh
  );

  // Ambil semua ID aset dari tabel Aset
  const { data: assets, error: assetsError } = await supabase
  .from('Aset') // Ganti dengan nama tabel master aset Anda yang sebenarnya
  .select('idAset');

  if (assetsError) {
  console.error('Error fetching asset IDs from Aset table:', assetsError);
  return;
  }

  if (!assets || assets.length === 0) {
  console.log('No assets found in Aset table to rekap.');
  return;
  }

  console.log(`Found ${assets.length} assets to rekap.`);

  // Loop melalui setiap aset dan panggil Edge Function
  for (const asset of assets) {
  try {
  const response = await fetch(rekapPmUrl, {
  method: 'POST',
  headers: {
  'Content-Type': 'application/json',
  // Gunakan SUPABASE_SERVICE_ROLE_KEY untuk otentikasi
  'Authorization': `Bearer ${SUPABASE_AUTH_KEY}`,
  },
  body: JSON.stringify({ assetId: asset.idAset }),
  });

  if (!response.ok) {
  const errorBody = await response.json();
  console.error(`Error calling rekap-pm for asset ${asset.idAset} (Status: ${response.status} ${response.statusText}):`, errorBody);
  } else {
  const successBody = await response.json();
  console.log(`Successfully rekap for asset ${asset.idAset}:`, successBody.message);
  }
  } catch (fetchError) {
  console.error(`Network or fetch error while calling rekap-pm for asset ${asset.idAset}:`, fetchError);
  }
  }
  console.log("Cron job finished.");
 }

 // Jadwalkan fungsi untuk berjalan setiap jam
 // "0 * * * *" berarti "pada menit ke-0 setiap jam"
 // Contoh lain:
 // "*/15 * * * *" = Setiap 15 menit
 // "0 0 * * *" = Setiap hari pada tengah malam
 cron("0 * * * *", callRekapPmEdgeFunction);

 console.log("Cron job for rekap_pm_job scheduled to run every hour.");