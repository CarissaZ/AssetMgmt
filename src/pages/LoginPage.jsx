// src/pages/LoginPage.jsx
import React, { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography } from '@mui/material';

function LoginPage() {
  const navigate = useNavigate();

  // Cek sesi pengguna. Jika pengguna sudah login, langsung arahkan ke halaman utama.
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/'); // Arahkan ke halaman dashboard/utama Anda
      }
    };
    checkSession();

    // Listener untuk mendeteksi perubahan status login (misal: setelah login berhasil)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate('/'); // Arahkan ke halaman dashboard/utama Anda
      }
    });

    // Membersihkan listener saat komponen di-unmount
    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <Box 
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
      }}
    >
      <Paper 
        elevation={3}
        sx={{
          padding: { xs: 2, sm: 4 },
          width: '100%',
          maxWidth: '400px',
          borderRadius: '12px'
        }}
      >
        <Typography variant="h5" component="h1" sx={{ textAlign: 'center', mb: 3, fontWeight: 'bold' }}>
          Sistem Manajemen Aset
        </Typography>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google']} // Anda bisa hapus atau tambah provider lain seperti 'github'
          theme="light"
          localization={{
            variables: {
              sign_in: {
                email_label: 'Alamat Email',
                password_label: 'Kata Sandi',
                button_label: 'Masuk',
                social_provider_text: 'Masuk dengan {{provider}}',
              },
               sign_up: {
                email_label: 'Alamat Email',
                password_label: 'Kata Sandi',
                button_label: 'Daftar',
                social_provider_text: 'Daftar dengan {{provider}}',
              },
            },
          }}
        />
      </Paper>
    </Box>
  );
}

export default LoginPage;
