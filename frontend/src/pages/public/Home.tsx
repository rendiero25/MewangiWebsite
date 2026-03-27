import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-white to-secondary/5">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-36">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-6">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Komunitas Parfum Indonesia #1
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black leading-tight mb-6">
              Temukan Dunia{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Parfum
              </span>{" "}
              Favoritmu
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Gabung bersama ribuan pecinta parfum Indonesia. Diskusikan,
              review, dan bagikan pengalaman parfum terbaikmu di Mewangi.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-primary to-secondary rounded-2xl hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-300"
              >
                Gabung Sekarang
              </Link>
              <Link
                to="/forum"
                className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-2xl hover:border-primary/30 hover:text-primary transition-all duration-300"
              >
                Jelajahi Forum
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 sm:gap-16 mt-16">
              {[
                { value: "1K+", label: "Member" },
                { value: "500+", label: "Parfum" },
                { value: "2K+", label: "Review" },
                { value: "5K+", label: "Diskusi" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
              Kenapa <span className="text-primary">Mewangi</span>?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Platform lengkap untuk para pencinta parfum di Indonesia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                    />
                  </svg>
                ),
                title: "Forum Diskusi",
                desc: "Diskusikan parfum favoritmu, minta rekomendasi, dan berbagi tips dengan komunitas yang ramah.",
                color: "from-primary to-emerald-400",
              },
              {
                icon: (
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                ),
                title: "Review Parfum",
                desc: "Baca dan tulis review mendalam: longevity, sillage, value for money. Bantu pecinta parfum lainnya memilih.",
                color: "from-amber-400 to-orange-500",
              },
              {
                icon: (
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                  </svg>
                ),
                title: "Blog & Artikel",
                desc: "Baca artikel edukatif tentang dunia parfum atau tulis artikelmu sendiri untuk dibagikan.",
                color: "from-blue-500 to-indigo-500",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group p-8 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform duration-300`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-black mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
              Cara Bergabung
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Tiga langkah mudah untuk memulai perjalanan parfummu di Mewangi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Daftar Akun",
                desc: "Buat akun gratis dengan email aktifmu. Verifikasi email dan mulai.",
              },
              {
                step: "02",
                title: "Jelajahi & Diskusi",
                desc: "Buka forum, baca review, atau cari parfum yang kamu minati.",
              },
              {
                step: "03",
                title: "Berkontribusi",
                desc: "Tulis review, buat topik diskusi, atau bagikan artikelmu.",
              },
            ].map((step) => (
              <div key={step.step} className="relative text-center p-8">
                <div className="text-7xl font-black text-primary/10 mb-2">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-black mb-3 -mt-4">
                  {step.title}
                </h3>
                <p className="text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary p-10 sm:p-16 text-center">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.06%22%3E%3Cpath%20d=%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Siap Bergabung?
              </h2>
              <p className="text-white/80 max-w-lg mx-auto mb-8 text-lg">
                Bergabung dengan komunitas parfum terbesar di Indonesia. Gratis
                selamanya.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-primary bg-white rounded-2xl hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                Daftar Sekarang
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
