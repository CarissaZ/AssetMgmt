// src/components/perbaikan/TiketLaporanTab.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient'; // Path disesuaikan

// Material UI Components (semua yang dibutuhkan dipindahkan ke sini)
import {
  Box, Typography, Button, Paper, Checkbox, Pagination,
  CircularProgress, TableContainer, Table, TableHead, TableBody,
  TableRow, TableCell, TextField, InputAdornment,
  Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Grid,
} from '@mui/material';

// Material UI Icons
import SearchIcon from '@mui/icons-material/Search';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloseIcon from '@mui/icons-material/Close';


// KOMPONEN DIALOG DAN FORM TETAP DI SINI KARENA HANYA DIGUNAKAN DI TAB INI
function ConfirmationDialog({ open, onClose, onConfirm, ticket }) {
  if (!ticket) return null;
  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: '12px' } }}>
      <DialogTitle sx={{ p: 2, position: 'relative' }}>
        <IconButton aria-label="close" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center', p: 4, pt: 0 }}>
        <WarningAmberIcon sx={{ fontSize: 60, color: '#f57c00' }} />
        <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>Peringatan</Typography>
        <Typography>
          Apakah Anda yakin akan mengubah status laporan? Laporan <strong>{ticket.id}</strong> akan ditandai telah selesai.
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
          Tindakan ini tidak dapat dibatalkan.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', p: 3, pt: 0 }}>
        <Button onClick={onConfirm} variant="contained" sx={{ backgroundColor: '#007bff', '&:hover': { backgroundColor: '#0056b3' }}}>
          Ya, Selesai
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function RepairCompletionForm({ ticket, onCancel, onSubmit }) {
  const [aksiPerbaikan, setAksiPerbaikan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!aksiPerbaikan) {
      alert('Mohon isi kolom Aksi Perbaikan.');
      return;
    }
    setIsSubmitting(true);
    await onSubmit(aksiPerbaikan);
    setIsSubmitting(false);
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        Konfirmasi Penyelesaian Tiket IT
      </Typography>
      <Paper component="form" onSubmit={handleSubmit} elevation={0} sx={{ p: 3, borderRadius: '12px', border: '1px solid #dee2e6' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}><TextField label="Tanggal Pengajuan" value={formatDate(ticket.tanggal_pengajuan)} fullWidth InputProps={{ readOnly: true }} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Nama Pelapor" value={ticket.nama_pelapor} fullWidth InputProps={{ readOnly: true }} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="ID Aset" value={ticket.id_aset} fullWidth InputProps={{ readOnly: true }} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Lokasi Aset" value={ticket.lokasi} fullWidth InputProps={{ readOnly: true }} /></Grid>
          <Grid item xs={12}><TextField label="Keluhan" value={ticket.keluhan} fullWidth InputProps={{ readOnly: true }} /></Grid>
          <Grid item xs={12}>
            <TextField
              label="Aksi Perbaikan"
              value={aksiPerbaikan}
              onChange={(e) => setAksiPerbaikan(e.target.value)}
              required
              fullWidth
              multiline
              rows={4}
              placeholder="Jelaskan tindakan perbaikan yang telah dilakukan..."
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={onCancel} variant="outlined">Batal</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'Submit'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

// Komponen utama untuk TAB INI
function TiketLaporanTab() {
  const [viewMode, setViewMode] = useState('list');
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    if (viewMode !== 'list') {
      setLoading(false);
      return;
    }
    async function fetchLaporan() {
      // ... (logika fetchLaporan yang sama seperti sebelumnya)
      setLoading(true);
      setError(null);
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, error: fetchError, count } = await supabase
        .from('tiketIT')
        .select('*')
        .eq('statusTiket', 'Aktif')
        .range(from, to)
        .order('tanggalPengajuan', { ascending: false });

      if (fetchError) {
        setError(`Gagal mengambil data: ${fetchError.message}`);
      } else {
        const mappedData = data.map(item => ({
          id: item.idTiket,
          tanggal_pengajuan: item.tanggalPengajuan,
          nama_pelapor: item.namaPelapor,
          lokasi: item.lokasi,
          id_aset: item.idAset,
          keluhan: item.keluhan,
          status: item.statusTiket,
        }));
        setLaporan(mappedData);
        setTotalItems(count || 0);
      }
      setLoading(false);
    }
    fetchLaporan();
  }, [currentPage, viewMode]);

  const handleInitiateRepair = (ticket) => {
    setSelectedTicket(ticket);
    setDialogOpen(true);
  };
  const handleConfirmDialog = () => {
    setDialogOpen(false);
    setViewMode('form');
  };
  const handleFormSubmit = async (aksiPerbaikan) => {
    // ... (logika handleFormSubmit yang sama seperti sebelumnya)
    if (!selectedTicket) return;
    try {
      const { error: updateError } = await supabase.from('tiketIT').update({ statusTiket: 'Selesai' }).eq('idTiket', selectedTicket.id);
      if (updateError) throw updateError;
      const { error: insertError } = await supabase.from('riwayat_perbaikan').insert([{ idTiket: selectedTicket.id, idAset: selectedTicket.id_aset, tanggalSelesai: new Date().toISOString(), aksiPerbaikan: aksiPerbaikan, namaTeknisi: 'Admin' }]);
      if (insertError) throw insertError;
      alert('Tiket berhasil diselesaikan dan riwayat telah disimpan.');
      setViewMode('list');
      setSelectedTicket(null);
    } catch (error) {
      alert(`Terjadi kesalahan: ${error.message}`);
      console.error(error);
    }
  };
  
  const tableHeaders = ['ID Tiket', 'Tanggal Pengajuan', 'Nama Pelapor', 'Lokasi', 'ID Aset', 'Keluhan', 'Status', 'Aksi'];
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID');

  return (
    <Box>
      {viewMode === 'form' && selectedTicket ? (
        <RepairCompletionForm 
          ticket={selectedTicket}
          onCancel={() => { setViewMode('list'); setSelectedTicket(null); }}
          onSubmit={handleFormSubmit}
        />
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {tableHeaders.map((header) => (<TableCell key={header} sx={{ fontWeight: 'bold' }}>{header}</TableCell>))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && <TableRow><TableCell colSpan={8} align="center" sx={{ py: 5 }}><CircularProgress /></TableCell></TableRow>}
                {error && <TableRow><TableCell colSpan={8} align="center" sx={{ py: 5, color: 'error.main' }}>{error}</TableCell></TableRow>}
                {!loading && laporan.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{formatDate(row.tanggal_pengajuan)}</TableCell>
                    <TableCell>{row.nama_pelapor}</TableCell>
                    <TableCell>{row.lokasi}</TableCell>
                    <TableCell>{row.id_aset}</TableCell>
                    <TableCell>{row.keluhan}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell align="center">
                      <Checkbox onChange={() => handleInitiateRepair(row)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {totalPages > 1 && (
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              <Pagination count={totalPages} page={currentPage} onChange={(e, val) => setCurrentPage(val)} color="primary" />
            </Box>
          )}
        </>
      )}
      <ConfirmationDialog 
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirmDialog}
        ticket={selectedTicket}
      />
    </Box>
  );
}

export default TiketLaporanTab;