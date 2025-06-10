// src/components/Sidebar.jsx

import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

// Import semua ikon yang dibutuhkan
import HomeIcon from '@mui/icons-material/Home';
import InventoryIcon from '@mui/icons-material/Inventory'; // Ikon untuk Data Aset
import BuildIcon from '@mui/icons-material/Build'; // Ikon untuk Perbaikan Aset

const drawerWidth = 240;

function Sidebar() {
  const location = useLocation();

  // Sesuaikan menu ini dengan halaman dan path yang sudah kamu buat
  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Data Aset', icon: <InventoryIcon />, path: '/aset' },
    { text: 'Perbaikan Aset', icon: <BuildIcon />, path: '/pm' },
    // Tambahkan menu lain di sini jika perlu
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', backgroundColor: '#f5f5f5', borderRight: 'none' },
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Sistem Manajemen Aset
        </Typography>
      </Toolbar>
      <Box sx={{ overflow: 'auto', pt: 2 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ pl: 2, pr: 2 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={location.pathname === item.path}
                sx={{
                  borderRadius: '8px',
                  '&.Mui-selected': {
                    backgroundColor: '#1976d2',
                    color: 'white',
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}

export default Sidebar;