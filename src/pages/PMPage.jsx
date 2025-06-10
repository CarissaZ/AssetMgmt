// src/pages/PMPage.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient.js'; // Pastikan path ini benar
import { Box, Typography, Button, TextField, InputAdornment, Stack, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox, Pagination, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

function PMPage() {
  // Wadah untuk menyimpan data dari Supabase, awalnya array kosong
  const [rekomendasi, setRekomendasi] = useState([]); 
  // State untuk menandakan proses loading data
  const [loading, setLoading] = useState(true); 

  // useEffect akan berjalan satu kali saat komponen pertama kali di-render
  useEffect(() => {
    // Buat fungsi untuk mengambil data
    async function fetchRekomendasi() {
      try {
        setLoading(true); // Mulai loading
        // Ganti 'NamaTabelRekomendasi' dengan nama tabelmu yang sebenarnya di Supabase
        const { data, error } = await supabase
          .from('NamaTabelRekomendasi') 
          .select('*');

        if (error) {
          throw error;
        }

        if (data) {
          setRekomendasi(data); // Masukkan data dari Supabase ke wadah
        }
      } catch (error) {
        console.error('Error fetching data:', error.message);
      } finally {
        setLoading(false); // Selesai loading, baik berhasil maupun gagal
      }
    }

    fetchRekomendasi(); // Panggil fungsi pengambilan data
  }, []); // Array kosong berarti efek ini hanya berjalan sekali

  return (
    <Box>
      {/* Bagian header (Profile, Navigasi, Search) tetap sama */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button startIcon={<AccountCircleIcon />}>Profile</Button>
      </Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined">Permohonan</Button>
          <Button variant="contained">PM</Button>
          <Button variant="outlined">Riwayat</Button>
          <Button variant="outlined">Tiket Laporan</Button>
        </Stack>
        <TextField size="small" placeholder="Cari data..." InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>),}}/>
      </Stack>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
        Rekomendasi Preventive Maintenance
      </Typography>

      {/* Tabel Data dengan logika baru */}
      <Paper>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                {/* Kolom-kolom header tetap sama */}
                <TableCell>idRekomendasi</TableCell>
                <TableCell>idAset</TableCell>
                <TableCell>namaAset</TableCell>
                <TableCell>lokasiAset</TableCell>
                <TableCell>jenisRekomendasi</TableCell>
                <TableCell>jamPenggunaan</TableCell>
                <TableCell>sisaJam</TableCell>
                <TableCell>aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress /> {/* Tampilkan loading spinner */}
                  </TableCell>
                </TableRow>
              ) : rekomendasi.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Tidak ada data rekomendasi.
                  </TableCell>
                </TableRow>
              ) : (
                rekomendasi.map((row) => (
                  <TableRow key={row.idRekomendasi} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    {/* Sesuaikan nama 'row.nama_kolom' dengan nama kolom di tabel Supabase-mu */}
                    <TableCell>{row.idRekomendasi}</TableCell>
                    <TableCell>{row.idAset}</TableCell>
                    <TableCell>{row.namaAset}</TableCell>
                    <TableCell>{row.lokasiAset}</TableCell>
                    <TableCell>{row.jenisRekomendasi}</TableCell>
                    <TableCell>{row.jamPenggunaan}</TableCell>
                    <TableCell>{row.sisaJam}</TableCell>
                    <TableCell><Checkbox /></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Paginasi tetap sama */}
      <Stack alignItems="center" sx={{ mt: 3 }}>
        <Pagination count={3} color="primary" />
      </Stack>
    </Box>
  );
}

export default PMPage;