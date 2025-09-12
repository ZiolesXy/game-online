export type ChessConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

export function getConfig(): ChessConfig {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Chess] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  }

  return {
    supabaseUrl: supabaseUrl || '',
    supabaseAnonKey: supabaseAnonKey || ''
  };
}
