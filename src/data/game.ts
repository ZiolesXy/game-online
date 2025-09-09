export interface Game {
  id: string;
  title: string;
  description: string;
  file: string;
  thumbnail: string; // path gambar cuplikan
  author: string; // nama pembuat game
  authorUrl?: string; // tautan ke pembuat game (opsional)
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
  // {
  //   id: "FP",
  //   title: "Flappy Plane",
  //   description: "Terbangkan pesawat dan hindari rintangan!",
  //   file: "/FlappyPlane/flappyplane.html",
  //   thumbnail: "/FlappyPlane/images/gedung.png",
  //   author: "Arsya Briliant Perdana, Fahri Ramadan Gani, Rafif Dzaki Akmal, Vylan Yoza Sinaga",
  //   category: "Arcade",
  // },
  // {
  //   id: "AS",
  //   title: "Ambasaurus",
  //   description: "Mainkan Amba Sang dinosaurus untuk berlari menuju gurun",
  //   file: "/Ambasaurus/index.html",
  //   thumbnail: "/Ambasaurus/dino.png",
  //   author: "VoksiDoksi Right Side",
  //   category: "Aksi",
  // },
  {
    id: "CH",
    title: "Catur",
    description: "Mainkan Catur melawan teman!",
    file: "/Chess/index.html",
    thumbnail: "/Chess/background.jpg",
    author: "Pasha Prabasakti",
    category: "Strategi",
  },
  {
    id: "BW",
    title: "Brawl",
    description: "A fast paced 2-player brawler game where you just have to hit your opponent once in 50+ stages! There are weapons over the map for you to hit your opponent and beware the rising water!",
    file: "/Brawl/brawl.html",
    thumbnail: "/Brawl/brawl.p8.png",
    author: "CodeManu",
    authorUrl: "https://codemanu.itch.io/",
    category: "Arcade",
  },
  {
    id: "PA",
    title: "PIGEON ASCENT",
    description: "Inspired by games such as La Brute, Tamagochi and a little bit of Pokémon, Pigeon Ascent is our game for Ludum Dare #46. I admit that we strayed a bit from the theme, but since we had tons of fun developing this game, we're quite happy with the result :) Observation: This game was made for the Ludum Dare #46. If you want, you can play the first uploaded version here! Gameplay and controls: The mouse is used for everything. The pigeons fight by themselves, but you can choose the attribute points and which enemies your pigeon will fight.",
    file: "/PiegonAscent/index.html",
    thumbnail: "/PiegonAscent/index.icon.png",
    author: "escada-games",
    authorUrl: "https://escada-games.itch.io/",
    category: "Strategi",
  },
];