// supabase/functions/rekap-pm/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const SUMBER_LOG_TABLE = 'PCUsage';
const PM_TABLE = 'PreventiveMaintenance';
const ASSET_MASTER_TABLE = 'Aset';
const JADWAL_PM_JAM = 900; // Interval PM dalam jam

serve(async (req) => {
  // Pastikan request adalah POST dan memiliki content-type yang sesuai
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Metode HTTP tidak diizinkan. Gunakan POST.' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }
  
  let assetId: string;
  try {
    const { assetId: receivedAssetId } = await req.json();
    if (!receivedAssetId) {
      return new Response(JSON.stringify({ error: 'assetId wajib diisi.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    assetId = receivedAssetId;
  } catch (parseError) {
    console.error('Gagal mem-parsing request body:', parseError);
    return new Response(JSON.stringify({ error: 'Payload JSON tidak valid.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Ambil data PM saat ini (jika ada)
    const { data: currentPmData, error: pmError } = await supabaseAdmin
      .from(PM_TABLE)
      .select('lastMaintain, namaAset, lokasiAset, jamPenggunaan') // Ambil juga jamPenggunaan yang sudah ada
      .eq('idAset', assetId)
      .single();

    if (pmError && pmError.code !== 'PGRST116') { // PGRST116 berarti "tidak ditemukan"
      console.error('Error saat mengambil data PM:', pmError);
      throw pmError;
    }
    
    // Inisialisasi nilai untuk upsert
    let namaAsetValue: string | null = currentPmData?.namaAset ?? null;
    let lokasiAsetValue: string | null = currentPmData?.lokasiAset ?? null;
    // lastMaintain adalah nilai 'meter' terakhir pada saat PM dilakukan.
    // Jika belum pernah PM, anggap 0 atau waktu awal.
    const lastMaintainValue: number = currentPmData?.lastMaintain ?? 0; 
    // jamPenggunaan adalah total jam penggunaan yang *sudah tercatat* di tabel PM
    const existingJamPenggunaan: number = currentPmData?.jamPenggunaan ?? 0;

    // Jika data PM belum ada, ambil namaAset dan lokasiAset dari tabel master
    if (!currentPmData) {
      const { data: masterAsset, error: masterError } = await supabaseAdmin
        .from(ASSET_MASTER_TABLE)
        .select('namaAset, lokasiAset')
        .eq('idAset', assetId)
        .single();
      
      if (masterError) {
        console.error(`Aset dengan ID ${assetId} tidak ditemukan di tabel master '${ASSET_MASTER_TABLE}':`, masterError);
        return new Response(JSON.stringify({ error: `Aset dengan ID ${assetId} tidak ditemukan di tabel master '${ASSET_MASTER_TABLE}'.` }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }
      
      namaAsetValue = masterAsset.namaAset;
      lokasiAsetValue = masterAsset.lokasiAset;
    }

    // 2. Hitung total jam penggunaan baru dari tabel PCUsage
    // Penting: Pastikan 'durasiPakai' di PCUsage adalah angka yang valid (misalnya, integer atau float)
    const { data: logData, error: logError } = await supabaseAdmin
      .from(SUMBER_LOG_TABLE)
      .select('durasiPakai')
      .eq('idAset', assetId);

    if (logError) {
      console.error('Error saat mengambil data log PCUsage:', logError);
      throw logError;
    }

    // Total jam penggunaan yang baru dihitung dari semua log untuk assetId ini
    const totalJamPenggunaanDariLog = logData.reduce((acc, row) => acc + (row.durasiPakai || 0), 0);
    
    // Logika perhitungan jamPenggunaan yang akan disimpan ke tabel PM:
    // Opsi A (yang saat ini Anda gunakan): Total akumulatif dari semua log
    // `jamPenggunaan` di tabel PM akan selalu mencerminkan `totalJamPenggunaanDariLog`
    const jamPenggunaanUntukPM = totalJamPenggunaanDariLog;

    // Opsi B (jika Anda ingin `jamPenggunaan` di PM adalah total sejak maintenance terakhir)
    // Ini membutuhkan kolom `last_rekap_timestamp` di tabel PM atau filter log PCUsage berdasarkan waktu `lastMaintain`
    // Contoh (jika Anda punya `waktu_mulai_pakai` di PCUsage):
    // const { data: logDataFiltered, error: logErrorFiltered } = await supabaseAdmin
    //   .from(SUMBER_LOG_TABLE)
    //   .select('durasiPakai')
    //   .eq('idAset', assetId)
    //   .gte('waktu_mulai_pakai', new Date(lastMaintainTimestamp).toISOString()); // Asumsi lastMaintain adalah timestamp
    // const jamPenggunaanUntukPM = logDataFiltered.reduce((acc, row) => acc + (row.durasiPakai || 0), 0) + lastMaintainValue; // Jika lastMaintain adalah "meter" terakhir

    // 3. Hitung sisa jam dan buat rekomendasi
    // Sisa jam dihitung dari "meter" terakhir (lastMaintainValue) ditambah interval PM (JADWAL_PM_JAM) 
    // dikurangi total jam penggunaan saat ini (jamPenggunaanUntukPM)
    const sisaJamValue = (lastMaintainValue + JADWAL_PM_JAM) - jamPenggunaanUntukPM;
    
    let rekomendasiText: string;
    if (sisaJamValue <= 0) {
      rekomendasiText = `PM TERLAMBAT! Segera lakukan maintenance. Total jam penggunaan: ${Math.round(jamPenggunaanUntukPM)}.`;
    } else if (sisaJamValue < 50) {
      rekomendasiText = `Segera lakukan maintenance! Sisa jam: ${Math.round(sisaJamValue)}. Total jam penggunaan: ${Math.round(jamPenggunaanUntukPM)}.`;
    } else {
      rekomendasiText = `Dalam batas aman. PM berikutnya sekitar ${Math.round(sisaJamValue)} jam lagi. Total jam penggunaan: ${Math.round(jamPenggunaanUntukPM)}.`;
    }

    // 4. Update/Insert tabel PM dengan semua data yang sudah lengkap
    const { error: upsertError } = await supabaseAdmin
      .from(PM_TABLE)
      .upsert({
        idAset: assetId,
        namaAset: namaAsetValue,
        lokasiAset: lokasiAsetValue,
        jamPenggunaan: jamPenggunaanUntukPM, // Ini adalah total jam penggunaan akumulatif
        lastMaintain: lastMaintainValue,     // Ini adalah "meter" pada saat maintenance terakhir
        sisaJam: sisaJamValue,
        rekomendasi: rekomendasiText,
      }, {
        onConflict: 'idAset', // Jika idAset sudah ada, update; jika belum, insert baru
        ignoreDuplicates: false // Pastikan baris diupdate
      });
      
    if (upsertError) {
      console.error('Error saat upsert data PM:', upsertError);
      throw upsertError;
    }

    return new Response(JSON.stringify({ 
      message: `Rekap untuk aset ${assetId} berhasil diupdate.`,
      jamPenggunaanSaatIni: jamPenggunaanUntukPM,
      sisaJamMenujuPM: sisaJamValue,
      rekomendasi: rekomendasiText
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Terjadi error di dalam function rekap-pm:', error);
    // Berikan pesan error yang lebih informatif kepada klien
    return new Response(JSON.stringify({ 
      error: 'Terjadi kesalahan pada server saat merekap data.', 
      details: error.message 
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});