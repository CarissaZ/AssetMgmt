// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Impor kerangka utama dan SEMUA halaman
import App from './App.jsx';
import HomePage from './pages/HomePage.jsx';
import AsetPage from './pages/AsetPage.jsx'; // Menggunakan nama AsetPage.jsx
import PMPage from './pages/PMPage.jsx';
import './index.css';

// Membuat "peta" websitenya dengan semua halaman
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "aset", // Path untuk Halaman Data Aset
        element: <AsetPage />,
      },
      {
        path: "pm", // Path untuk Halaman Preventive Maintenance
        element: <PMPage />,
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