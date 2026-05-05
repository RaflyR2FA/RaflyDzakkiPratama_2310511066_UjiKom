# RaflyDzakkiPratama_2310511066_UjiKom

# Sistem Manajemen Inventaris Peralatan Kantor
**Dokumentasi Proyek Uji Kompetensi (LSP)**

[![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)

Aplikasi berbasis web untuk mengotomatisasi, melacak, dan mengelola sirkulasi peralatan serta aset di lingkungan perkantoran. Sistem ini dibangun dengan arsitektur *Decoupled* (*Client-Server* terpisah), menggunakan **Laravel** sebagai penyedia RESTful API di sisi peladen (*backend*) dan **React + Vite** sebagai antarmuka pengguna yang reaktif di sisi klien (*frontend*).

Proyek ini dikembangkan secara spesifik untuk memenuhi persyaratan penilaian **Uji Kompetensi**.

---

## Fitur Utama

- **Role-Based Access Control (RBAC):** Sistem pembagian hak akses pengguna secara ketat menjadi tiga level: `Admin`, `Moderator`, dan `Staff`.
- **Manajemen Aset & Inventaris:** Pendataan unit barang dengan pencatatan kode unik, kategori, kondisi fisik (`good`, `damaged`, `under_repair`), serta pelacakan ketersediaan stok fisik dan stok siap pinjam secara otomatis.
- **Workflow Peminjaman Barang:** Alur transaksional terstruktur dengan mesin status (*State Machine*): `waiting` ➔ `accepted`/`rejected` ➔ `borrowed` ➔ `returned`.
- **Jejak Audit Otomatis:** Perekaman *timestamps* otonom untuk melacak setiap rekam logistis (waktu pengajuan, penyetujuan, peminjaman, dan pengembalian barang).
- **Proteksi Data (Soft Deletes):** Perlindungan data aset menggunakan *Soft Deletes* untuk mencegah kehilangan riwayat historis apabila aset dihapus dari sistem.

---

## Teknologi yang Digunakan
**Backend:**
- PHP 8.x
- Laravel 11.x
- MySQL / MariaDB
**Frontend:**
- Node.js
- React.js
- Vite (Build Tool & HMR)

---

## Panduan Instalasi & Konfigurasi

Pastikan Anda telah menginstal **PHP**, **Composer**, **Node.js**, dan perangkat lunak basis data (**MySQL/MariaDB**) di sistem Anda sebelum memulai.

### 1. Kloning Repositori
- git clone [https://github.com/RaflyR2FA/RaflyDzakkiPratama_2310511066_UjiKom.git](https://github.com/RaflyR2FA/RaflyDzakkiPratama_2310511066_UjiKom.git)
- cd RaflyDzakkiPratama_2310511066_UjiKom

### 2. Setup Backend (Laravel API)
- cd backend
- composer install
- cp .env.example .env
- php artisan key:generate
- php artisan migrate --seed
- php artisan serve

Server frontend akan berjalan di http://localhost:5173 (atau port lain yang disediakan oleh Vite).

---

## Struktur Basis Data Utama
Sistem ini ditopang oleh relasi basis data yang tangguh:
- **users**: Menyimpan kredensial autentikasi, level peran (role), dan departemen.
- **items**: Entitas logistik aset dengan pemisahan atribut total_quantity dan available_quantity.
- **borrows**: Tabel transaksional sirkulasi barang yang menghubungkan users dan items melalui proteksi Foreign Key (dengan metode Cascade On Delete).

---

## Dokumentasi API (Endpoints)
Sistem ini menyediakan layanan RESTful API dengan rute-rute berikut:

### Autentikasi (`AuthController`)
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `POST` | `/api/login` | Autentikasi pengguna dan mendapatkan token. |
| `POST` | `/api/register` | Pendaftaran pengguna baru. |
| `POST` | `/api/logout` | Menghapus sesi/token pengguna saat ini. |
| `GET` | `/api/me` | Mengambil data profil pengguna yang sedang login. |

### Manajemen Inventaris (`ItemController`)
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/api/items` | Menampilkan seluruh daftar aset/barang. |
| `POST` | `/api/items` | Menambahkan data barang baru ke inventaris. |
| `GET` | `/api/items/categories`| Menampilkan daftar kategori barang. |
| `GET` | `/api/items/{item_code}` | Menampilkan detail spesifik dari suatu barang. |
| `PUT` | `/api/items/{item_code}` | Memperbarui informasi atau stok barang. |
| `DELETE`| `/api/items/{item_code}` | Menghapus barang dari sistem (*Soft Delete*). |

### Sirkulasi Peminjaman (`BorrowController`)
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/api/borrows` | Menampilkan riwayat dan daftar pengajuan peminjaman. |
| `POST` | `/api/borrows` | Mengajukan permintaan peminjaman barang (Staf). |
| `GET` | `/api/borrows/{borrow_code}` | Menampilkan detail transaksi peminjaman. |
| `POST` | `/api/borrows/{borrow_code}/accept` | Menerima pengajuan peminjaman (Admin/Moderator). |
| `POST` | `/api/borrows/{borrow_code}/reject` | Menolak pengajuan peminjaman (Admin/Moderator). |
| `POST` | `/api/borrows/{borrow_code}/return` | Menyelesaikan peminjaman / barang dikembalikan. |

### Laporan & Log (`ReportController`)
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/api/reports/dashboard` | Mengambil data statistik ringkas untuk *Dashboard*. |
| `GET` | `/api/reports/summary` | Mengambil ringkasan laporan inventaris & sirkulasi. |
| `GET` | `/api/reports/activity-log`| Menampilkan log aktivitas (*Audit Trail*) sistem. |