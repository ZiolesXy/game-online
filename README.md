# Game Online – React + TypeScript + Supabase (Vite)

Platform sosial gaming dengan fitur autentikasi, manajemen teman, chat real‑time, dan katalog game. Dibangun dengan React + Vite, TypeScript, Tailwind, dan Supabase (Auth, DB, Realtime, Storage).

## Fitur Utama

- Autentikasi pengguna (email/password) via Supabase
- Profil pengguna (`public.users`) dan avatar
- Manajemen teman: kirim/terima/terima-tolak/blokir di `public.friends`
- Chat real‑time: percakapan 1‑to‑1 (`public.conversations`, `public.messages`), status baca
- Katalog game dan storage bucket publik `games` untuk aset

## Arsitektur Kode (ringkas)

- `src/lib/supabase.ts` – inisialisasi klien Supabase + tipe data DB (`User`, `Friend`, `Conversation`, `Message`)
- `src/contexts/AuthContext.tsx` – state global auth & profil, listener perubahan session
- `src/services/` – layanan terpisah:
  - `authService.ts` – `signUp`, `signIn`, `signOut`, `getUserProfile`, `updateProfile`
  - `friendService.ts` – `sendFriendRequest`, `acceptFriendRequest`, `rejectFriendRequest`, `getFriends`, `searchUsers`
  - `chatService.ts` – buat/ambil percakapan, daftar percakapan, kirim/ambil pesan, realtime subscribe
- `src/pages/` – halaman utama: `AuthPage.tsx`, `FriendsPage.tsx`, `ChatPage.tsx`, dsb.
- `src/components/` – komponen UI (chat, friends, game list, layout, dsb.)
- `supabase/` – SQL skema penuh dan skrip bootstrap:
  - `schema.sql` – skema lengkap Users, Friends, Conversations, Messages + RLS & trigger
  - `start.sql` – skrip all‑in‑one idempotent: buat tabel, policies, triggers, `games` + bucket storage `games`
  - `migrations/*.sql` – migrasi terpisah (mis. `add_chat_feature.sql`)

## Prasyarat

- Node.js LTS + npm
- Akun Supabase (https://supabase.com)

## Instalasi & Menjalankan (Dev)

1) Clone & install

```bash
npm install
```

2) Konfigurasi environment

Salin `.env.example` menjadi `.env`, lalu isi kredensial dari Supabase (Settings → API):

```env
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
```

3) Siapkan proyek Supabase

- Buat project baru di dashboard Supabase
- Buka SQL Editor dan jalankan isi file `supabase/start.sql`
  - Ini akan membuat tabel `public.users`, `public.friends`, `public.conversations`, `public.messages`, `public.games`, RLS policies, triggers, dan bucket storage publik `games` + kebijakannya.
  - Alternatif: jalankan bertahap mulai dari `supabase/schema.sql` lalu migrasi di `supabase/migrations/`.

4) Pengaturan Auth

- Authentication → Settings
  - Site URL: `http://localhost:5173`
  - Redirect URLs: tambahkan `http://localhost:5173`

5) Jalankan aplikasi dev

```bash
npm run dev
```

Akses di `http://localhost:5173`.

## Catatan Database

- Tabel profil user tersinkron otomatis via trigger `public.handle_new_user()` ketika ada signup baru di `auth.users`.
- Keamanan menggunakan RLS; semua akses data difilter berdasarkan `auth.uid()`.
- Chat real‑time memakai Supabase Realtime dengan channel `postgres_changes` pada tabel `messages` dan `conversations`.
- Storage bucket `games` bersifat public read; upload/update/delete butuh user terautentikasi.

## Skrip NPM

- `npm run dev` – development server
- `npm run build` – produksi (tsc + vite build)
- `npm run preview` – preview build produksi
- `npm run lint` – linting

## Struktur Direktori (ringkasan)

```
src/
  components/        # UI (chat, friends, game, layout)
  contexts/          # AuthContext
  services/          # authService, friendService, chatService, gameService
  pages/             # AuthPage, FriendsPage, ChatPage, Home, PlayGame
  lib/supabase.ts    # inisialisasi klien & tipe
supabase/
  start.sql          # setup menyeluruh (disarankan)
  schema.sql         # skema inti (users, friends, chat)
  migrations/        # migrasi tambahan
public/              # aset & game HTML
```

## Troubleshooting

- Variabel env tidak terbaca: pastikan file `.env` di root dan key diawali `VITE_`.
- Error RLS/permission: pastikan SQL `start.sql` sudah dieksekusi tanpa error dan user sedang login.
- Chat tidak realtime: cek koneksi Realtime di Supabase > Settings dan pastikan `subscribe` di `ChatService` aktif.

## Produksi

- Set environment var VITE_* di platform hosting (Vercel/Netlify/dll)
- Update Auth Site URL/Redirect URLs ke domain produksi
- Review ulang RLS dan aktifkan backup database

---

Di bawah ini adalah konten template Vite asli (referensi):

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
