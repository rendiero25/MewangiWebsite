# MewangiWebsite - Project Task Tracker
> Komunitas Parfum Indonesia (Forum, Review, Blog)

---

## Phase 1: Backend Foundation
- [x] Setup Node.js, Express, MongoDB, Middleware
- [x] Setup unified start script (root npm start)
- [x] Setup unified build script (root npm run build)
- [x] Add .htaccess for shared hosting support
- [x] User Model + Auth (Register, Login, JWT, Email Verification)
- [x] Admin & Member role middleware (RBAC)
- [x] Perfume Model (nama, brand, notes, image, rating)
- [x] Forum Model (Topic, Comment)
- [x] Review Model (Review + Comment, approval status)
- [x] Article/Blog Model (content, approval status)
- [x] API Routes: Auth (`/api/auth`)
- [x] API Routes: Forum (`/api/forum`)
- [x] API Routes: Review (`/api/reviews`)
- [x] API Routes: Articles (`/api/articles`)
- [x] API Routes: Admin (`/api/admin`) - approval, user management
- [x] Image upload (multer / cloudinary)
- [x] Email service (nodemailer) untuk aktivasi akun

---

## Phase 2: Frontend Foundation
- [x] Setup React Router, Axios, Auth Context
- [x] Layout: Navbar (Beranda, Forum, Review, Blog, Tentang Mewangi)
- [x] Layout: Footer
- [x] Halaman: Beranda (Landing Page)
- [x] Halaman: Login & Register (+ email verification flow)
- [x] Auth guard (protected routes)

---

## Phase 3: Forum
- [x] Halaman daftar topik forum
- [x] Halaman detail topik + komentar
- [x] Form buat topik baru (member)
- [x] Backend: CRUD topik & komentar

---

## Phase 4: Review Parfum
- [x] Halaman daftar review parfum
- [x] Halaman detail review + komentar
- [x] Form buat review baru (member, perlu approval admin)
- [x] Backend: CRUD review & komentar + approval

---

## Phase 5: Blog / Artikel
- [x] Halaman daftar artikel
- [x] Halaman detail artikel
- [x] Form tulis artikel baru (member, perlu approval admin)
- [x] Backend: CRUD artikel + approval

---

## Phase 6: Dashboard
- [x] Dashboard Member (Review & Artikel saya)
- [x] Dashboard Admin (Approval review/artikel)
- [x] Backend: Statistik & Admin endpoints

---

## Phase 7: Halaman Tambahan & Polish
- [ ] Halaman Tentang Mewangi
- [ ] Search & Filtering
- [ ] Pagination
- [ ] Responsive design
- [ ] Final UI polish & testing
