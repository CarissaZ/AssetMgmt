// src/components/DashboardLayout.jsx

import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

// Impor komponen Sidebar Anda
import Sidebar from './Sidebar'; // Pastikan path ini benar

// Impor komponen dari Material-UI
import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';

// Lebar sidebar Anda adalah 320, kita gunakan variabel ini
const sidebarWidth = 320; 

function DashboardLayout() {
  const navigate = useNavigate();

  // Fungsi untuk handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login'); // Arahkan ke login setelah logout
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* 1. MENGGUNAKAN KOMPONEN SIDEBAR ANDA */}
      <Sidebar />

      {/* 2. KONTEN UTAMA DI SEBELAH KANAN SIDEBAR */}
      <Box 
        component="div"
        sx={{
          width: `calc(100% - ${sidebarWidth}px)`, // Lebar sisa layar
          height: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* AppBar (Header) di bagian atas konten */}
        <AppBar
          position="static" // 'static' agar tidak overlay konten
          sx={{ 
            backgroundColor: '#ffffff', 
            color: '#343A40', 
            boxShadow: 'none',
            borderBottom: '1px solid #e9ecef'
          }}
        >
          <Toolbar>
            {/* Kita beri flexGrow agar tombol Logout ke pojok kanan */}
            <Box sx={{ flexGrow: 1 }} /> 
            <Button 
              variant="outlined" 
              color="error" 
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        {/* Area konten utama untuk menampilkan halaman (HomePage, AsetPage, dll) */}
        <Box 
          component="main"
          sx={{
            flexGrow: 1,
            p: 3, // padding konten
            backgroundColor: '#f8f9fa', // warna background konten
            overflowY: 'auto' // buat konten bisa di-scroll jika panjang
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default DashboardLayout;