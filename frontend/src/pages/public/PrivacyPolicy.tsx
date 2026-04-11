import { Helmet } from 'react-helmet-async';

const LAST_UPDATED = '10 April 2026';
const SITE_NAME = 'Mewangi';
const SITE_URL = 'https://mewangi.id';
const CONTACT_EMAIL = 'kontak@mewangi.id';

export default function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Kebijakan Privasi – Mewangi</title>
        <meta
          name="description"
          content="Kebijakan Privasi Mewangi menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi pengguna sesuai peraturan yang berlaku."
        />
      </Helmet>

      <div className="bg-white">
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .pp-fade { animation: fadeInUp .5s ease both; }
        `}</style>

        {/* ── Hero ── */}
        <section className="relative pt-12 pb-16 overflow-hidden bg-gradient-to-b from-white to-indigo-50">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.04]" />
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center pp-fade">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100 rounded-full text-sm font-semibold text-indigo-700 mb-6">
              🔒 Privasi &amp; Keamanan
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-5 leading-tight tracking-tight">
              Kebijakan{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Privasi
              </span>
            </h1>
            <p className="text-gray-500 text-sm">
              Terakhir diperbarui: <strong>{LAST_UPDATED}</strong>
            </p>
          </div>
        </section>

        {/* ── Body ── */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* TOC */}
            <nav
              aria-label="Daftar Isi"
              className="mb-12 p-6 rounded-2xl bg-gray-50 border border-gray-100"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Daftar Isi</p>
              <ol className="space-y-2 text-sm text-primary font-medium list-decimal list-inside">
                {[
                  'Informasi yang Kami Kumpulkan',
                  'Cara Kami Menggunakan Informasi',
                  'Berbagi Data dengan Pihak Ketiga',
                  'Cookie dan Teknologi Pelacakan',
                  'Google AdSense dan Iklan',
                  'Hak-Hak Pengguna',
                  'Keamanan Data',
                  'Tautan ke Situs Pihak Ketiga',
                  'Perubahan Kebijakan Privasi',
                  'Hubungi Kami',
                ].map((item, i) => (
                  <li key={i}>
                    <a href={`#pp-${i + 1}`} className="hover:underline">
                      {item}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            {/* Prose */}
            <div className="prose prose-gray prose-lg max-w-none space-y-12">

              {/* 1 */}
              <section id="pp-1">
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  1. Informasi yang Kami Kumpulkan
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Ketika Anda menggunakan {SITE_NAME} (<a href={SITE_URL} className="text-primary hover:underline">{SITE_URL}</a>), kami dapat mengumpulkan beberapa jenis informasi:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 text-[15px]">
                  <li>
                    <strong>Informasi Akun:</strong> Nama, alamat email, nama pengguna, dan kata sandi (dienkripsi) saat Anda mendaftar.
                  </li>
                  <li>
                    <strong>Konten Pengguna:</strong> Topik forum, review, artikel, komentar, dan pesan yang Anda buat.
                  </li>
                  <li>
                    <strong>Data Penggunaan:</strong> Halaman yang dikunjungi, durasi kunjungan, tautan yang diklik, dan preferensi penggunaan.
                  </li>
                  <li>
                    <strong>Informasi Teknis:</strong> Alamat IP, tipe browser, sistem operasi, dan resolusi layar.
                  </li>
                  <li>
                    <strong>Foto Profil:</strong> Gambar yang Anda unggah secara sukarela di profil.
                  </li>
                </ul>
              </section>

              {/* 2 */}
              <section id="pp-2">
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  2. Cara Kami Menggunakan Informasi
                </h2>
                <p className="text-gray-600 leading-relaxed mb-3">Data yang kami kumpulkan digunakan untuk:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 text-[15px]">
                  <li>Menyediakan, mengoperasikan, dan meningkatkan layanan {SITE_NAME}.</li>
                  <li>Mengelola akun dan autentikasi pengguna.</li>
                  <li>Mengirimkan notifikasi, respons forum, atau pembaruan penting.</li>
                  <li>Menganalisis tren penggunaan untuk meningkatkan pengalaman komunitas.</li>
                  <li>Mencegah penyalahgunaan, spam, dan konten yang melanggar kebijakan.</li>
                  <li>Mematuhi kewajiban hukum yang berlaku di Indonesia.</li>
                </ul>
              </section>

              {/* 3 */}
              <section id="pp-3">
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  3. Berbagi Data dengan Pihak Ketiga
                </h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  Kami <strong>tidak menjual atau menyewakan</strong> data pribadi Anda kepada pihak ketiga. Namun kami dapat berbagi informasi dengan:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 text-[15px]">
                  <li>
                    <strong>Penyedia Layanan Infrastruktur:</strong> Seperti server hosting dan layanan penyimpanan cloud untuk menjalankan platform.
                  </li>
                  <li>
                    <strong>Layanan Analitik:</strong> Google Analytics untuk memahami cara pengguna berinteraksi dengan platform.
                  </li>
                  <li>
                    <strong>Jaringan Iklan:</strong> Google AdSense untuk menampilkan iklan yang relevan (lihat Pasal 5).
                  </li>
                  <li>
                    <strong>Penegak Hukum:</strong> Jika diwajibkan oleh peraturan perundang-undangan yang berlaku.
                  </li>
                </ul>
              </section>

              {/* 4 */}
              <section id="pp-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  4. Cookie dan Teknologi Pelacakan
                </h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  Kami menggunakan <strong>cookie</strong> dan teknologi pelacakan serupa untuk:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 text-[15px]">
                  <li>Menjaga sesi login Anda tetap aktif.</li>
                  <li>Mengingat preferensi dan pengaturan tampilan.</li>
                  <li>Mengumpulkan data analitik penggunaan (Google Analytics).</li>
                  <li>Menampilkan iklan yang dipersonalisasi (Google AdSense).</li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-4">
                  Anda dapat mengnonaktifkan cookie melalui pengaturan browser Anda, namun beberapa fitur platform mungkin tidak berfungsi optimal.
                </p>
              </section>

              {/* 5 */}
              <section id="pp-5">
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  5. Google AdSense dan Iklan
                </h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  {SITE_NAME} menggunakan <strong>Google AdSense</strong> untuk menampilkan iklan. Google AdSense menggunakan cookie DoubleClick untuk menampilkan iklan berdasarkan kunjungan Anda ke situs ini dan situs lain di internet.
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 text-[15px]">
                  <li>Google, sebagai vendor pihak ketiga, menggunakan cookie untuk menayangkan iklan.</li>
                  <li>Penggunaan cookie DART oleh Google memungkinkan penayangan iklan kepada pengguna berdasarkan kunjungan mereka ke {SITE_NAME} dan situs lain di internet.</li>
                  <li>Pengguna dapat memilih untuk tidak menggunakan cookie DART dengan mengunjungi <a href="https://policies.google.com/technologies/ads" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Kebijakan Privasi Iklan Google</a>.</li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-4 text-sm">
                  Untuk informasi lebih lanjut tentang cara Google menggunakan data saat Anda menggunakan situs mitra kami, kunjungi: <a href="https://policies.google.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">policies.google.com/privacy</a>
                </p>
              </section>

              {/* 6 */}
              <section id="pp-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  6. Hak-Hak Pengguna
                </h2>
                <p className="text-gray-600 leading-relaxed mb-3">Sebagai pengguna, Anda memiliki hak untuk:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 text-[15px]">
                  <li><strong>Akses:</strong> Melihat data pribadi yang kami simpan tentang Anda.</li>
                  <li><strong>Perbaikan:</strong> Memperbarui informasi akun melalui halaman profil.</li>
                  <li><strong>Penghapusan:</strong> Meminta penghapusan akun dan data Anda dengan menghubungi kami.</li>
                  <li><strong>Portabilitas:</strong> Meminta salinan data Anda dalam format yang dapat dibaca mesin.</li>
                  <li><strong>Opt-out Iklan:</strong> Menolak iklan yang dipersonalisasi melalui pengaturan Google.</li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-4">
                  Untuk menggunakan hak-hak di atas, silakan hubungi kami di{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
                    {CONTACT_EMAIL}
                  </a>.
                </p>
              </section>

              {/* 7 */}
              <section id="pp-7">
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  7. Keamanan Data
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang wajar untuk melindungi data Anda, termasuk enkripsi kata sandi (bcrypt), koneksi HTTPS, dan pembatasan akses data internal. Namun, tidak ada metode transmisi data melalui internet yang 100% aman, sehingga kami tidak dapat menjamin keamanan mutlak.
                </p>
              </section>

              {/* 8 */}
              <section id="pp-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  8. Tautan ke Situs Pihak Ketiga
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Platform kami dapat berisi tautan menuju situs web pihak ketiga. Kami tidak bertanggung jawab atas praktik privasi atau konten situs-situs tersebut. Kami mendorong Anda untuk membaca kebijakan privasi setiap situs yang Anda kunjungi.
                </p>
              </section>

              {/* 9 */}
              <section id="pp-9">
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  9. Perubahan Kebijakan Privasi
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan signifikan akan diberitahukan melalui notifikasi di platform atau melalui email. Tanggal "Terakhir diperbarui" di bagian atas halaman ini akan mencerminkan pembaruan terbaru. Penggunaan layanan Anda yang berkelanjutan setelah perubahan dianggap sebagai penerimaan terhadap kebijakan yang diperbarui.
                </p>
              </section>

              {/* 10 */}
              <section id="pp-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  10. Hubungi Kami
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Jika Anda memiliki pertanyaan, perhatian, atau permintaan terkait Kebijakan Privasi ini, silakan hubungi kami:
                </p>
                <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 space-y-2 text-sm text-gray-700">
                  <p><strong>Platform:</strong> {SITE_NAME}</p>
                  <p><strong>Website:</strong> <a href={SITE_URL} className="text-primary hover:underline">{SITE_URL}</a></p>
                  <p>
                    <strong>Email:</strong>{' '}
                    <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
                      {CONTACT_EMAIL}
                    </a>
                  </p>
                  <p>
                    <strong>Formulir Kontak:</strong>{' '}
                    <a href="/kontak" className="text-primary hover:underline">
                      mewangi.id/kontak
                    </a>
                  </p>
                </div>
              </section>

            </div>
          </div>
        </section>
      </div>
    </>
  );
}
