export interface Game {
  id: string;
  title: string;
  description: string;
  file: string;
  thumbnail: string; // path gambar cuplikan
  author: string; // nama pembuat game
  category: string; // kategori game
}

export const DEFAULT_THUMBNAIL = "/vite.svg";

// Kategori game yang tersedia
export const GAME_CATEGORIES = [
  "Semua",
  "Strategi",
  "Aksi",
  "Horor",
  "Arcade",
  "Puzzle"
] as const;

export type GameCategory = typeof GAME_CATEGORIES[number];

export const games: Game[] = [
  {
    id: "tictactoe",
    title: "Tic Tac Toe",
    description: "Mainkan game klasik Tic Tac Toe melawan teman!",
    file: "/TicTacToe/tictactoe.html",
    thumbnail: DEFAULT_THUMBNAIL,
    author: "Nama Pembuat TicTacToe",
    category: "Strategi",
  },
  {
    id: "FP",
    title: "Flappy Plane",
    description: "Terbangkan pesawat dan hindari rintangan!",
    file: "/FlappyPlane/flappyplane.html",
    thumbnail: "/FlappyPlane/images/gedung.png",
    author: "Arsya Briliant Perdana, Fahri Ramadan Gani, Rafif Dzaki Akmal, Vylan Yoza Sinaga",
    category: "Arcade",
  },
  {
    id: "NH",
    title: "Nightmare House",
    description: "Jelajahi rumah penuh misteri dan tantangan!",
    file: "/NighmareHouse/Nightmare_House.html",
    thumbnail: "/NighmareHouse/Nightmare_House.png",
    author: "Skibidi Team",
    category: "Horor",
  },
  {
    id: "AS",
    title: "Ambasaurus",
    description: "Mainkan Amba Sang dinosaurus untuk berlari menuju gurun",
    file: "/Ambasaurus/index.html",
    thumbnail: "/Ambasaurus/dino.png",
    author: "VoksiDoksi Right Side",
    category: "Aksi",
  },
  // Tambahkan game lain nanti di sini
];