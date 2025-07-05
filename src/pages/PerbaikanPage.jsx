// src/pages/PerbaikanPage.jsx
import React, { useState } from 'react';
import { Box, Paper, Tabs, Tab, Typography } from '@mui/material';

// Impor komponen-komponen anak dari folder components
import PermohonanTab from '../components/perbaikan/PermohonanTab';
import TiketLaporanTab from '../components/perbaikan/TiketLaporanTab';
import RiwayatTab from '../components/perbaikan/RiwayatTab';

function PerbaikanPage() {
  const [tabValue, setTabValue] = useState(1); // Default ke "Tiket Laporan"

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
      <Paper elevation={0} sx={{ borderRadius: '12px', border: '1px solid #dee2e6' }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: '600' }}>
            Perbaikan Aset
          </Typography>
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleChangeTab}>
            <Tab label="Permohonan Biaya" value={0} />
            <Tab label="Tiket Laporan" value={1} />
            <Tab label="Riwayat" value={2} />
          </Tabs>
        </Box>

        {/* Menampilkan komponen yang sesuai dengan tab yang aktif */}
        <Box sx={{ p: 3 }}>
          {tabValue === 0 && <PermohonanTab />}
          {tabValue === 1 && <TiketLaporanTab />}
          {tabValue === 2 && <RiwayatTab />}
        </Box>
      </Paper>
    </Box>
  );
}

export default PerbaikanPage;