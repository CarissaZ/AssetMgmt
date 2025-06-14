# Sistem Manajemen Aset dengan Fitur Preventive Maintenance 

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)

Proyek tugas akhir ini bertujuan untuk membangun sebuah sistem manajemen aset berbasis website yang dilengkapi dengan fitur **Preventive Maintenance**. Sistem ini secara proaktif memonitor penggunaan PC/laptop untuk memberikan rekomendasi perawatan sebelum terjadi kerusakan.

## Latar Belakang

Manajemen aset IT di banyak organisasi seringkali bersifat reaktif—perbaikan dilakukan setelah ada laporan kerusakan. Pendekatan ini dapat mengganggu produktivitas dan memakan biaya yang lebih tinggi.

Proyek ini mengusulkan solusi proaktif dengan mengimplementasikan fitur *preventive maintenance*. Dengan memantau data penggunaan PC secara otomatis, sistem dapat mengidentifikasi aset yang memerlukan perhatian khusus dan menjadwalkan perawatan, sehingga memperpanjang umur aset dan menekan biaya perbaikan.

---

## Fitur Utama
* **Monitoring Penggunaan Aset**: Melacak total jam pemakaian setiap PC/laptop secara otomatis.
* **Rekomendasi Preventive Maintenance**: Sistem memberikan notifikasi atau status jika sebuah aset telah mencapai ambang batas jam pemakaian yang ditentukan, sebagai sinyal untuk melakukan perawatan.
* **Riwayat Perawatan**: Mencatat semua tindakan perawatan yang telah dilakukan pada aset.

---

## Arsitektur Sistem

Sistem ini terdiri dari tiga komponen utama yang bekerja sama:

1.  **PC Usage Agent (Python Script)**: Sebuah skrip Python ringan yang diinstal di setiap PC klien. Skrip ini bertugas untuk mencatat durasi penggunaan PC.
2.  **Task Scheduler (Windows)**: Pemicu yang menjalankan skrip Python secara periodik (misalnya, setiap kali PC dimatikan atau setiap hari) untuk mengirim data.
3.  **Aplikasi Web (React + Supabase)**:
    * **Supabase Backend**: Menerima data dari agen melalui *Edge Function*, menyimpannya di database Postgres, dan menyediakan API untuk aplikasi web.
    * **React Frontend**: Menampilkan data aset, status penggunaan, dan rekomendasi perawatan kepada admin atau teknisi IT.

Alur kerjanya adalah sebagai berikut:
```
[PC Klien: Python Script + Task Scheduler] ---> [Kirim Data Penggunaan] ---> [Supabase Edge Function] ---> [Simpan ke Database Supabase] ---> [Tampil di Website React]
```

---

## Teknologi yang Digunakan

| Komponen | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Frontend** | React, Vite | Membangun antarmuka pengguna yang modern dan responsif. |
| **Backend** | Supabase | *Backend-as-a-Service* untuk otentikasi, database, dan *serverless functions*. |
| **Database** | Postgres (via Supabase) | Menyimpan semua data terkait aset dan penggunaannya. |
| **Serverless**| Supabase Edge Functions | Endpoint API untuk menerima data dari agen Python. |
| **Agent** | Python | Skrip untuk memonitor dan mengirim data penggunaan dari PC klien. |

---


## Struktur Proyek

```
.
├── /PCLogAgent                 # Berisi skrip Python untuk dijalankan di PC klien
│   └── PCUsageLogger.py
├── /frontend              # Kode sumber aplikasi React + Vite
│   ├── /public
│   └── /src
├── /supabase              # Konfigurasi dan Edge Functions untuk Supabase
│   └── /functions
│       └── /nama-function
└── README.md
```

