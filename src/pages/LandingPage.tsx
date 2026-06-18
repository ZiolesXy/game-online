import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <main className="min-h-screen text-gray-100 overflow-x-hidden selection:bg-purple-500 selection:text-slate-950">
      <section className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-start px-6 pt-12 pb-24 md:pt-16 md:pb-32">
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(135deg,#0F0F23_0%,#1A1A2E_50%,#16213E_100%)]" />
        <div
          className="absolute inset-0 -z-10 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 0)",
            backgroundSize: "50px 50px",
          }}
        />
        <div className="absolute top-1/4 left-1/2 -z-10 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[120px] md:h-[500px] md:w-[500px]" />

        <div className="glass-card glass-hover w-full rounded-3xl p-8 shadow-md md:p-10">
          <span className="inline-flex items-center rounded-full border border-purple-400/30 bg-purple-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-purple-300 backdrop-blur-sm md:text-sm">
            🎮 Platform Game
          </span>

          <h1 className="mt-6 text-6xl font-black leading-none tracking-tighter sm:text-8xl">
            Fun{" "}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(96,165,250,0.3)]">
              Zone
            </span>
          </h1>

          <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-gray-100 sm:text-5xl">
            Satu platform untuk <span className="text-purple-400">main game</span>
          </h2>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-gray-300 md:text-lg">
            Main game bareng teman + chat real-time langsung dari browser. Tanpa install, langsung gas
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/login"
              className="group relative rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-3.5 font-bold text-gray-100 transition-all duration-300 hover:from-purple-700 hover:to-blue-700 hover:shadow-[0_0_25px_rgba(96,165,250,0.35)]"
            >
              Mulai Sekarang
              <span className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>

        <div className="mt-24 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          <article className="glass-card glass-hover group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1">
            <div className="mb-4 text-2xl">⚡</div>
            <h3 className="text-lg font-bold text-gray-100 transition-colors group-hover:text-purple-400">
              Main Tanpa Install
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-300 md:text-base">
              Klik dan langsung mainkan game favoritmu lewat browser. Ringan, responsif, dan lancar di PC maupun HP.
            </p>
          </article>

          <article className="glass-card glass-hover group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1">
            <div className="mb-4 text-2xl">🕹️</div>
            <h3 className="text-lg font-bold text-gray-100 transition-colors group-hover:text-purple-400">
              Kontrol Mudah
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-300 md:text-base">
              Mainkan game dengan kontrol yang simpel dan responsif. Cukup gunakan keyboard, mouse, atau layar sentuh langsung tanpa pengaturan ribet.
            </p>
          </article>

          <article className="glass-card glass-hover group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 sm:col-span-2 md:col-span-1">
            <div className="mb-4 text-2xl">🎮</div>
            <h3 className="text-lg font-bold text-gray-100 transition-colors group-hover:text-purple-400">
              Banyak Pilihan Game
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-300 md:text-base">
              Mulai dari game petualangan, teka-teki, hingga aksi seru. Selalu ada game baru yang menantang untuk dicoba setiap hari.
            </p>
          </article>
        </div>

        <div className="relative mt-32 glass-card glass-hover rounded-3xl px-6 py-16 text-center">
          <div className="absolute inset-x-0 bottom-0 -z-10 h-[150px] w-full rounded-full bg-purple-500/5 blur-[80px]" />

          <h2 className="mx-auto max-w-xl text-2xl font-extrabold leading-tight tracking-tight text-gray-100 sm:text-4xl">
            Level up cara kamu memainkan game favoritmu.
          </h2>
          <p className="mt-3 text-sm text-gray-300 md:text-base">Gabung sekarang dan rasakan kemudahannya.</p>

          <Link
            to="/login"
            className="mt-8 inline-block rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 px-10 py-3.5 font-bold text-gray-100 transition-all duration-300 hover:from-pink-700 hover:to-purple-700 hover:shadow-[0_0_30px_rgba(168,85,247,0.35)]"
          >
            Mulai Sekarang
              <span className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
