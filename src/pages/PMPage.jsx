// pages/PMPage.jsx
import React, { useState, useEffect } from 'react';

// --- Konfigurasi Supabase Client ---
// Impor ini akan bekerja di lingkungan pengembangan lokal Anda
// dimana file '/lib/supabaseClient.js' ada.
import { supabase } from '../lib/supabaseClient';

// Untuk tujuan pratinjau di lingkungan ini, kita akan membuat 
// placeholder client untuk menghindari error kompilasi.
// Ganti ini dengan impor Anda di atas saat menjalankan secara lokal.


// Material UI Components
import {
  Box, Typography, Button, TextField, InputAdornment, Stack, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Checkbox, Pagination, CircularProgress, Drawer, List, ListItem,
  ListItemButton, ListItemText, ListItemIcon, CssBaseline,
  Dialog, DialogActions, DialogContent, DialogTitle, IconButton
} from '@mui/material';

// Material UI Icons
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AppsIcon from '@mui/icons-material/Apps';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloseIcon from '@mui/icons-material/Close';


const drawerWidth = 260;

// Komponen Dialog Konfirmasi
function ConfirmationDialog({ open, onClose, onConfirm, rekomendasi }) {
  if (!rekomendasi) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '12px',
          minWidth: '450px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }
      }}
    >
      <DialogTitle sx={{ p: 2, position: 'relative' }}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 12,
            top: 12,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center', p: 4, pt: 0 }}>
        <WarningAmberIcon sx={{ fontSize: 60, color: '#f8bb86' }} />
        <Typography variant="h5" sx={{ fontWeight: '600', mt: 2, mb: 1, color: '#343A40' }}>
          Peringatan
        </Typography>
        <Typography>
          Apakah Anda yakin akan melakukan perbaikan berdasarkan rekomendasi <strong>{rekomendasi.id}</strong>?
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
          Data status aset terkait akan diubah menjadi "Diperbaiki".
        </Typography>
        <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mt: 2, fontWeight: 'bold' }}>
          Tindakan ini tidak dapat dibatalkan
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', p: 3, pt: 0 }}>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{
            backgroundColor: '#007bff',
            '&:hover': { backgroundColor: '#0056b3' },
            textTransform: 'none',
            fontWeight: 'bold',
            padding: '10px 24px',
            borderRadius: '8px'
          }}
        >
          Ya, Perbaiki
        </Button>
      </DialogActions>
    </Dialog>
  );
}


