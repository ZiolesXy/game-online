# Setup Google OAuth untuk Game Online

## 1. Konfigurasi Google Cloud Console

### Langkah 1: Buat Project di Google Cloud Console
1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project yang sudah ada
3. Aktifkan Google+ API dan Google Identity API

### Langkah 2: Konfigurasi OAuth Consent Screen
1. Pergi ke **APIs & Services** > **OAuth consent screen**
2. Pilih **External** untuk user type
3. Isi informasi aplikasi:
   - App name: `Game Online Platform`
   - User support email: email Anda
   - Developer contact information: email Anda
4. Tambahkan scope yang diperlukan:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`

### Langkah 3: Buat OAuth 2.0 Client ID
1. Pergi ke **APIs & Services** > **Credentials**
2. Klik **Create Credentials** > **OAuth 2.0 Client ID**
3. Pilih **Web application**
4. Isi konfigurasi:
   - Name: `Game Online Web Client`
   - Authorized JavaScript origins:
     - `http://localhost:5173` (untuk development)
     - `https://yourdomain.com` (untuk production)
   - Authorized redirect URIs:
     - `http://localhost:5173/auth/callback` (untuk development)
     - `https://yourdomain.com/auth/callback` (untuk production)

## 2. Konfigurasi Supabase

### Langkah 1: Aktifkan Google Provider
1. Buka Supabase Dashboard
2. Pergi ke **Authentication** > **Providers**
3. Aktifkan **Google**
4. Masukkan:
   - Client ID: dari Google Cloud Console
   - Client Secret: dari Google Cloud Console

### Langkah 2: Konfigurasi Redirect URLs
1. Di Supabase Dashboard, pergi ke **Authentication** > **URL Configuration**
2. Tambahkan redirect URLs:
   - `http://localhost:5173/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)

### Langkah 3: Jalankan Database Migration
```bash
# Jalankan migration untuk Google OAuth support
supabase db push
```

## 3. Environment Variables

Pastikan file `.env.local` Anda memiliki konfigurasi Supabase yang benar:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 4. Testing

### Development Testing
1. Jalankan aplikasi: `npm run dev`
2. Buka `http://localhost:5173`
3. Klik "Masuk dengan Google"
4. Verifikasi proses OAuth berjalan dengan baik
5. Cek apakah profile completion muncul untuk user Google baru

### Production Testing
1. Deploy aplikasi ke hosting pilihan Anda
2. Update redirect URLs di Google Cloud Console dan Supabase
3. Test complete flow dari login hingga profile completion

## 5. Troubleshooting

### Error: "redirect_uri_mismatch"
- Pastikan redirect URI di Google Cloud Console sama persis dengan yang digunakan aplikasi
- Cek tidak ada trailing slash atau perbedaan protokol (http vs https)

### Error: "Invalid client"
- Verifikasi Client ID dan Client Secret di Supabase
- Pastikan Google+ API sudah diaktifkan

### User tidak redirect setelah Google login
- Cek konfigurasi redirect URLs di Supabase
- Pastikan AuthCallback component berfungsi dengan baik

### Profile completion tidak muncul
- Cek database trigger `handle_google_oauth_user` sudah berjalan
- Verifikasi kolom `profile_completed` di tabel users

## 6. Fitur yang Tersedia

### ✅ Google OAuth Login
- Login dengan akun Google
- Otomatis membuat user profile
- Redirect ke halaman profile completion jika diperlukan

### ✅ Profile Completion
- Form untuk melengkapi username dan nama lengkap
- Validasi username (minimal 3 karakter, hanya huruf, angka, underscore)
- Update database setelah completion

### ✅ Email/Password Login
- Tetap mendukung login tradisional
- Pilihan antara Google dan email di halaman auth

### ✅ Routing & Navigation
- Protected routes untuk user yang belum login
- Automatic redirect ke profile completion
- OAuth callback handling

## 7. Database Schema

Migration telah menambahkan kolom baru ke tabel `users`:
- `provider`: 'email' atau 'google'
- `provider_id`: ID dari provider (Google sub)
- `avatar_url`: URL avatar dari Google
- `profile_completed`: boolean untuk tracking completion status

## 8. Security Notes

- Client Secret harus disimpan aman di Supabase, tidak di frontend
- Redirect URLs harus exact match untuk keamanan
- Gunakan HTTPS di production
- Validasi user input di profile completion form
