// src/pages/PMPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// Material UI Components
import {
  Box, Typography, Button, Paper, Checkbox, Pagination,
  CircularProgress, TableContainer, Table, TableHead, TableBody,
  TableRow, TableCell, TextField, InputAdornment, Dialog, DialogActions,
  DialogContent, DialogTitle, IconButton
} from '@mui/material';

// Material UI Icons
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import SearchIcon from '@mui/icons-material/Search';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloseIcon from '@mui/icons-material/Close';

// =================================================================================
// KOMPONEN DIALOG
// =================================================================================
function ConfirmationDialog({ open, onClose, onConfirm, rekomendasi, isCreating }) {
  if (!rekomendasi) return null;
  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: '12px', minWidth: '450px' } }}>
      <DialogTitle sx={{ p: 2, position: 'relative' }}>
        <IconButton aria-label="close" onClick={onClose} sx={{ position: 'absolute', right: 12, top: 12, color: (theme) => theme.palette.grey[500] }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center', p: 4, pt: 0 }}>
        <WarningAmberIcon sx={{ fontSize: 60, color: '#f8bb86' }} />
        <Typography variant="h5" sx={{ fontWeight: '600', mt: 2, mb: 1, color: '#343A40' }}>Peringatan</Typography>
        <Typography>
          Apakah Anda yakin akan melakukan perbaikan berdasarkan rekomendasi <strong>{rekomendasi.id}</strong>?
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
          Sebuah tiket perbaikan baru akan dibuat secara otomatis.
        </Typography>
        <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mt: 2, fontWeight: 'bold' }}>Tindakan ini tidak dapat dibatalkan</Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', p: 3, pt: 0 }}>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          disabled={isCreating} // Tombol dinonaktifkan saat proses pembuatan tiket
          sx={{ 
            backgroundColor: '#007bff', 
            '&:hover': { backgroundColor: '#0056b3' }, 
            textTransform: 'none', 
            fontWeight: 'bold', 
            padding: '10px 24px', 
            borderRadius: '8px',
            '&.Mui-disabled': {
              backgroundColor: 'grey.300'
            }
          }}
        >
          {isCreating ? 'Membuat Tiket...' : 'Ya, Perbaiki'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// =================================================================================
// KOMPONEN HALAMAN UTAMA (Hanya Konten)
// =================================================================================
function PMPage() {
  const [rekomendasi, setRekomendasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRekomendasi, setSelectedRekomendasi] = useState(null);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false); // State untuk proses pembuatan tiket
  
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    async function fetchRekomendasi() {
      setLoading(true);
      setError(null);
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      const { data, error: fetchError, count } = await supabase
        .from('PreventiveMaintenance')
        .select('idPM, idAset, namaAset, lokasiAset, rekomendasi, jamPenggunaan, lastMaintain, sisaJam', { count: 'exact' })
        .range(from, to)
        .order('idPM', { ascending: true });
        
      if (fetchError) { setError(`Gagal mengambil data: ${fetchError.message}.`) }
      else { 
        setRekomendasi(data.map(item => ({
          idRekomendasi: item.idPM, idAset: item.idAset, namaAset: item.namaAset,
          lokasiAset: item.lokasiAset, jenisRekomendasi: item.rekomendasi,
          jamPenggunaan: item.jamPenggunaan, lastMaintain: item.lastMaintain || '0',
          sisaJam: item.sisaJam,
        })));
        setTotalItems(count);
      }
      setLoading(false);
    }
    fetchRekomendasi();
  }, [currentPage]);

  const handleCheckboxChange = (event, row) => {
    const id = row.idRekomendasi;
    const isChecked = event.target.checked;
    if (isChecked) { 
      setSelected(prev => [...prev, id]); 
      handleOpenDialog(row) 
    }
    else { 
      setSelected(prev => prev.filter(selectedId => selectedId !== id)) 
    }
  };

  const handleOpenDialog = (rekomendasi) => { 
    setSelectedRekomendasi({ ...rekomendasi, id: rekomendasi.idRekomendasi }); 
    setDialogOpen(true) 
  };

  const handleCloseDialog = (isConfirming) => {
    // Jika dialog ditutup tanpa konfirmasi (klik di luar atau tombol close), uncheck checkbox-nya
    if (!isConfirming && selectedRekomendasi) { 
      setSelected(prev => prev.filter(id => id !== selectedRekomendasi.id)) 
    }
    setDialogOpen(false);
    setSelectedRekomendasi(null);
  };

  // ====================== PERUBAHAN UTAMA DI SINI ======================
  const handleConfirmRepair = async () => {
    // 1. Pastikan ada data rekomendasi yang dipilih.
    if (!selectedRekomendasi) {
      alert('Terjadi kesalahan: Tidak ada data rekomendasi yang terpilih.');
      return;
    }

    setIsCreatingTicket(true); // Mulai proses pembuatan tiket

    // 2. Siapkan objek data baru untuk tabel 'tiketIT'.
    const newTicket = {
      // idTiket akan digenerate otomatis oleh Supabase (jika tipe kolomnya uuid)
      tanggalPengajuan: new Date().toISOString(),
      namaPelapor: 'Staf Aset (Nia)',
      idAset: selectedRekomendasi.idAset,
      keluhan: 'Preventive maintenance berkala',
      statusTiket: 'Aktif'
    };

    // 3. Gunakan blok try...catch untuk proses ke database.
    try {
      // 4. Panggil Supabase untuk memasukkan data baru.
      const { error } = await supabase
        .from('tiketIT')
        .insert([newTicket]); 

      // 5. Jika ada error dari Supabase, lemparkan error tersebut.
      if (error) {
        throw error;
      }

      // 6. Jika berhasil, berikan notifikasi sukses.
      alert('Sukses! Tiket perbaikan baru telah dibuat dan dapat dilihat di halaman Perbaikan Aset.');

    } catch (error) {
      // Tangani error yang mungkin terjadi.
      console.error('Gagal membuat tiket perbaikan:', error);
      alert(`Gagal membuat tiket. Pesan error: ${error.message}`);
    } finally {
      // 7. Tutup dialog dan reset state, baik berhasil maupun gagal.
      setIsCreatingTicket(false); // Selesaikan proses pembuatan tiket
      handleCloseDialog(true);
    }
  };
  // ========================================================================

  const isSelected = (id) => selected.includes(id);

  const tableHeaders = ['Id Rekomendasi', 'Id Aset', 'Nama Aset', 'Lokasi Aset', 'Jenis Rekomendasi', 'Jam Penggunaan', 'Last Maintain', 'Sisa Jam', 'Aksi'];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2 }}>
          <Button startIcon={<AccountCircleOutlinedIcon />} sx={{ textTransform: 'none', color: '#495057', fontWeight: '500' }}>
              Profile
          </Button>
      </Box>
      <Paper elevation={0} sx={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #dee2e6' }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: '600', color: '#343A40' }}>
              Rekomendasi Preventive Maintenance
          </Typography>
          <TextField
            size="small" variant="outlined" placeholder="Cari data (contoh: PP001250101)"
            InputProps={{
              startAdornment: ( <InputAdornment position="start"><SearchIcon sx={{ color: '#adb5bd' }} /></InputAdornment> ),
              sx: { borderRadius: '8px', fontSize: '0.9rem', minWidth: '350px' }
            }}
          />
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#c5ebcf' }}>
                {tableHeaders.map((header) => (
                  <TableCell key={header} sx={{ fontWeight: '600', color: '#213547', textTransform: 'capitalize' }}>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={tableHeaders.length} align="center" sx={{ py: 10 }}><CircularProgress /></TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={tableHeaders.length} align="center" sx={{ py: 10, color: 'red' }}>{error}</TableCell></TableRow>
              ) : (
                rekomendasi.map((row) => (
                  <TableRow key={row.idRekomendasi} hover>
                    <TableCell>{row.idRekomendasi}</TableCell>
                    <TableCell>{row.idAset}</TableCell>
                    <TableCell>{row.namaAset}</TableCell>
                    <TableCell>{row.lokasiAset}</TableCell>
                    <TableCell>{row.jenisRekomendasi}</TableCell>
                    <TableCell>{row.jamPenggunaan}</TableCell>
                    <TableCell>{row.lastMaintain}</TableCell>
                    <TableCell>{row.sisaJam}</TableCell>
                    <TableCell>
                      <Checkbox
                          checked={isSelected(row.idRekomendasi)}
                          onChange={(event) => handleCheckboxChange(event, row)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      {totalPages > 1 && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Pagination 
              count={totalPages} page={currentPage} onChange={(_, value) => setCurrentPage(value)} 
              color="primary" shape="rounded"
              sx={{ '& .Mui-selected': { backgroundColor: '#28a745 !important', color: 'white' } }}
          />
        </Box>
      )}
      <ConfirmationDialog 
        open={dialogOpen}
        onClose={() => handleCloseDialog(false)}
        onConfirm={handleConfirmRepair}
        rekomendasi={selectedRekomendasi}
        isCreating={isCreatingTicket} // Kirim status proses ke dialog
      />
    </Box>
  );
}

export default PMPage;
