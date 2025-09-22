# Routing Documentation

## Struktur Routing Project Game Online

Project ini menggunakan React Router DOM v7 dengan HashRouter untuk navigasi yang terorganisir dan modular.

### Struktur File Router

```
src/
├── router/
│   ├── index.ts              # Export utama
│   ├── AppRouter.tsx         # Router utama
│   ├── AuthRoutes.tsx        # Routes untuk autentikasi
│   └── GameRoutes.tsx        # Routes untuk game dan dashboard
├── hooks/
│   └── useNavigation.ts      # Custom hook untuk navigasi
├── components/
│   ├── GameLayout.tsx        # Layout untuk game pages
│   └── LoadingScreen.tsx     # Loading screen component
└── pages/
    ├── Home.tsx              # Halaman utama
    ├── GamePage.tsx          # Halaman game individual
    └── AdminPage.tsx         # Halaman admin
```

### Route Structure

#### 1. Public Routes (Auth)
- `/auth` - Halaman login/register utama
- `/auth/login` - Form login
- `/auth/register` - Form registrasi
- `/auth/callback` - OAuth callback
- `/auth/reset-password` - Reset password
- `/auth/complete-profile` - Lengkapi profil Google

#### 2. Protected Routes (Game)
- `/` - Home page dengan daftar game
- `/game/:gameId` - Play game dengan ID tertentu
- `/dashboard` - Profile & friends dashboard
- `/admin/*` - Admin routes (nested)
  - `/admin/requests` - Kelola permintaan game
  - `/admin/users` - Kelola pengguna

### Fitur Routing

#### Route Guards
- **AuthRoutes**: Redirect ke home jika sudah login
- **GameRoutes**: Redirect ke auth jika belum login
- **Protected Routes**: Semua game routes memerlukan autentikasi

#### Navigation Components
- **GameLayout**: Layout wrapper dengan floating navigation
- **LoadingScreen**: Loading state untuk auth context
- **useNavigation**: Custom hook untuk navigasi programmatic

#### URL Parameters
- `gameId` - ID game untuk route `/game/:gameId`
- Query parameters untuk Google OAuth flow

### Penggunaan

#### Navigasi Programmatic
```tsx
import { useNavigation } from '../hooks/useNavigation';

function MyComponent() {
  const { navigateToGame, navigateToDashboard } = useNavigation();
  
  const handlePlayGame = (gameId: string) => {
    navigateToGame(gameId);
  };
}
```

#### Link Navigation
```tsx
import { Link } from 'react-router-dom';

<Link to="/dashboard">Go to Dashboard</Link>
<Link to="/game/chess">Play Chess</Link>
```

### Implementasi HashRouter

Project menggunakan HashRouter untuk kompatibilitas dengan hosting statis:

```tsx
// main.tsx
<HashRouter>
  <App />
</HashRouter>
```

URLs akan berbentuk: `#/dashboard`, `#/game/chess`, dll.

### Error Handling

- **404 Routes**: Redirect ke home untuk routes yang tidak ditemukan
- **Invalid Game ID**: Redirect ke home jika game tidak ada
- **Auth State**: Automatic redirect berdasarkan status autentikasi

### Optimasi

- **Code Splitting**: Routes dapat di-lazy load jika diperlukan
- **Nested Routes**: Admin routes menggunakan nested routing
- **Layout Reuse**: GameLayout digunakan untuk konsistensi UI

### Migration dari Routing Lama

Routing baru menggantikan sistem state-based dengan:
- URL-based navigation
- Browser history support
- Bookmarkable URLs
- Better SEO (jika diperlukan)
- Cleaner component separation
