// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

// Impor kerangka utama dan SEMUA halaman
import App from './App.jsx';
import LoginPage from './pages/LoginPage.jsx'; // Halaman login
import HomePage from './pages/HomePage.jsx';
import AsetPage from './pages/AsetPage.jsx';
import PMPage from './pages/PMPage.jsx';
import PerbaikanPage from './pages/PerbaikanPage.jsx';
import './index.css';

// Membuat "peta" websitenya dengan semua halaman
const router = createBrowserRouter([
  // Rute untuk halaman login, ini bersifat publik
  {
    path: "/login",
    element: <LoginPage />,
  },
  // Rute utama ("/") yang akan dilindungi
  {
    path: "/",
    element: <App />, // App akan bertindak sebagai penjaga (guard)
    children: [
      // Halaman default akan diarahkan ke /pm
      {
        index: true,
        element: <Navigate to="/pm" replace />,
      },
      {
        path: "homepage", // Path diubah agar tidak bentrok dengan index
        element: <HomePage />,
      },
      {
        path: "aset",
        element: <AsetPage />,
      },
      {
        path: "pm",
        element: <PMPage />,
      },
      {
        path: "perbaikan", 
        element: <PerbaikanPage />, 
      },
    ],
  },
]);

// Render aplikasi
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
