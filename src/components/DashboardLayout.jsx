// src/components/DashboardLayout.jsx
import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Button, Typography, Drawer } from '@mui/material';

// Import ikon dari file Sidebar.jsx Anda
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import LogoutIcon from '@mui/icons-material/Logout';


const drawerWidth = 320;

function DashboardLayout() {
  const navigate = useNavigate();

  // Daftar item menu dari file Sidebar.jsx Anda
  const menuItems = [
    { text: 'Pengadaan Aset', icon: <ShoppingCartOutlinedIcon />, path: '/pengadaan' },
    { text: 'Data Aset', icon: <Inventory2OutlinedIcon />, path: '/aset' },
    { text: 'Preventive Maintain', icon: <HealthAndSafetyOutlinedIcon />, path: '/pm' },
    { text: 'Perbaikan Aset', icon: <BuildOutlinedIcon />, path: '/perbaikan' },
    { text: 'Penghapusan Aset', icon: <DeleteOutlineOutlinedIcon />, path: '/penghapusan' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  const SidebarContent = (
    <>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ p: 1, backgroundColor: '#e7f1ff', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GridViewRoundedIcon sx={{ color: '#0d6efd', fontSize: '2rem' }} />
        </Box>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: '#343A40', lineHeight: 1.3 }}>
          Sistem Manajemen{'\n'}Aset
        </Typography>
      </Box>
      <List sx={{ px: 2, mt: 2, flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1.5 }}>
            <ListItemButton
              component={NavLink}
              to={item.path}
              // PERUBAHAN UTAMA ADA DI SINI
              sx={{
                borderRadius: '10px',
                py: 1.5,
                px: 2,
                
                // --- Gaya untuk tombol yang TIDAK AKTIF ---
                backgroundColor: 'transparent', // Latar belakang putih/transparan
                '& .MuiListItemIcon-root': {
                  color: '#28a745', // Ikon hijau
                },
                '& .MuiListItemText-primary': {
                  color: '#28a745', // Teks hijau
                  fontWeight: '600',  // Teks tebal
                },
                '&:hover': {
                   backgroundColor: 'rgba(40, 167, 69, 0.08)', // Efek hover hijau tipis
                },
                
                // --- Gaya ini akan menimpa gaya di atas JIKA link aktif ---
                // React Router akan otomatis menambahkan class "active"
                '&.active': {
                  backgroundColor: '#28a745', 
                  color: 'white', 
                  boxShadow: '0 4px 12px rgba(40, 167, 69, 0.25)',
                  '& .MuiListItemIcon-root': {
                    color: 'white', // Ikon putih saat aktif
                  },
                  '& .MuiListItemText-primary': {
                    color: 'white', // Teks putih saat aktif
                  },
                  '&:hover': {
                    backgroundColor: '#218838', // Efek hover hijau lebih gelap
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Divider sx={{ mb: 2 }} />
        <Button variant="outlined" fullWidth onClick={handleLogout} startIcon={<LogoutIcon />}>
          Logout
        </Button>
      </Box>
    </>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e9ecef',
            display: 'flex',
            flexDirection: 'column'
          },
        }}
      >
        {SidebarContent}
      </Drawer>
      <Box 
        component="main"
        sx={{ flexGrow: 1, p: 3, width: `calc(100% - ${drawerWidth}px)`, overflowY: 'auto', height: '100vh', backgroundColor: '#f8f9fa' }} 
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default DashboardLayout;
