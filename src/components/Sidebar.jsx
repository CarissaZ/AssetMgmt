// src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, Typography, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';

const drawerWidth = 320;

function Sidebar() {
    const menuItems = [
      { text: 'Pengadaan Aset', icon: <ShoppingCartOutlinedIcon />, path: '/pengadaan' },
      { text: 'Data Aset', icon: <Inventory2OutlinedIcon />, path: '/aset' },
      { text: 'Preventive Maintain', icon: <HealthAndSafetyOutlinedIcon />, path: '/pm' },
      { text: 'Perbaikan Aset', icon: <BuildOutlinedIcon />, path: '/perbaikan' },
      { text: 'Penghapusan Aset', icon: <DeleteOutlineOutlinedIcon />, path: '/penghapusan' },
    ];
    const location = useLocation();
    const activePath = location.pathname;
  
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
            borderRight: '1px solid #e9ecef',
          },
        }}
      >
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ p: 1, backgroundColor: '#e7f1ff', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GridViewRoundedIcon sx={{ color: '#0d6efd', fontSize: '2rem' }} />
          </Box>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: '#343A40', lineHeight: 1.3 }}>
            Sistem Manajemen{'\n'}Aset
          </Typography>
        </Box>
        <List sx={{ px: 2, mt: 2 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} component={Link} to={item.path} disablePadding sx={{ mb: 1.5, textDecoration: 'none' }}>
              <ListItemButton selected={activePath === item.path}
                sx={{
                  borderRadius: '10px',
                  py: 1.5,
                  px: 2,
                  '&.Mui-selected': {
                    backgroundColor: '#28a745', color: 'white', boxShadow: '0 4px 12px rgba(40, 167, 69, 0.25)',
                    '&:hover': { backgroundColor: '#218838' },
                    '& .MuiListItemIcon-root': { color: 'white' },
                  },
                  '&:not(.Mui-selected)': {
                    color: '#343A40',
                    '&:hover': { backgroundColor: '#f1f3f5' },
                    '& .MuiListItemIcon-root': { color: '#495057' },
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} sx={{ '& .MuiListItemText-primary': { fontWeight: 500 } }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    );
}

export default Sidebar;
