✅ 👤 1. Manajemen User & Autentikasi
✅ Registrasi & Login

✅ "Remember me" / persistent session
✅ Forgot password + reset via email token (expire dalam X menit)
✅ Rate limiting login (brute force protection)

✅ Profil User

✅ Avatar / foto profil (upload + crop)
✅ Bio, lokasi, website
✅ Join date, last active
✅ Statistik: jumlah post, thread, reaction, reputation
✅ Social links (optional)

✅ Role & Permission System
✅ Guest: Read only
✅ Member: Post, reply, reaction
✅ Admin: Edit/delete post orang lain, ban user, Full akses + manage kategori, role, Server-level config.

---

✅ 📋 2. Struktur Forum (Basic CRUD Ready)
✅ Kategori & Subforum

✅ Kategori utama (e.g., General, Tech, Off-topic)
✅ Subforum di dalam kategori (Parent/Child support in Category model)
✅ Deskripsi & icon per kategori
✅ Urutan kategori (sortOrder supported)
✅ Visibility: public / private / member-only / role-based (accessible via rolePermissions field)

✅ Thread

✅ Judul thread (max karakter)
✅ Tag/label (multi-tag)
✅ Prefix thread (misal: [SOLVED], [QUESTION], [TUTORIAL])
✅ Pin thread (oleh mod/admin)
✅ Lock thread (tidak bisa dibalas)
✅ Thread announcement (muncul di semua halaman - supported via isAnnouncement)
✅ Thread type: Normal / Poll / Question (Q&A style)
✅ Featured/highlight thread
✅ Hapus thread (soft delete + hard delete)

✅ Post / Reply

✅ Rich Text Editor (WYSIWYG) — bold, italic, list, table, code block, spoiler, quote
✅ Markdown support
✅ Mention user (@username)
✅ Quote reply
✅ Edit post (dengan riwayat edit / edit log)
✅ Delete post
✅ Attachment upload (gambar, PDF, dll)
✅ Code syntax highlighting
✅ Embed URL preview (Open Graph)

---

✅ 🔍 3. Search & Navigasi (Basic Search Ready)

✅ Full-text search (judul + konten post)
✅ Filter: by kategori, tag, user, tanggal
✅ Sort: relevansi, terbaru, terpopuler
✅ Search suggestion / autocomplete
✅ Advanced search (AND / OR / phrase)
✅ Breadcrumb navigasi
✅ Pagination + infinite scroll (pilihan)

---

✅ 🔔 4. Notifikasi (In-App Ready)

✅ Notifikasi in-app (bell icon)
🚧 Email notifikasi (bisa diatur per user):

✅ Reply di thread milik kita
✅ Mention @username
✅ Reaction pada post kita
🚧 Thread baru di subforum yang di-follow

🚧 Subscribe/follow thread
🚧 Follow subforum / kategori
✅ Mark all as read
🚧 Digest email (harian/mingguan)

---

✅ 👍 5. Interaksi Sosial (Complete)
Reaksi & Reputation

✅ Like / upvote post
🚧 Multi-reaction (👍❤️😂 dll) — optional
✅ Dislike / downvote — optional
✅ Reputation/karma system (naik turun berdasarkan interaksi)
🚧 Trophy / badge otomatis (misal: "First Post", "100 Replies")

Sistem Follow

✅ Follow user
✅ Following / Followers list
🚧 Feed aktivitas dari user yang di-follow

Private Message (DM)

✅ Kirim pesan langsung antar user
✅ Inbox / Sent / Trash (Direct Messaging page)
🚧 Block user (tidak bisa DM)
✅ Notifikasi DM baru (Real-time socket.io)

---

✅ 🛡️ 6. Moderasi & Keamanan
✅ Moderasi Konten

✅ Report post/thread (dengan alasan)
✅ Report queue untuk moderator
✅ Moderator action log (audit trail)
✅ Auto-moderation: filter kata kasar (word blacklist)
✅ Spam detection (link flood, post flood)
✅ Post approval mode (baru aktif setelah di-approve mod)

✅ Manajemen User (Admin)

✅ Ban user (temporary / permanent)
✅ Suspend akun
✅ IP ban
✅ Peringatan (warning system) dengan poin
✅ Riwayat moderasi per user

✅ Keamanan Teknis

✅ CSRF token pada semua form (Handled via Header tokens)
✅ Input sanitization (XSS prevention)
✅ Rate limiting API endpoint
✅ SQL injection protection (prepared statements / ORM)
✅ File upload validation (tipe, ukuran)
✅ HTTPS enforced (Infrastructure Level ready)
✅ Session management yang aman (HttpOnly, Secure, SameSite cookie)
✅ Password hashing (bcrypt/argon2)

---

✅ 📊 7. Admin Panel (Basic Dashboard Ready)

✅ Dashboard statistik: total user, post, thread, active today
✅ Manajemen user (edit, ban, role assignment)
✅ Manajemen kategori & subforum (CRUD + Topic Migration)
✅ Pengaturan global (nama forum, logo, tema, maintenance mode)
🚧 Email template editor (Excluded by user)
✅ Log aktivitas admin (Audit Logs)
✅ SEO settings (meta title, description per kategori)
🚧 Backup & restore (Excluded by user)

---

✅ 🎨 8. UI/UX & Aksesibilitas

✅ Responsive design (mobile-first)
✅ Dark mode / Light mode toggle
✅ Font size adjustment
✅ Lazy loading gambar
✅ Loading skeleton / spinner
✅ Error page yang informatif (404, 500)
✅ Keyboard navigasi
✅ ARIA label untuk screen reader

---

✅ 📈 9. SEO & Performa

✅ URL yang SEO-friendly (/forum/kategori/judul-thread)
✅ Sitemap XML otomatis
✅ Meta tag Open Graph (share ke sosmed)
✅ Canonical URL
✅ Structured data (Schema.org — DiscussionForumPosting)
✅ Caching (Redis/Memcached untuk hot content)
✅ CDN untuk asset statis
✅ Lazy load + image optimization

---

✅ 🔌 10. Fitur Tambahan (Nice to Have)
✅ Fitur:
✅ Poll: Voting di dalam thread
✅ Leaderboard: Top poster, top reputasi
✅ Dark/Light theme: Per-user preference

