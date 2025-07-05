// src/App.jsx

import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';

// Material UI Components
import { CircularProgress, Box } from '@mui/material';

// Import Komponen Layout
import DashboardLayout from './components/DashboardLayout';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Ambil sesi yang sedang berjalan saat pertama kali dimuat
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    // 2. Dengarkan perubahan status login/logout
    // Ini akan otomatis terpanggil saat user login atau logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false); // Pastikan loading selesai setelah status berubah
    });

    fetchSession();

    // 3. Hentikan listener saat komponen tidak lagi digunakan
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Tampilkan indikator loading saat sesi sedang diperiksa
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Jika ada sesi (sudah login), tampilkan layout dashboard yang berisi halaman anak.
  // Jika tidak ada sesi, arahkan ke halaman login.
  return session ? (
    <DashboardLayout>
      <Outlet /> 
    </DashboardLayout>
  ) : (
    <Navigate to="/login" />
  );
}

export default App;