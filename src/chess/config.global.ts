import { getConfig } from './config';

// Expose config to non-module pages via global window
// This is safe for the Supabase anon key (it's meant to be public).
(function attachChessConfig() {
  const cfg = getConfig();
  (window as any).CHESS_CONFIG = {
    supabaseUrl: cfg.supabaseUrl,
    supabaseAnonKey: cfg.supabaseAnonKey,
  };
})();
