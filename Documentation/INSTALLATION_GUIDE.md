# 🎮 Game Online Platform - Installation Guide

Panduan instalasi lengkap untuk platform game online berbasis React dengan autentikasi, manajemen game, dan fitur sosial.

## 📋 Daftar Isi

1. [Prerequisites](#prerequisites)
2. [Clone Repository](#clone-repository)
3. [Install Dependencies](#install-dependencies)
4. [Environment Setup](#environment-setup)
5. [Database Setup (Supabase)](#database-setup-supabase)
6. [Google OAuth Setup](#google-oauth-setup-opsional)
7. [Development Server](#development-server)
8. [Build untuk Production](#build-untuk-production)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)
11. [Fitur Platform](#fitur-platform)

## 🔧 Prerequisites

Pastikan sistem Anda memiliki:

- **Node.js** (versi 18.0.0 atau lebih tinggi)
- **npm** (versi 8.0.0 atau lebih tinggi) atau **yarn**
- **Git** untuk version control
- **Browser modern** (Chrome, Firefox, Safari, Edge)
- **Akun Supabase** (gratis di [supabase.com](https://supabase.com))
- **Akun Google Cloud** (opsional, untuk Google OAuth)

### Verifikasi Prerequisites

```bash
# Cek versi Node.js
node --version

# Cek versi npm
npm --version

# Cek versi Git
git --version
```

## 📥 Clone Repository

```bash
# Clone repository
git clone https://github.com/ZiolesXy/game-online
cd game-online

# Atau jika menggunakan SSH
git clone git@github.com:username/game-online.git
cd game-online
```

## 📦 Install Dependencies

```bash
# Install semua dependencies
npm install

# Atau menggunakan yarn
yarn install
```

### Dependencies yang Akan Terinstall

**Production Dependencies:**
- `react` & `react-dom` - Framework utama
- `react-router-dom` - Routing system
- `@supabase/supabase-js` - Database & authentication
- `@heroicons/react` - Icon library
- `chess.js` - Chess game logic
- `classnames` - CSS class utilities
- `firebase` - Additional services
- `libsodium-wrappers` - Encryption utilities

**Development Dependencies:**
- `vite` - Build tool dan dev server
- `typescript` - Type safety
- `tailwindcss` - CSS framework
- `eslint` - Code linting
- Dan lainnya...

## ⚙️ Environment Setup

### 1. Copy Environment File

```bash
# Copy file environment example
cp .env.example .env
```

### 2. Edit Environment Variables

Buka file `.env` dan isi dengan konfigurasi Anda:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> ⚠️ **Penting**: Jangan commit file `.env` ke repository. File ini sudah ada di `.gitignore`.

## 🗄️ Database Setup (Supabase)

### 1. Buat Project Supabase

1. Kunjungi [supabase.com](https://supabase.com)
2. Sign up atau login ke akun Anda
3. Klik **"New Project"**
4. Isi detail project:
   - **Name**: `game-online` (atau nama pilihan Anda)
   - **Database Password**: Pilih password yang kuat
   - **Region**: Pilih region terdekat dengan user Anda
5. Tunggu project selesai dibuat (2-3 menit)

### 2. Dapatkan Credentials

1. Di Supabase dashboard, pergi ke **Settings** > **API**
2. Copy nilai berikut:
   - **Project URL** (contoh: `https://abc123.supabase.co`)
   - **Anon public key** (dimulai dengan `eyJ...`)
3. Masukkan ke file `.env` Anda

### 3. Setup Database Schema

1. Di Supabase dashboard, pergi ke **SQL Editor**
2. Buka file `supabase/start.sql` di project Anda
3. Copy seluruh isi file dan paste ke SQL Editor
4. Klik **"Run"** untuk execute

Schema ini akan membuat:
- ✅ Tabel `users` untuk profile pengguna
- ✅ Tabel `friends` untuk sistem pertemanan
- ✅ Tabel `games` untuk storage game
- ✅ Row Level Security (RLS) policies
- ✅ Database functions untuk CRUD operations
- ✅ Triggers untuk otomasi

### 4. Konfigurasi Authentication

1. Pergi ke **Authentication** > **Settings**
2. Konfigurasi:
   - **Site URL**: `http://localhost:5173` (development)
   - **Redirect URLs**: Tambahkan `http://localhost:5173`
   - **Email confirmations**: Enable jika diinginkan

## 🔐 Google OAuth Setup (Opsional)

Jika Anda ingin mengaktifkan login dengan Google:

### 1. Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih existing project
3. Aktifkan **Google+ API** dan **Google Identity API**

### 2. OAuth Consent Screen

1. Pergi ke **APIs & Services** > **OAuth consent screen**
2. Pilih **External** user type
3. Isi informasi aplikasi:
   - **App name**: `Game Online Platform`
   - **User support email**: email Anda
   - **Developer contact**: email Anda
4. Tambahkan scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`

### 3. Buat OAuth 2.0 Client ID

1. Pergi ke **APIs & Services** > **Credentials**
2. Klik **Create Credentials** > **OAuth 2.0 Client ID**
3. Pilih **Web application**
4. Konfigurasi:
   - **Name**: `Game Online Web Client`
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (development)
     - `https://yourdomain.com` (production)
   - **Authorized redirect URIs**:
     - `http://localhost:5173/auth/callback`

### 4. Konfigurasi di Supabase

1. Di Supabase dashboard, pergi ke **Authentication** > **Providers**
2. Enable **Google**
3. Masukkan **Client ID** dan **Client Secret** dari Google Cloud Console
4. Tambahkan redirect URLs di **Authentication** > **URL Configuration**

### 5. Jalankan Migration

```bash
# Jika menggunakan Supabase CLI
supabase db push

# Atau manual: copy isi supabase/migrations/ ke SQL Editor
```

## 🚀 Development Server

### Start Development Server

```bash
# Start development server
npm run dev

# Atau menggunakan yarn
yarn dev
```

Server akan berjalan di `http://localhost:5173`

### Available Scripts

```bash
# Development server
npm run dev

# Build untuk production
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
```

### Verifikasi Installation

1. Buka browser dan kunjungi `http://localhost:5173`
2. Anda akan melihat halaman authentication
3. Test fitur-fitur berikut:
   - ✅ Register dengan email/password
   - ✅ Login dengan email/password
   - ✅ Login dengan Google (jika dikonfigurasi)
   - ✅ Reset password
   - ✅ Profile management
   - ✅ Game upload dan management

## 🏗️ Build untuk Production

### 1. Build Application

```bash
# Build untuk production
npm run build
```

Build akan menghasilkan folder `dist/` dengan file-file optimized.

### 2. Preview Production Build

```bash
# Preview build sebelum deploy
npm run preview
```

### 3. Optimasi Build

File `vite.config.ts` sudah dikonfigurasi untuk:
- ✅ Code splitting
- ✅ Asset optimization
- ✅ Tree shaking
- ✅ Minification

## 🌐 Deployment

### Deployment ke Netlify

1. **Build project**:
   ```bash
   npm run build
   ```

2. **Deploy ke Netlify**:
   - Drag & drop folder `dist/` ke Netlify
   - Atau connect dengan Git repository

3. **Environment Variables**:
   - Set `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`

4. **Redirect Rules**:
   Buat file `public/_redirects`:
   ```
   /*    /index.html   200
   ```

### Deployment ke Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Environment Variables**:
   Set di Vercel dashboard atau via CLI

### Update Supabase untuk Production

1. **Authentication Settings**:
   - Update **Site URL** dengan domain production
   - Tambahkan production URL ke **Redirect URLs**

2. **Google OAuth** (jika digunakan):
   - Update **Authorized JavaScript origins**
   - Update **Authorized redirect URIs**

## 🔧 Troubleshooting

### Common Issues

#### 1. Environment Variables Tidak Terbaca

**Problem**: `VITE_SUPABASE_URL is undefined`

**Solution**:
- Pastikan file `.env` ada di root project
- Pastikan variable dimulai dengan `VITE_`
- Restart development server setelah mengubah `.env`

#### 2. Database Connection Error

**Problem**: `Failed to connect to Supabase`

**Solution**:
- Verifikasi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`
- Cek project Supabase masih aktif
- Pastikan tidak ada typo di credentials

#### 3. Authentication Error

**Problem**: `User not authenticated`

**Solution**:
- Cek RLS policies sudah dijalankan
- Verifikasi schema database sudah complete
- Clear browser localStorage dan cookies

#### 4. Google OAuth Error

**Problem**: `redirect_uri_mismatch`

**Solution**:
- Pastikan redirect URI di Google Cloud Console exact match
- Cek tidak ada trailing slash
- Verifikasi protokol (http vs https)

#### 5. Build Error

**Problem**: `Build failed with TypeScript errors`

**Solution**:
```bash
# Fix TypeScript errors
npm run lint

# Force build (tidak direkomendasikan untuk production)
npm run build -- --mode development
```

#### 6. Routing Issues

**Problem**: `404 error on page refresh`

**Solution**:
- Pastikan server dikonfigurasi untuk SPA
- Tambahkan redirect rules untuk hosting platform
- Cek `HashRouter` vs `BrowserRouter` configuration

### Debug Mode

Untuk debugging lebih detail:

```bash
# Enable debug mode
VITE_DEBUG=true npm run dev
```

### Logs dan Monitoring

1. **Browser Console**: Cek error messages
2. **Supabase Dashboard**: Monitor database logs
3. **Network Tab**: Cek API requests/responses

## 🎮 Fitur Platform

### ✅ Authentication System
- **Email/Password**: Register, login, reset password
- **Google OAuth**: Login dengan akun Google
- **Profile Management**: Update profile, change password
- **Session Management**: Auto-refresh tokens

### ✅ Game Management
- **Game Upload**: Upload game files ke Supabase Storage
- **Game Library**: Browse dan search games
- **Categories**: Organize games by category
- **Metadata**: Automatic extraction dari game files

### ✅ Social Features
- **Friend System**: Add, accept, block friends
- **User Search**: Find users by username
- **Profile Viewing**: View other users' profiles
- **Activity Tracking**: Track user activities

### ✅ Routing System
- **Protected Routes**: Authentication guards
- **Dynamic Routing**: Game-specific URLs
- **Browser History**: Back/forward support
- **Bookmarkable URLs**: Direct access ke games

### ✅ Modern UI/UX
- **Responsive Design**: Mobile-first approach
- **Dark/Light Theme**: Theme switching
- **Loading States**: Skeleton screens
- **Error Handling**: User-friendly error messages

### ✅ Performance
- **Code Splitting**: Lazy loading components
- **Asset Optimization**: Image compression
- **Caching**: Browser dan CDN caching
- **Bundle Analysis**: Optimized bundle size

## 📚 Additional Resources

- **[Supabase Setup Guide](./Documentation/SUPABASE_SETUP.md)**: Detail setup database
- **[Google OAuth Setup](./Documentation/GOOGLE_OAUTH_SETUP.md)**: Setup Google authentication
- **[Routing Documentation](./Documentation/ROUTING_DOCUMENTATION.md)**: Routing system guide
- **[Game Requests Feature](./Documentation/GAME_REQUESTS_FEATURE.md)**: Game request system

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

Jika mengalami masalah:

1. Cek [Troubleshooting](#troubleshooting) section
2. Search di GitHub Issues
3. Buat issue baru dengan detail error
4. Contact developer team

---

**Happy Gaming! 🎮**
