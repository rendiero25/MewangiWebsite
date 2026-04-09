import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import ScrollSmoother from 'gsap/ScrollSmoother';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export default function About() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [missionImage, setMissionImage] = useState<string>('');
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_URL}/settings`);
        if (res.data.aboutMissionImage) {
          setMissionImage(res.data.aboutMissionImage.startsWith('http') 
            ? res.data.aboutMissionImage 
            : `${API_URL.replace('/api', '')}${res.data.aboutMissionImage}`);
        }
      } catch (err) {
        console.error('Gagal memuat pengaturanAbout:', err);
      }
    };
    fetchSettings();
  }, [API_URL]);

  const features = [
// ... (rest of features stays the same)
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      ),
      title: "Forum Diskusi Aktif",
      desc: "Diskusikan parfum favoritmu, minta rekomendasi personal, dan berbagi tips dengan komunitas yang passionate. Lebih dari 5000 topik diskusi aktif setiap bulan.",
      color: "from-primary to-emerald-400",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      title: "Review Jujur",
      desc: "Baca dan tulis review terstruktur dengan rating longevity, sillage, value for money, dan notes. Bantu komunitas membuat keputusan pembelian yang tepat.",
      color: "from-amber-400 to-orange-500",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      title: "Blog & Artikel",
      desc: "Baca artikel edukatif tentang dunia parfum atau tulis artikelmu sendiri. Dari fragrance notes hingga tips merawat parfum dari master penulismu.",
      color: "from-blue-500 to-indigo-500",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Leaderboard & Points",
      desc: "Raih poin dari setiap kontribusi. Naikkan level dan bersaing di leaderboard otomatis dengan reward eksklusif.",
      color: "from-purple-500 to-pink-500",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Daftar Gratis",
      desc: "Buat akun dengan email atau Google. Sangat cepat.",
      icon: "👤",
      details: "Proses hanya membutuhkan 2 menit. Gratis selamanya.",
    },
    {
      step: "02",
      title: "Lengkapi Profil",
      desc: "Isi preferensi parfum Anda dan koleksi anda.",
      icon: "✨",
      details: "Tunjukkan kepribadian unikmu kepada komunitas.",
    },
    {
      step: "03",
      title: "Jelajahi & Diskusi",
      desc: "Buka forum, baca review, atau cari parfum incaran.",
      icon: "🔍",
      details: "Temukan fragrance impianmu atau minta rekomendasi.",
    },
    {
      step: "04",
      title: "Kontribusi",
      desc: "Tulis review, buat topik diskusi, atau bagikan artikel.",
      icon: "⭐",
      details: "Dapatkan poin dan naikkan level rank Anda.",
    },
  ];
  return (
    <div className="bg-white">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(2.2); opacity: 1; }
          100% { transform: scale(2); opacity: 1; }
        }
        @keyframes fadeInUp {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .perspective { perspective: 1000px; }
        .rotate-x-2 { transform: rotateX(5deg); }
      `}</style>
      {/* Hero Section */}
      <section className="relative pt-10 pb-20 overflow-hidden bg-gradient-to-b from-white to-third">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-6 animate-fade-in">
            Tentang Mewangi
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
            Membangun Komunitas <br />
            <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
              Pencinta Parfum Indonesia
            </span>
          </h1>
          <p className="text-lg text-black max-w-2xl mx-auto leading-relaxed">
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
              <div className="aspect-square rounded-xl overflow-hidden shadow-2xl rotate-3 scale-75 border-8 border-white">
                <img 
                  src={missionImage} 
                  alt="Misi Mewangi" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Misi Kami</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
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
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
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
            <div className="p-8 rounded-xl bg-third/25 hover:shadow-md transition-shadow">
              <div className="text-4xl font-bold text-primary mb-2">Terbuka</div>
              <p className="text-gray-600 uppercase tracking-widest text-sm font-semibold">Semua Genre Parfum</p>
            </div>
            <div className="p-8 rounded-xl bg-third/25 hover:shadow-md transition-shadow">
              <div className="text-4xl font-bold text-secondary mb-2">Lokal</div>
              <p className="text-gray-600 uppercase tracking-widest text-sm font-semibold">Dukung Brand Indonesia</p>
            </div>
            <div className="p-8 rounded-xl bg-third/25 hover:shadow-md transition-shadow">
              <div className="text-4xl font-bold text-emerald-500 mb-2">Aktif</div>
              <p className="text-gray-600 uppercase tracking-widest text-sm font-semibold">Diskusi Setiap Hari</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Kenapa Mewangi Section */}
      <section className="py-20 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Kenapa <span className="text-primary text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary">Mewangi?</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Platform komunitas terlengkap bagi pecinta wewangian di Indonesia.</p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            {/* Interactive List */}
            <div className="w-full lg:w-1/2 flex flex-col gap-4 relative z-10 transition-all duration-300">
              {features.map((feature, idx) => (
                <div 
                  key={idx} 
                  onMouseEnter={() => setActiveFeature(idx)}
                  className={`p-6 rounded-2xl cursor-pointer transition-all duration-500 border-2 ${activeFeature === idx ? 'bg-white border-primary shadow-2xl scale-[1.02]' : 'bg-transparent border-transparent hover:bg-white/80'}`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white bg-gradient-to-br transition-all duration-500 ${activeFeature === idx ? feature.color + ' shadow-lg' : 'from-gray-300 to-gray-400'}`}>
                      {feature.icon}
                    </div>
                    <h3 className={`text-xl font-bold transition-colors duration-500 ${activeFeature === idx ? 'text-gray-900' : 'text-gray-500'}`}>{feature.title}</h3>
                  </div>
                  <div className={`grid transition-all duration-500 ease-in-out overflow-hidden ${activeFeature === idx ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}>
                    <p className="text-gray-600 overflow-hidden leading-relaxed text-[15px] pl-[76px]">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Visual Display Interactive Viewer */}
            <div className="w-full lg:w-1/2 hidden lg:flex justify-center items-center h-[550px] bg-white rounded-xl overflow-hidden border border-gray-100 shadow-xl relative group">
               {/* Animated background shape */}
               <div className={`absolute -inset-20 bg-gradient-to-tr opacity-20 blur-3xl rounded-full transition-colors duration-1000 ${features[activeFeature].color}`}></div>
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
               
               <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-12 text-center">
                   <div 
                    key={`icon-${activeFeature}`} 
                    className={`w-36 h-36 rounded-3xl bg-gradient-to-br ${features[activeFeature].color} flex items-center justify-center text-white mb-10 shadow-2xl animate-[float_4s_ease-in-out_infinite]`}
                    style={{ animation: 'float 4s ease-in-out infinite' }}
                  >
                     <div className="scale-[2] animate-[popIn_0.5s_ease-out]">
                        {features[activeFeature].icon}
                     </div>
                  </div>
                  <h3 key={`title-${activeFeature}`} className="text-3xl font-extrabold text-gray-900 mb-6 animate-[fadeInUp_0.5s_ease-out_0.1s_both]">{features[activeFeature].title}</h3>
                  <p key={`desc-${activeFeature}`} className="text-gray-600 text-lg leading-relaxed animate-[fadeInUp_0.5s_ease-out_0.2s_both]">{features[activeFeature].desc}</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Perjalanan Sempurna Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-[0.02]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-5">
              Perjalanan <span className="relative text-primary">Sempurna<div className="absolute -bottom-2 left-0 w-full h-1 bg-secondary/50 transform -skew-x-12"></div></span> Kamu
            </h2>
            <p className="text-lg text-black">Jajaki dunia wewangian dengan 4 langkah mulus.</p>
          </div>
          
          <div className="relative group/timeline max-w-5xl mx-auto">
            {/* Magic connecting line */}
            <div className="absolute top-1/2 left-0 w-full h-1.5 bg-gray-100 -translate-y-1/2 rounded-full overflow-hidden hidden md:block">
              <div className="h-full bg-linear-to-r from-primary via-secondary to-primary w-[0%] group-hover/timeline:w-[100%] transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 relative z-10">
              {steps.map((step, idx) => (
                <div key={idx} className="relative group perspective" style={{ perspective: '1000px' }}>
                  <div className="w-24 h-10 mx-auto bg-white rounded-full flex items-center justify-center text-4xl transition-all duration-500 transform group-hover:-translate-y-6 group-hover:scale-110 group-hover:shadow-primary/30 mb-8 relative z-20">
                    <span className="transition-transform duration-500 group-hover:rotate-12">{step.icon}</span>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-xl p-6 text-center transition-all duration-500 shadow-sm group-hover:shadow-lg transform group-hover:-translate-y-4 group-hover:rotate-x-2 relative overflow-hidden h-full flex flex-col items-center">
                    <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-primary to-secondary scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-700 ease-out"></div>
                    
                    <div className="transition-all duration-500 group-hover:-translate-y-5">
                      <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest rounded-full mb-2">{step.step}</span>
                      <h3 className="text-base font-black text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-sm text-gray-600 px-2">{step.desc}</p>
                    </div>

                    <div className="absolute bottom-0 inset-x-0 p-4 bg-gray-50 border-t border-gray-100 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                       <p className="text-xs text-primary font-bold">{step.details}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="pt-20 bg-white">
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
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-linear-to-r from-primary to-secondary rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            Mulai Perjalananmu
          </Link>
        </div>
      </section>
    </div>
  );
}
