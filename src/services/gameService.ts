import { supabase } from "../lib/supabase";
import type { Game } from "../data/game";

const GAMES_BUCKET = "games";

const getPublicUrl = (path: string): string => {
  const { data } = supabase.storage.from(GAMES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
};

export interface DbGameRow {
  id: string;
  slug: string;
  title: string;
  description?: string;
  author?: string;
  category: "Strategi" | "Aksi" | "Horor" | "Arcade" | "Puzzle";
  storage_prefix: string; // e.g., games/nightmare-house
  entry_file: string; // e.g., index.html
  cover_path?: string; // e.g., games/nightmare-house/cover.jpg
}

const normalizePath = (p?: string): string | undefined => {
  if (!p) return undefined;
  let path = p.trim().replace(/^\/+|\/+$/g, "");
  // If developer stored with leading 'games/', strip it because bucket already set
  if (path.toLowerCase().startsWith("games/")) {
    path = path.slice(6);
  }
  return path;
};

const mapRowToGame = (row: DbGameRow): Game => {
  const storagePrefix = normalizePath(row.storage_prefix) || "";
  const filePath = `${storagePrefix}/${row.entry_file}`.replace(/\/+/, "/");
  const coverPath = normalizePath(row.cover_path);
  return {
    id: row.slug,
    title: row.title,
    description: row.description || "",
    file: getPublicUrl(filePath),
    thumbnail: coverPath ? getPublicUrl(coverPath) : "/vite.svg",
    author: row.author || "",
    category: row.category,
  };
};

export const gameService = {
  async listGames(): Promise<Game[]> {
    const { data, error } = await supabase
      .from("games")
      .select(
        "id, slug, title, description, author, category, storage_prefix, entry_file, cover_path"
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as DbGameRow[]).map(mapRowToGame);
  },

  async getGameBySlug(slug: string): Promise<Game | null> {
    const { data, error } = await supabase
      .from("games")
      .select(
        "id, slug, title, description, author, category, storage_prefix, entry_file, cover_path"
      )
      .eq("slug", slug)
      .single();

    if (error) return null;
    return mapRowToGame(data as DbGameRow);
  },
};
