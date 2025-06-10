// File: supabase/functions/rekap-pm/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Header ini penting agar function bisa dipanggil dari luar (misal oleh Cron Job)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Baris ini juga untuk menangani CORS, wajib ada.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Membuat koneksi ke Supabase dengan hak akses admin penuh
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Ambil semua data aset yang relevan
    const { data: asetList, error: asetError } = await supabaseAdmin
      .from('Aset')
      .select('idAset, namaAset, lokasiAset, lastMaintain_jam');

    if (asetError) throw asetError;

    const rekapList = [];
    const maintenanceInterval = 900; // Batas jam untuk PM

    // 2. Loop untuk setiap aset untuk menghitung rekapnya
    for (const aset of asetList) {
      // Hitung total jam penggunaan seumur hidup dari tabel PCUsage
      const { data: totalUsage, error: usageError } = await supabaseAdmin
        .from('PCUsage')
        .select('durasiPakai')
        .eq('idAset', aset.idAset);
      
      if (usageError) throw usageError;
      
      const jamPenggunaan = totalUsage.reduce((acc, row) => acc + row.durasiPakai, 0);
      
      // Hitung jam pakai sejak maintenance terakhir dilakukan
      const jamPakaiSejakPM = jamPenggunaan - aset.lastMaintain_jam;
      
      // Hitung sisa jam menuju jadwal PM 900 jam berikutnya
      const sisaJam = maintenanceInterval - jamPakaiSejakPM;

      // Logika untuk menentukan teks rekomendasi
      let rekomendasi = 'Aman';
      if (sisaJam <= 0) {
        rekomendasi = 'Wajib Lakukan PM!';
      } else if (sisaJam <= 100) { // Angka 100 jam ini bisa kamu sesuaikan
        rekomendasi = 'Segera Jadwalkan PM';
      }

      // Kumpulkan hasil kalkulasi
      rekapList.push({
        idAset: aset.idAset,
        namaAset: aset.namaAset,
        lokasiAset: aset.lokasiAset,
        rekomendasi: rekomendasi,
        jamPenggunaan: jamPenggunaan,
        lastMaintain: aset.lastMaintain_jam,
        sisaJam: sisaJam,
      });
    }

    // 3. Simpan semua hasil rekap ke tabel 'PreventiveMaintenance'.
    // 'upsert' akan otomatis update jika data aset sudah ada, atau buat baru jika belum.
    const { error: upsertError } = await supabaseAdmin
      .from('PreventiveMaintenance')
      .upsert(rekapList, { onConflict: 'idAset' });

    if (upsertError) throw upsertError;

    // Kirim respon sukses
    return new Response(
      JSON.stringify({ message: `Rekap PM berhasil untuk ${rekapList.length} aset.` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // Kirim respon jika terjadi error
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});