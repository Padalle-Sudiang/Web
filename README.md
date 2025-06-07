
# Paddalle Sudiang Parking Gate Management System
Hackaton BSS Open The Gate 2025


## Overview
Proyek ini adalah Sistem Manajemen Gerbang Parkir yang dibangun menggunakan React. Ini menyediakan fungsionalitas untuk mengelola keanggotaan parkir, memvalidasi plat kendaraan, melihat statistik, dan memantau umpan kamera secara langsung. Aplikasi ini dirancang untuk administrator agar dapat mengelola operasi parkir dengan efisien.

## Table of Content
- [Installation](#installation)
- [Running Development](#running-dev)
- [Usage](#usage)
- [Features](#features)
- [Code Explanation](#code-explanation)
- [Routing](#routing)
- [Authentication](#authentication)
- [Modal Functionality](#modal-functionality)
- [Sidebar Navigation](#sidebar-navigation)
- [Live Stream Monitoring](#live-stream-monitoring)
- [Contributing](#contributing)
- [License](#license)

## Installation

Untuk menjalankan, silahkan ikuti tatacara berikut

- Clone Repository
```bash
    git clone https://github.com/Padalle-Sudiang/Web.git
```
- Navigasi ke Direktori Proyek
```bash
    cd Web
```
- Install Dependensi
```bash
    npm install
```
## Running Developing

Untuk menjalankan development

```bash
  npm run dev -- --host
```


## Usage

- Aplikasi ini dirancang untuk administrator yang dapat masuk dan mengelola operasi parkir.
- Pengguna dapat menavigasi melalui berbagai bagian menggunakan sidebar


## Features

- **Autentikasi Pengguna**: Admin dapat masuk untuk mengakses sistem.
- **Manajemen Membership**: Melihat dan mengelola membership parkir.
- **Validasi Plat**: Memvalidasi plat kendaraan untuk entri ilegal
- **Statistik**: Melihat statistik parkir.
- **Log**: Mengakses log aktivitas
- **Live Camera Feeds**: Memantau umpan kamera langsung dari berbagai lokasi


## Components

Komponen App
- **File:** `App.jsx`
- **Deskripsi:** Komponen utama yang mengatur routing dan merender tata letak aplikasi.

Komponen Login
- **File:** `LoginAdmin.jsx`
- **Deskripsi:** Menangani fungsionalitas login admin, termasuk pengiriman formulir dan penanganan kesalahan.

Komponen Modal
- **File:** `Modal.jsx`
- **Deskripsi:** Menampilkan modal untuk menambahkan atau mengedit plat kendaraan.

Komponen Sidebar
- **File:** `Sidebar.jsx`
- **Deskripsi:** Menyediakan tautan navigasi ke berbagai bagian aplikasi.

Komponen Live Camera Feeds
- **File:** `camera.jsx`
- **Deskripsi:** Memantau umpan kamera langsung dan menangani pengambilan gambar.


## Code Explanation

### App.jsx
- **Fungsi**: Mengatur routing menggunakan `React Router` dan merender komponen yang sesuai berdasarkan rute saat ini.
- **Contoh Kode:**

```javascript
  import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
  import LoginAdmin from './LoginAdmin';
  import MembershipList from './MembershipList';
  // Import komponen lainnya

  function App() {
    return (
      <Router>
        <Switch>
          <Route path="/login" component={LoginAdmin} />
          <Route path="/membership-list" component={MembershipList} />
          {/* Rute lainnya */}
        </Switch>
      </Router>
    );
  }
```

### LoginAdmin.jsx
- **Fungsi**: Menangani proses login admin, termasuk validasi kredensial.
- **Contoh Kode:**

```javascript
  const handleLogin = (event) => {
    event.preventDefault();
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      // Set status login
    } else {
      // Tampilkan pesan kesalahan
    }
  };
```

### Modal.jsx
- **Fungsi**: Menampilkan modal untuk menambahkan atau mengedit plat kendaraan.
- **Contoh Kode:**

```javascript
  const Modal = ({ isOpen, onClose, onSubmit }) => {
    return (
      <div className={`modal ${isOpen ? 'open' : ''}`}>
        <form onSubmit={onSubmit}>
          {/* Form input untuk plat kendaraan */}
          <button type="button" onClick={onClose}>Tutup</button>
          <button type="submit">Simpan</button>
        </form>
      </div>
    );
  };
```

### Sidebar.jsx
- **Fungsi**: Menyediakan navigasi ke berbagai bagian aplikasi.
- **Contoh Kode:**

```javascript
  const Sidebar = () => {
    return (
      <nav>
        <ul>
          <li><Link to="/membership-list">Daftar Keanggotaan</Link></li>
          <li><Link to="/plat-illegal">Validasi Plat</Link></li>
          {/* Tautan lainnya */}
        </ul>
      </nav>
    );
  };
```

### camera.jsx
- **Fungsi**: Memantau umpan kamera dan menangani pengambilan gambar.
- **Contoh Kode:**

```javascript
  const CameraMonitor = () => {
    const [stream, setStream] = useState(null);

    useEffect(() => {
      // Ambil umpan video dari URL
    }, []);

    return (
      <div>
        <video src={stream} autoPlay />
        <button onClick={captureImage}>Ambil Gambar</button>
      </div>
    );
  };
```

## Routing

Aplikasi ini menggunakan React Router untuk navigasi. Rute berikut didefinisikan:

- **`/`**: Layar Utama
- **`/membership-list`**: Manajemen Keanggotaan
- **`/plat-illegal`**: Validasi Plat
- **`/validation`**: Layar Validasi
- **`/statistics`**: Layar Statistik
- **`/logs`**: Log Aktivitas
- **`/camera`**: Umpan Kamera Langsung
- **`/login`**: Login Admin
## Authentication

- Kredensial admin di-hardcode untuk kesederhanaan:

```javascript
  //LoginAdmin.jsx
  const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123',
  };
```

- Aplikasi ini menggunakan local storage untuk mengelola status login dan masa berlaku sesi.
## Modal Function

- Komponen modal digunakan untuk menambahkan dan mengedit plat kendaraan.
- Ini menerima props untuk menentukan apakah modal harus ditampilkan dan jenis tindakan (tambah/edit).
## Sidebar Nav

- Sidebar berisi tautan untuk menavigasi antara berbagai bagian aplikasi.
- Ini menyoroti tab aktif berdasarkan rute saat ini.
## Live Stream Monitoring

- Komponen monitor umpan langsung mengambil umpan video dari URL yang ditentukan.
- Ini memungkinkan pengambilan gambar dan melihat entri kendaraan terbaru.