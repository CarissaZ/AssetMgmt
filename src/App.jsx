// src/App.jsx
import { Outlet } from "react-router-dom";
import { Box, CssBaseline } from '@mui/material';
import Sidebar from './components/Sidebar'; // Impor sidebar

function App() {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline /> {/* Mereset gaya default browser */}
      <Sidebar /> {/* Tampilkan Sidebar di sini */}

      {/* Ini adalah area untuk konten utama */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#ffffff' }}>
        {/* Halaman-halaman dari router akan muncul di sini */}
        <Outlet />
      </Box>
    </Box>
  );
}

export default App;