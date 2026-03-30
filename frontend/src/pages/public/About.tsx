import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-primary/5 via-white to-secondary/5">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-6 animate-fade-in">
            Tentang Mewangi
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Membangun Komunitas <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Pencinta Parfum Indonesia
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Mewangi hadir sebagai wadah bagi para enthusiast parfum di Indonesia untuk saling berbagi, 
            berdiskusi, dan mengeksplorasi dunia wewangian yang tak terbatas.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-square rounded-xl overflow-hidden shadow-2xl rotate-3 scale-95 border-8 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                  alt="Parfum" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 aspect-square w-48 rounded-xl overflow-hidden shadow-xl -rotate-6 border-4 border-white hidden sm:block">
                <img 
                  src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                  alt="Parfum" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Misi Kami</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Edukasi & Literasi</h3>
                    <p className="text-gray-600">Memberikan informasi yang akurat dan bermanfaat mengenai segala aspek parfum, dari notes hingga teknik pembuatan.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Komunitas Inklusif</h3>
                    <p className="text-gray-600">Menciptakan lingkungan yang ramah bagi siapa saja, dari pemula hingga kolektor berpengalaman.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Review Terpercaya</h3>
                    <p className="text-gray-600">Menyediakan platform ulasan yang jujur dan objektif untuk membantu member mengambil keputusan pembelian yang tepat.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats/Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-8 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl font-bold text-primary mb-2">Terbuka</div>
              <p className="text-gray-600 uppercase tracking-widest text-sm font-semibold">Semua Genre Parfum</p>
            </div>
            <div className="p-8 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl font-bold text-secondary mb-2">Lokal</div>
              <p className="text-gray-600 uppercase tracking-widest text-sm font-semibold">Dukung Brand Indonesia</p>
            </div>
            <div className="p-8 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl font-bold text-emerald-500 mb-2">Aktif</div>
              <p className="text-gray-600 uppercase tracking-widest text-sm font-semibold">Diskusi Setiap Hari</p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-lg leading-relaxed text-gray-600">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Cerita Kami</h2>
          <p className="mb-6">
            Mewangi didirikan pada tahun 2024 oleh sekelompok pencinta parfum yang merasa sulit menemukan 
            referensi parfum yang relevan dengan konteks Indonesia (iklim tropis, preferensi lokal, dll).
          </p>
          <p className="mb-10">
            Kini, Mewangi telah berkembang menjadi tujuan utama bagi siapa pun yang ingin memulai 
            perjalanan wangi mereka. Kami percaya bahwa setiap orang memiliki "signature scent" 
            sendiri, dan kami di sini untuk membantu Anda menemukannya.
          </p>
          <Link 
            to="/register" 
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-primary to-secondary rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            Mulai Perjalananmu
          </Link>
        </div>
      </section>
    </div>
  );
}
