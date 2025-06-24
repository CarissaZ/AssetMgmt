// src/pages/PerbaikanPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// Material UI Components
import {
  Box, Typography, Button, Paper, Checkbox, Pagination,
  CircularProgress, TableContainer, Table, TableHead, TableBody,
  TableRow, TableCell, TextField, InputAdornment, Tabs, Tab
} from '@mui/material';

// Material UI Icons
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import SearchIcon from '@mui/icons-material/Search';

function PerbaikanPage() {
  const [tabValue, setTabValue] = useState(1);
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (tabValue !== 1) {
      setLaporan([]);
      setLoading(false);
      return;
    }

    async function fetchLaporan() {
      setLoading(true);
      setError(null);

      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, error: fetchError, count } = await supabase
        .from('tiketIT')
        .select('idTiket, idAset, tanggalPengajuan, namaPelapor, lokasi, keluhan, statusTiket', { count: 'exact' })
        .range(from, to)
        .order('tanggalPengajuan', { ascending: false });

      if (fetchError) {
        setError(`Gagal mengambil data. Pesan: ${fetchError.message}`);
        setLaporan([]);
      } else if (data) {
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
  }, [currentPage, tabValue]);

  const tableHeaders = [
    { key: 'id', label: 'ID Tiket' },
    { key: 'tanggal_pengajuan', label: 'Tanggal Pengajuan' },
    { key: 'nama_pelapor', label: 'Nama Pelapor' },
    { key: 'lokasi', label: 'Lokasi' },
    { key: 'id_aset', label: 'ID Aset' },
    { key: 'keluhan', label: 'Keluhan' },
    { key: 'status', label: 'Status' },
    { key: 'aksi', label: 'Aksi' },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const correctedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
      return correctedDate.toLocaleDateString('en-GB');
    } catch (e) {
      return 'Tanggal Invalid';
    }
  };

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
            Tiket Laporan IT
          </Typography>
          <TextField
            size="small"
            variant="outlined"
            placeholder="Cari tiket, nama, atau aset..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#adb5bd' }} />
                </InputAdornment>
              ),
              sx: { borderRadius: '8px', fontSize: '0.9rem', minWidth: '350px' }
            }}
          />
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleChangeTab} aria-label="Navigasi Tiket Laporan">
            <Tab label="Permohonan" sx={{ textTransform: 'none' }} value={0} />
            <Tab label="Tiket Laporan" sx={{ textTransform: 'none' }} value={1} />
            <Tab label="Riwayat" sx={{ textTransform: 'none' }} value={2} />
          </Tabs>
        </Box>

        {tabValue === 1 && (
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <TableContainer sx={{ minWidth: 1200 }}>
              <Table stickyHeader>
                <TableHead sx={{ backgroundColor: '#c5ebcf' }}>
                  <TableRow>
                    {tableHeaders.map((header) => (
                      <TableCell
                        key={header.key}
                        sx={{
                          fontWeight: '600',
                          color: '#495057',
                          textTransform: 'capitalize',
                          py: 1.5
                        }}
                      >
                        {header.label}
                      </TableCell>
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
                      <TableCell colSpan={tableHeaders.length} align="center" sx={{ py: 10, color: 'red' }}>
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : laporan.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={tableHeaders.length} align="center" sx={{ py: 10 }}>
                        Tidak ada data tiket laporan.
                      </TableCell>
                    </TableRow>
                  ) : (
                    laporan.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>{row.id}</TableCell>
                        <TableCell>{formatDate(row.tanggal_pengajuan)}</TableCell>
                        <TableCell>{row.nama_pelapor}</TableCell>
                        <TableCell>{row.lokasi}</TableCell>
                        <TableCell>{row.id_aset}</TableCell>
                        <TableCell>{row.keluhan}</TableCell>
                        <TableCell>{row.status}</TableCell>
                        <TableCell align="center"><Checkbox /></TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {tabValue !== 1 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography>Konten untuk tab ini belum tersedia.</Typography>
          </Box>
        )}
      </Paper>

      {totalPages > 1 && tabValue === 1 && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, value) => setCurrentPage(value)}
            color="primary"
            shape="rounded"
            sx={{ '& .Mui-selected': { backgroundColor: '#28a745 !important', color: 'white' } }}
          />
        </Box>
      )}
    </Box>
  );
}

export default PerbaikanPage;
