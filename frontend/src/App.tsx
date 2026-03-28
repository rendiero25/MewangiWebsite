import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Public Pages
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import VerifyEmail from './pages/public/VerifyEmail';
import ForumList from './pages/public/ForumList';
import ForumDetail from './pages/public/ForumDetail';
import ReviewList from './pages/public/ReviewList';
import ReviewDetail from './pages/public/ReviewDetail';
import BlogList from './pages/public/BlogList';
import BlogDetail from './pages/public/BlogDetail';

// Member Pages
import CreateTopic from './pages/member/CreateTopic';
import EditTopic from './pages/member/EditTopic';
import CreateReview from './pages/member/CreateReview';
import EditReview from './pages/member/EditReview';
import CreateArticle from './pages/member/CreateArticle';
import EditArticle from './pages/member/EditArticle';
import MemberDashboard from './pages/member/MemberDashboard';

// Admin Pages
import AdminPanel from './pages/admin/AdminPanel';

// Layout wrapper with Navbar & Footer
function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Main pages (with navbar/footer) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            
            {/* Auth pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />

            {/* Forum */}
            <Route path="/forum" element={<ForumList />} />
            <Route path="/forum/:id" element={<ForumDetail />} />
            <Route path="/forum/new" element={
              <ProtectedRoute>
                <CreateTopic />
              </ProtectedRoute>
            } />
            <Route path="/forum/edit/:id" element={
              <ProtectedRoute>
                <EditTopic />
              </ProtectedRoute>
            } />

            {/* Review */}
            <Route path="/review" element={<ReviewList />} />
            <Route path="/review/:id" element={<ReviewDetail />} />
            <Route path="/review/new" element={
              <ProtectedRoute>
                <CreateReview />
              </ProtectedRoute>
            } />
            <Route path="/review/edit/:id" element={
              <ProtectedRoute>
                <EditReview />
              </ProtectedRoute>
            } />
            {/* Blog */}
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/new" element={
              <ProtectedRoute>
                <CreateArticle />
              </ProtectedRoute>
            } />
            <Route path="/blog/edit/:id" element={
              <ProtectedRoute>
                <EditArticle />
              </ProtectedRoute>
            } />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/tentang" element={<div className="min-h-screen flex items-center justify-center text-xl text-gray-400">🔨 Tentang Mewangi — Segera Hadir</div>} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <MemberDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminPanel />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
