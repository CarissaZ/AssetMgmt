import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// Material UI Components
import {
  Box,
  Typography,
  Button,
  Paper,
  Tabs,
  Tab,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  InputAdornment,
  CircularProgress,
  Pagination,
  Stack, // <-- Komponen baru untuk menata tombol
} from '@mui/material';

// Material UI Icons
import SearchIcon from '@mui/icons-material/Search';

function AsetPage() {
  // State untuk data dan UI
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk filter dan pencarian
  const [topTabValue, setTopTabValue] = useState(0); // 0: Daftar Aset, 1: Daftar Resi
  const [statusFilter, setStatusFilter] = useState('Aktif'); // Filter status: Aktif, Nonaktif, Diperbaiki
  const [searchTerm, setSearchTerm] = useState('');

  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 5; // Anda bisa sesuaikan jumlah item per halaman
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Efek untuk mengambil data dari Supabase
  useEffect(() => {
    async function fetchAssets() {
      setLoading(true);
      setError(null);

      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      let query = supabase
        .from('Aset')
        .select('*', { count: 'exact' });

      // Filter berdasarkan status
      query = query.eq('statusAset', statusFilter);

      // Filter pencarian
      if (searchTerm) {
        query = query.or(`namaAset.ilike.%${searchTerm}%,idAset.ilike.%${searchTerm}%,lokasiAset.ilike.%${searchTerm}%`);
      }

      // Pagination dan urutan
      query = query.range(from, to).order('awalPenggunaan', { ascending: false });

      const { data, error: fetchError, count } = await query;
      
      if (fetchError) {
        console.error('Error fetching assets:', fetchError);
        setError(`Gagal mengambil data: ${fetchError.message}.`);
      } else {
        setAssets(data);
        setTotalItems(count);
      }
      setLoading(false);
    }

    fetchAssets();
  }, [currentPage, statusFilter, searchTerm]);

  // Handler untuk perubahan state
  const handleTopTabChange = (event, newValue) => {
    setTopTabValue(newValue);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };
  
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };
  
  const tableHeaders = ['idAset', 'idResi', 'namaAset', 'spesifikasi', 'statusAset', 'tipeAset', 'harga', 'lokasiAset', 'penggunaAset', 'awalPenggunaan'];

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 48px)' }}>
      {/* ====================================================================== */}
      {/* VVVV BAGIAN ATAS YANG DIROMBAK TOTAL VVVV */}
      {/* ====================================================================== */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        {/* Sisi Kiri: Judul dan Tab Utama */}
        <Stack direction="column">
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Data Aset
            </Typography>
            <Tabs 
                value={topTabValue} 
                onChange={handleTopTabChange}
                TabIndicatorProps={{ style: { display: "none" } }} // Menghilangkan garis bawah
                sx={{ minHeight: 'auto', mt: 1}}
            >
                <Tab label="Daftar Aset" sx={{ textTransform: 'none', minHeight: 'auto', padding: '6px 16px', borderRadius: '8px', '&.Mui-selected': { backgroundColor: '#e0e0e0' } }} />
                <Tab label="Daftar Resi" sx={{ textTransform: 'none', minHeight: 'auto', padding: '6px 16px', borderRadius: '8px', '&.Mui-selected': { backgroundColor: '#e0e0e0' } }}/>
            </Tabs>
        </Stack>

        {/* Sisi Kanan: Tombol Filter Status dan Pencarian */}
        <Stack direction="row" spacing={2} alignItems="center">
            <Stack direction="row" spacing={1} sx={{ backgroundColor: '#e9ecef', p: 0.5, borderRadius: '12px' }}>
                <Button 
                    variant={statusFilter === 'Aktif' ? 'contained' : 'text'}
                    onClick={() => handleStatusFilterChange('Aktif')}
                    sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: statusFilter === 'Aktif' ? 'bold' : 'normal', color: statusFilter === 'Aktif' ? 'white' : 'black', backgroundColor: statusFilter === 'Aktif' ? '#28a745' : 'transparent', '&:hover': { backgroundColor: statusFilter === 'Aktif' ? '#218838' : '#f1f3f5' } }}
                >
                    Aktif
                </Button>
                <Button 
                    variant={statusFilter === 'Nonaktif' ? 'contained' : 'text'}
                    onClick={() => handleStatusFilterChange('Nonaktif')}
                    sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: statusFilter === 'Nonaktif' ? 'bold' : 'normal', color: statusFilter === 'Nonaktif' ? 'white' : 'black', backgroundColor: statusFilter === 'Nonaktif' ? '#ffc107' : 'transparent', '&:hover': { backgroundColor: statusFilter === 'Nonaktif' ? '#e0a800' : '#f1f3f5' } }}
                >
                    Nonaktif
                </Button>
                <Button 
                    variant={statusFilter === 'Diperbaiki' ? 'contained' : 'text'}
                    onClick={() => handleStatusFilterChange('Diperbaiki')}
                    sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: statusFilter === 'Diperbaiki' ? 'bold' : 'normal', color: statusFilter === 'Diperbaiki' ? 'white' : 'black', backgroundColor: statusFilter === 'Diperbaiki' ? '#007bff' : 'transparent', '&:hover': { backgroundColor: statusFilter === 'Diperbaiki' ? '#0056b3' : '#f1f3f5' } }}
                >
                    Diperbaiki
                </Button>
            </Stack>
            <TextField
                size="small"
                variant="outlined"
                placeholder="Cari data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                    startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                    ),
                    sx: { borderRadius: '8px', backgroundColor: 'white' }
                }}
            />
        </Stack>
      </Box>
      {/* ====================================================================== */}
      {/* ^^^^ AKHIR DARI BAGIAN YANG DIROMBAK ^^^^ */}
      {/* ====================================================================== */}

      {/* BAGIAN TABEL DATA */}
      <Paper elevation={0} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ '& .MuiTableCell-root': { backgroundColor: '#f4f6f8', fontWeight: 'bold', borderBottom: '1px solid #dee2e6' } }}>
                {tableHeaders.map((header) => (
                  <TableCell key={header} sx={{ textTransform: 'capitalize' }}>{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={tableHeaders.length} align="center" sx={{ py: 10 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={tableHeaders.length} align="center" sx={{ py: 10, color: 'error.main' }}>
                    {error}
                  </TableCell>
                </TableRow>
              ) : (
                assets.map((row) => (
                  <TableRow key={row.idAset} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>{row.idAset}</TableCell>
                    <TableCell>{row.idResi}</TableCell>
                    <TableCell sx={{ fontWeight: '500' }}>{row.namaAset}</TableCell>
                    <TableCell>{row.spesifikasi}</TableCell>
                    <TableCell>
                      <Box component="span" sx={{ 
                        backgroundColor: row.statusAset === 'Aktif' ? '#d4edda' : row.statusAset === 'Diperbaiki' ? '#fff3cd' : '#f8d7da',
                        color: row.statusAset === 'Aktif' ? '#155724' : row.statusAset === 'Diperbaiki' ? '#856404' : '#721c24',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '0.8rem'
                      }}>
                        {row.statusAset}
                      </Box>
                    </TableCell>
                    <TableCell>{row.tipeAset}</TableCell>
                    <TableCell>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(row.harga)}</TableCell>
                    <TableCell>{row.lokasiAset}</TableCell>
                    <TableCell>{row.penggunaAset}</TableCell>
                    <TableCell>{new Date(row.awalPenggunaan).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* BAGIAN PAGINATION */}
      {totalPages > 1 && !loading && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Pagination 
            count={totalPages} 
            page={currentPage} 
            onChange={handlePageChange} 
            color="primary" 
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
}

export default AsetPage;