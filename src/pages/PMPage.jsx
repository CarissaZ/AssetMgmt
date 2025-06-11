// src/pages/PMPage.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Pastikan path ini benar

// Import komponen dari Material-UI
import { 
    Box, Typography, Button, TextField, InputAdornment, Stack, Paper, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Checkbox, Pagination, CircularProgress, Drawer, List, ListItem, 
    ListItemButton, ListItemText, ListItemIcon, CssBaseline 
} from '@mui/material';

// Import ikon dari Material-UI
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import BuildIcon from '@mui/icons-material/Build';
import DeleteIcon from '@mui/icons-material/Delete';
import AppsIcon from '@mui/icons-material/Apps'; // Contoh ikon untuk logo

const drawerWidth = 240; // Lebar sidebar

// Komponen untuk Sidebar Navigasi
function Sidebar() {
    const menuItems = [
        { text: 'Pengadaan Aset', icon: <ShoppingCartIcon /> },
        { text: 'Data Aset', icon: <InventoryIcon /> },
        { text: 'Perbaikan Aset', icon: <BuildIcon /> },
        { text: 'Penghapusan Aset', icon: <DeleteIcon /> },
    ];

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { 
                    width: drawerWidth, 
                    boxSizing: 'border-box',
                    borderRight: 'none' // Menghilangkan border kanan default
                },
            }}
        >
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AppsIcon sx={{ color: 'green' }}/>
                <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
                    Sistem Manajemen Aset
                </Typography>
            </Box>
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                            sx={{
                                minHeight: 48,
                                px: 2.5,
                                // Style untuk item aktif (Perbaikan Aset)
                                ...(item.text === 'Perbaikan Aset' && {
                                    backgroundColor: '#e0f2e0', // Warna hijau muda
                                    color: 'green',
                                    '& .MuiSvgIcon-root': { // Style untuk ikon
                                        color: 'green',
                                    },
                                    '&:hover': {
                                        backgroundColor: '#d0e8d0', // Warna saat hover
                                    }
                                }),
                            }}
                        >
                            <ListItemIcon>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Drawer>
    );
}


// Komponen Utama untuk Halaman PM (Konten di sebelah kanan)
function PMContent() {
    const [rekomendasi, setRekomendasi] = useState([]);
    const [loading, setLoading] = useState(true);

    // Contoh data dummy agar tampilan sesuai gambar, ganti dengan fetchRekomendasi jika Supabase sudah siap
    useEffect(() => {
        const dummyData = [
            { idRekomendasi: 'PM001', idAset: 'IT201250101', namaAset: 'PC Lenovo 1', lokasiAset: 'KGD 1', jenisRekomendasi: 'pembersihan kipas, software update, cek memory', jamPenggunaan: 880, estMaintain: 0, sisaJam: 20 },
            { idRekomendasi: 'PM002', idAset: 'IT201250110', namaAset: 'PC Lenovo 2', lokasiAset: 'KGD 1', jenisRekomendasi: 'dalam batas aman', jamPenggunaan: 100, estMaintain: 0, sisaJam: 800 },
        ];
        
        setRekomendasi(dummyData);
        setLoading(false);
        // Hapus atau komentari bagian ini dan aktifkan fetchRekomendasi() di bawah jika ingin mengambil data dari Supabase
        
        // fetchRekomendasi();
    }, []);

    async function fetchRekomendasi() {
        try {
            setLoading(true);
            // Ganti 'rekomendasi_pm' dengan nama tabel kamu yang sebenarnya di Supabase
            const { data, error } = await supabase
                .from('rekomendasi_pm')
                .select('*');

            if (error) throw error;
            if (data) setRekomendasi(data);
        } catch (error) {
            console.error('Error fetching data:', error.message);
        } finally {
            setLoading(false);
        }
    }
    
    return (
        <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
            {/* Header: Profile */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button startIcon={<AccountCircleIcon />}>Profile</Button>
            </Box>

            {/* Navigasi Tab dan Search Bar */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                    <Button sx={{ textTransform: 'none', color: 'grey.700' }}>Permohonan</Button>
                    <Button variant="contained" sx={{ textTransform: 'none', backgroundColor: 'white', color:'black', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>PM</Button>
                    <Button sx={{ textTransform: 'none', color: 'grey.700' }}>Riwayat</Button>
                    <Button sx={{ textTransform: 'none', color: 'grey.700' }}>Tiket Laporan</Button>
                </Paper>
                <TextField 
                    size="small" 
                    placeholder="Cari data (contoh: PP001250101)" 
                    InputProps={{ 
                        startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>),
                        sx: { borderRadius: '8px' } // membuat sudut search bar lebih bulat
                    }}
                />
            </Stack>
            
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Rekomendasi Preventive Maintenance
            </Typography>

            {/* Tabel Data */}
            <Paper sx={{ borderRadius: '8px', overflow: 'hidden' }}>
                <TableContainer>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                             {/* Mengubah header agar sesuai gambar */}
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>idRekomendasi</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>idAset</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>namaAset</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>lokasiAset</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>jenisRekomendasi</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>jamPenggunaan</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>lastMaintain</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>sisaJam</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>aksi</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : rekomendasi.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">
                                        Tidak ada data rekomendasi.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rekomendasi.map((row) => (
                                    <TableRow key={row.idRekomendasi} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        {/* Sesuaikan nama 'row.nama_kolom' dengan kolom di Supabase */}
                                        <TableCell>{row.idRekomendasi}</TableCell>
                                        <TableCell>{row.idAset}</TableCell>
                                        <TableCell>{row.namaAset}</TableCell>
                                        <TableCell>{row.lokasiAset}</TableCell>
                                        <TableCell>{row.jenisRekomendasi}</TableCell>
                                        <TableCell>{row.jamPenggunaan}</TableCell>
                                        {/* Kolom baru yang ditambahkan */}
                                        <TableCell>{row.estMaintain}</TableCell> 
                                        <TableCell>{row.sisaJam}</TableCell>
                                        <TableCell><Checkbox /></TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Paginasi */}
            <Stack alignItems="center" sx={{ mt: 3 }}>
                <Pagination 
                    count={3} 
                    variant="outlined" 
                    shape="rounded"
                    sx={{
                        '& .Mui-selected': { // Style untuk halaman yang aktif
                            backgroundColor: 'green',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'darkgreen',
                            }
                        }
                    }}
                />
            </Stack>
        </Box>
    );
}

// Komponen Halaman Utama yang menggabungkan Sidebar dan Konten
export default function PMPage() {
    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <Sidebar />
            <PMContent />
        </Box>
    );
}