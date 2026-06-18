import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white overflow-x-hidden selection:bg-cyan-500 selection:text-slate-950">
      {/* Hero Section */}
      <section className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-start px-6 pt-12 pb-24 md:pt-16 md:pb-32">
        {/* Dekorasi Background Glow */}
        <div className="absolute top-1/4 left-1/2 -z-10 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[120px] md:h-[500px] md:w-[500px]" />

        <div className="max-w-3xl">
          {/* Badge Platform */}
          <span className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs md:text-sm font-semibold text-cyan-300 backdrop-blur-sm tracking-wide uppercase">
            🎮 Platform Game & Turnamen Online
          </span>

          {/* Logo / Brand */}
          <h1 className="mt-6 text-6xl font-black tracking-tighter sm:text-8xl leading-none">
            Fun <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">Zone</span>
          </h1>

          {/* Main Hook */}
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl leading-tight text-slate-100">
            Satu platform untuk <span className="text-cyan-400">main game</span>,
            <span className="text-cyan-400"> kelola komunitas</span>, dan
            <span className="text-cyan-400"> buat turnamen</span>.
          </h2>

          {/* Deskripsi */}
          <p className="mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-slate-400">
            Fun Zone membantu kamu mengelola pengalaman bermain secara terpusat —
            mulai dari katalog game, statistik pemain, hingga sistem turnamen yang *scalable*.
          </p>

          {/* Call to Action (CTA) */}
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/login"
              className="group relative rounded-xl bg-cyan-400 px-8 py-3.5 font-bold text-slate-950 transition-all duration-300 hover:bg-cyan-300 hover:shadow-[0_0_25px_rgba(34,211,238,0.5)]"
            >
              Mulai Sekarang
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1 ml-2">→</span>
            </Link>
          </div>

          <p className="mt-6 text-xs md:text-sm text-slate-500 font-medium tracking-wide uppercase">
            ✓ Dipercaya oleh komunitas gamer & organizer turnamen
          </p>
        </div>

        {/* Fitur Utama - 3 Kolom */}
        {/* Teks Baru Tanpa Kata Online, Cloud Save, dan Anti-Cheat */}
        <div className="mt-24 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          <article className="group rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/30 hover:bg-white/[0.04] hover:-translate-y-1">
            <div className="mb-4 text-2xl">⚡</div>
            <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">Main Tanpa Install</h3>
            <p className="mt-2 text-sm md:text-base text-slate-400 leading-relaxed">
              Klik dan langsung mainkan game favoritmu lewat browser. Ringan, responsif, dan lancar di PC maupun HP.
            </p>
          </article>

          <article className="group rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/30 hover:bg-white/[0.04] hover:-translate-y-1">
            <div className="mb-4 text-2xl">🕹️</div>
            <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">Kontrol Mudah</h3>
            <p className="mt-2 text-sm md:text-base text-slate-400 leading-relaxed">
              Mainkan game dengan kontrol yang simpel dan responsif. Cukup gunakan keyboard, mouse, atau layar sentuh langsung tanpa pengaturan ribet.
            </p>
          </article>

          <article className="group rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/30 hover:bg-white/[0.04] hover:-translate-y-1 sm:col-span-2 md:col-span-1">
            <div className="mb-4 text-2xl">🎮</div>
            <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">Banyak Pilihan Game</h3>
            <p className="mt-2 text-sm md:text-base text-slate-400 leading-relaxed">
              Mulai dari game petualangan, teka-teki, hingga aksi seru. Selalu ada game baru yang menantang untuk dicoba setiap hari.
            </p>
          </article>
        </div>

        {/* Section Bottom CTA */}
        <div className="relative mt-32 rounded-3xl border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent px-6 py-16 text-center backdrop-blur-sm">
          <div className="absolute inset-x-0 bottom-0 -z-10 h-[150px] w-full bg-purple-500/5 blur-[80px] rounded-full" />

          <h2 className="mx-auto max-w-xl text-2xl font-extrabold sm:text-4xl tracking-tight leading-tight text-slate-100">
            Siap mulai pengalaman gaming yang lebih terorganisir?
          </h2>
          <p className="mt-3 text-slate-400 text-sm md:text-base">Gabung sekarang dan rasakan kemudahannya.</p>

          <Link
            to="/login"
            className="mt-8 inline-block rounded-xl bg-cyan-400 px-10 py-3.5 font-bold text-slate-950 transition-all duration-300 hover:bg-cyan-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]"
          >
            Daftar / Login Sekarang
          </Link>
        </div>

        {/* Footer Ringan */}
        <footer className="mt-24 text-center text-xs text-slate-600 tracking-wide">
          &copy; {new Date().getFullYear()} Fun Zone. All rights reserved.
        </footer>
      </section>
    </main>
  );
}