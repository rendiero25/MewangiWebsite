import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    // Simulasi pengiriman — ganti dengan endpoint API nyata jika tersedia
    try {
      await new Promise((res) => setTimeout(res, 1500));
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <Helmet>
        <title>Hubungi Kami – Mewangi</title>
        <meta
          name="description"
          content="Punya pertanyaan, saran, atau laporan? Hubungi tim Mewangi, komunitas parfum Indonesia, melalui formulir kontak atau email langsung."
        />
      </Helmet>

      <div className="bg-white">
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(24px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .anim-fade { animation: fadeInUp .55s ease both; }
          .anim-fade-d1 { animation: fadeInUp .55s .1s ease both; }
          .anim-fade-d2 { animation: fadeInUp .55s .2s ease both; }
          .anim-fade-d3 { animation: fadeInUp .55s .3s ease both; }
        `}</style>

        {/* ── Hero ── */}
        <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-white to-emerald-50">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.04]" />
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-sm font-semibold text-primary mb-6 anim-fade">
              📬 Kontak Kami
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-5 leading-tight tracking-tight anim-fade-d1">
              Ada yang Ingin{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Kamu Sampaikan?
              </span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed anim-fade-d2">
              Kami dengan senang hati merespons pertanyaan, saran, laporan konten, atau koaborasi. Tim Mewangi biasanya membalas dalam 1–2 hari kerja.
            </p>
          </div>
        </section>

        {/* ── Content ── */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-5 gap-14">

            {/* Info cards */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {[
                {
                  emoji: '📧',
                  title: 'Email Langsung',
                  desc: 'Kirim email ke kami kapan saja.',
                  sub: 'kontak@mewangi.id',
                  href: 'mailto:kontak@mewangi.id',
                },
                {
                  emoji: '💬',
                  title: 'Forum Komunitas',
                  desc: 'Diskusikan langsung di forum Mewangi.',
                  sub: 'Buka Forum',
                  href: '/forum',
                },
                {
                  emoji: '⏱️',
                  title: 'Waktu Respons',
                  desc: 'Kami merespons dalam:',
                  sub: '1–2 hari kerja',
                  href: null,
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="flex gap-5 p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white"
                >
                  <div className="text-3xl shrink-0 w-14 h-14 bg-primary/8 rounded-xl flex items-center justify-center">
                    {card.emoji}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{card.title}</h3>
                    <p className="text-sm text-gray-500 mb-1">{card.desc}</p>
                    {card.href ? (
                      <a
                        href={card.href}
                        className="text-sm font-semibold text-primary hover:underline"
                      >
                        {card.sub}
                      </a>
                    ) : (
                      <span className="text-sm font-semibold text-primary">{card.sub}</span>
                    )}
                  </div>
                </div>
              ))}

              {/* Note */}
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100">
                <p className="text-sm text-amber-800 leading-relaxed">
                  <strong>Catatan:</strong> Untuk laporan pengguna atau konten yang melanggar aturan, gunakan fitur <em>Laporkan</em> di dalam postingan terkait agar dapat diproses lebih cepat.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-lg p-8 sm:p-10">
              {status === 'success' ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16 gap-4">
                  <div className="text-6xl">✅</div>
                  <h2 className="text-2xl font-bold text-gray-900">Pesan Terkirim!</h2>
                  <p className="text-gray-500 max-w-xs">
                    Terima kasih telah menghubungi kami. Kami akan segera membalas pesanmu.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition"
                  >
                    Kirim Pesan Lain
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Kirim Pesan</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Nama kamu"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm transition"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@kamu.com"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Topik <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="contact-subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm transition bg-white"
                    >
                      <option value="">-- Pilih topik --</option>
                      <option value="Pertanyaan Umum">Pertanyaan Umum</option>
                      <option value="Saran & Masukan">Saran &amp; Masukan</option>
                      <option value="Laporan Bug">Laporan Bug</option>
                      <option value="Kerjasama / Iklan">Kerjasama / Iklan</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Pesan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tulis pesanmu di sini..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm transition resize-none"
                    />
                  </div>

                  {status === 'error' && (
                    <p className="text-sm text-red-500">
                      Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.
                    </p>
                  )}

                  <button
                    id="contact-submit-btn"
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-sm hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {status === 'loading' ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Mengirim...
                      </>
                    ) : (
                      'Kirim Pesan →'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