// Komponen Sidebar
function Sidebar() {
  const menuItems = [
    { text: 'Pengadaan Aset', icon: <ShoppingCartOutlinedIcon /> },
    { text: 'Data Aset', icon: <Inventory2OutlinedIcon /> },
    { text: 'Preventive Maintain', icon: <BuildOutlinedIcon /> },
    { text: 'Perbaikan Aset', icon: <BuildOutlinedIcon /> },
    { text: 'Penghapusan Aset', icon: <DeleteOutlineOutlinedIcon /> },
  ];
  const activeItem = 'Preventive Maintain';

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e0e0e0',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'flex-start', borderBottom: '1px solid #e0e0e0' }}>
        <AppsIcon sx={{ color: '#343A40', fontSize: '2rem' }} />
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: '600', color: '#343A40' }}>
          Manajemen Aset
        </Typography>
      </Box>
      <List sx={{ p: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              sx={{
                borderRadius: '8px',
                minHeight: 48,
                px: 2,
                color: item.text === activeItem ? 'white' : '#343A40',
                backgroundColor: item.text === activeItem ? '#28a745' : 'transparent',
                boxShadow: item.text === activeItem ? '0 4px 12px rgba(40, 167, 69, 0.2)' : 'none',
                '&:hover': {
                  backgroundColor: item.text === activeItem ? '#218838' : '#f8f9fa',
                },
                '& .MuiListItemIcon-root': {
                   color: item.text === activeItem ? 'white' : '#495057',
                   minWidth: 40,
                }
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} sx={{ '& .MuiListItemText-primary': { fontWeight: 500 } }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}

// Komponen Header Konten Utama
function Header() {
    return (
         <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
            <Button
                startIcon={<AccountCircleOutlinedIcon />}
                sx={{
                    textTransform: 'none',
                    color: '#495057',
                    fontWeight: '500',
                    borderRadius: '8px',
                    '&:hover': {
                        backgroundColor: '#e9ecef',
                    }
                }}
            >
                Profile
            </Button>
        </Box>
    )
}

// Komponen Konten Utama
function MainContent() {
  const [rekomendasi, setRekomendasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRekomendasi, setSelectedRekomendasi] = useState(null);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Mengambil total data untuk pagination hanya sekali saat komponen dimuat
  useEffect(() => {
    async function getTotalCount() {
        const { count, error } = await supabase
          .from('PreventiveMaintenance')
          .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('Error fetching total count:', error.message);
        } else {
            setTotalItems(count);
        }
    }
    getTotalCount();
  }, []);

  // Mengambil data rekomendasi setiap kali halaman berubah
  useEffect(() => {
    async function fetchRekomendasi() {
      setLoading(true);
      setError(null);
      
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, error } = await supabase
        .from('PreventiveMaintenance')
        .select('idPM, idAset, namaAset, lokasiAset, rekomendasi, jamPenggunaan, sisaJam, lastMaintain')
        .range(from, to);

      if (error) {
        setError(`Gagal mengambil data: ${error.message}. Pastikan konfigurasi Supabase Anda benar.`);
        console.error("Error fetching data:", error);
      } else {
        setRekomendasi(data.map(item => ({
          id: item.idPM,
          idAset: item.idAset,
          namaAset: item.namaAset,
          lokasiAset: item.lokasiAset,
          jenisRekomendasi: item.rekomendasi,
          jamPenggunaan: item.jamPenggunaan,
          lastMaintain: item.lastMaintain,
          sisaJam: item.sisaJam,
        })));
      }
      setLoading(false);
    }
    
    fetchRekomendasi();
  }, [currentPage]);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rekomendasi.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };
  
  const handleCheckboxChange = (event, row) => {
    const id = row.id;
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
    
    // Buka dialog jika checkbox dicentang
    if (event.target.checked) {
      handleOpenDialog(row);
    }
  };

  const handleOpenDialog = (rekomendasi) => {
    setSelectedRekomendasi(rekomendasi);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    // Jika dialog ditutup (dibatalkan), hapus item dari seleksi
    if (selectedRekomendasi) {
      setSelected(prev => prev.filter(id => id !== selectedRekomendasi.id));
    }
    setDialogOpen(false);
    setSelectedRekomendasi(null);
  };

  const handleConfirmRepair = () => {
    // LOGIKA UNTUK MEMBUAT TIKET LAPORAN DI SUPABASE
    console.log(`Perbaikan dikonfirmasi untuk: ${selectedRekomendasi.id}`);
    // Di sini Anda akan memanggil fungsi untuk update/insert ke Supabase
    setDialogOpen(false);
    setSelectedRekomendasi(null);
    // Tambahkan notifikasi sukses jika perlu
  };
  
  const isSelected = (id) => selected.indexOf(id) !== -1;

  const tableHeaders = ['ID Rekomendasi', 'ID Aset', 'Nama Aset', 'Lokasi Aset', 'Jenis Rekomendasi', 'Jam Penggunaan', 'Last Maintain', 'Sisa Jam'];

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        px: 4,
        py: 3,
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        width: `calc(100% - ${drawerWidth}px)`
      }}
    >
      <Header />
      
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Typography variant="h5" sx={{ fontWeight: '600', color: '#343A40' }}>
          Rekomendasi Preventive Maintenance
        </Typography>
        
        <TextField
          size="small"
          variant="outlined"
          placeholder="Cari data (contoh: PP001250101)"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#adb5bd' }} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: '8px',
              backgroundColor: 'white',
              fontSize: '0.9rem',
              '& .MuiOutlinedInput-notchedOutline': {
                 borderColor: '#dee2e6'
              },
               '&:hover .MuiOutlinedInput-notchedOutline': {
                 borderColor: '#495057'
              },
            }
          }}
          sx={{ width: { xs: '100%', sm: '350px' } }}
        />
      </Stack>

      <Paper sx={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#f1f3f5' }}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={selected.length > 0 && selected.length < rekomendasi.length}
                    checked={rekomendasi.length > 0 && selected.length === rekomendasi.length}
                    onChange={handleSelectAllClick}
                    sx={{ color: '#adb5bd', '&.Mui-checked': { color: '#28a745' }, '&.MuiCheckbox-indeterminate': { color: '#28a745' } }}
                  />
                </TableCell>
                {tableHeaders.map((headCell) => (
                  <TableCell key={headCell} sx={{ fontWeight: '600', color: '#495057', whiteSpace: 'nowrap' }}>
                    {headCell}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={tableHeaders.length + 1} align="center" sx={{ py: 5 }}>
                    <CircularProgress sx={{ color: '#28a745' }} />
                    <Typography>Memuat data...</Typography>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={tableHeaders.length + 1} align="center" sx={{ color: 'red', py: 5 }}>
                    {error}
                  </TableCell>
                </TableRow>
              ) : rekomendasi.length === 0 && !loading ? (
                <TableRow>
                    <TableCell colSpan={tableHeaders.length + 1} align="center" sx={{ py: 5 }}>
                        Tidak ada data. Pastikan konfigurasi Supabase Anda benar dan tabel tidak kosong.
                    </TableCell>
                </TableRow>
              ) : (
                rekomendasi.map((row) => {
                    const isItemSelected = isSelected(row.id);
                    return (
                      <TableRow 
                        key={row.id} 
                        hover
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        selected={isItemSelected}
                         sx={{
                            '&.Mui-selected, &.Mui-selected:hover': {
                                backgroundColor: 'rgba(40, 167, 69, 0.08)',
                            },
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isItemSelected}
                            onChange={(event) => handleCheckboxChange(event, row)}
                            sx={{ color: '#adb5bd', '&.Mui-checked': { color: '#28a745' } }}
                           />
                        </TableCell>
                        <TableCell>{row.id}</TableCell>
                        <TableCell>{row.idAset}</TableCell>
                        <TableCell>{row.namaAset}</TableCell>
                        <TableCell>{row.lokasiAset}</TableCell>
                        <TableCell sx={{ minWidth: 200 }}>{row.jenisRekomendasi}</TableCell>
                        <TableCell>{row.jamPenggunaan}</TableCell>
                        <TableCell>{row.lastMaintain}</TableCell>
                        <TableCell>{row.sisaJam}</TableCell>
                      </TableRow>
                    )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
             <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, value) => setCurrentPage(value)}
                color="primary"
                sx={{
                    '& .MuiPaginationItem-root': {
                        color: '#495057',
                        borderRadius: '8px',
                    },
                    '& .Mui-selected': {
                        backgroundColor: '#28a745 !important',
                        color: 'white',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 8px rgba(40, 167, 69, 0.3)',
                    },
                }}
            />
        </Box>
        <ConfirmationDialog 
            open={dialogOpen}
            onClose={handleCloseDialog}
            onConfirm={handleConfirmRepair}
            rekomendasi={selectedRekomendasi}
        />
    </Box>
  );
}


// Komponen Utama Halaman
function PMPage() {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Sidebar />
      <MainContent />
    </Box>
  );
}

export default PMPage;
