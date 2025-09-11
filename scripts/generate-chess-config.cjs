/*
  Generates public/ChessRevamed/config.js from environment variables at build time.
  Works on Vercel because the build phase has access to env vars.
*/

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

const outDir = path.join(__dirname, '..', 'public', 'ChessRevamed');
const outFile = path.join(outDir, 'config.js');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const content = `// Generated at build time. Do not edit manually.\nwindow.CHESS_CONFIG = {\n  supabaseUrl: ${JSON.stringify(SUPABASE_URL)},\n  supabaseAnonKey: ${JSON.stringify(SUPABASE_ANON_KEY)}\n};\n`;

fs.writeFileSync(outFile, content, 'utf8');
console.log('[generate-chess-config] Wrote', outFile);
