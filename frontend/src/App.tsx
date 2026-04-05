import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { FontSizeProvider } from './context/FontSizeContext';
import { ChatProvider } from './context/ChatContext';
import { BreadcrumbProvider } from './context/BreadcrumbContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ChatPopup from './components/chat/ChatPopup';
import Breadcrumbs from './components/common/Breadcrumbs';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
// Public Pages
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import VerifyEmail from './pages/public/VerifyEmail';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';
import ForumList from './pages/public/ForumList';
import ForumDetail from './pages/public/ForumDetail';
import ReviewList from './pages/public/ReviewList';
import ReviewDetail from './pages/public/ReviewDetail';
import BlogList from './pages/public/BlogList';
import BlogDetail from './pages/public/BlogDetail';
import About from './pages/public/About';
import Leaderboard from './pages/public/Leaderboard';
import NotFoundPage from './pages/public/NotFound';
import ServerErrorPage from './pages/public/ServerError';
import SkipToMain from './components/layout/SkipToMain';

// Member Pages
import CreateTopic from './pages/member/CreateTopic';
import EditTopic from './pages/member/EditTopic';
import CreateReview from './pages/member/CreateReview';
import EditReview from './pages/member/EditReview';
import CreateArticle from './pages/member/CreateArticle';
import EditArticle from './pages/member/EditArticle';
import MemberDashboard from './pages/member/MemberDashboard';
import Notifications from './pages/member/Notifications';
import Profile from './pages/public/Profile';
import PublicProfile from './pages/public/PublicProfile';
import DirectMessages from './pages/public/DirectMessages';

// Admin Pages
import AdminPanel from './pages/admin/AdminPanel';

// Layout wrapper with Navbar & Footer
function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <SkipToMain />
      <Navbar />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <Breadcrumbs />
        </div>
        <Outlet />
      </main>
      <ChatPopup />
      <Footer />
    </div>
  );
}


function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <FontSizeProvider>
          <AuthProvider>
            <NotificationProvider>
              <ChatProvider>
                <BreadcrumbProvider>
                  <Router>
                  <Routes>
                    {/* Main pages (with navbar/footer) */}
                    <Route element={<MainLayout />}>
                      <Route path="/" element={<Home />} />
                      
                      {/* Auth pages */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/verify-email/:token" element={<VerifyEmail />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password/:token" element={<ResetPassword />} />
  
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
                      <Route path="/tentang" element={<About />} />
                      <Route path="/leaderboard" element={<Leaderboard />} />
  
                      {/* Protected Routes */}
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <MemberDashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="/notifications" element={
                        <ProtectedRoute>
                          <Notifications />
                        </ProtectedRoute>
                      } />
                      <Route path="/profile" element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } />
                      <Route path="/messages" element={
                        <ProtectedRoute>
                          <DirectMessages />
                        </ProtectedRoute>
                      } />
                      <Route path="/profile/:id" element={<PublicProfile />} />
                      <Route path="/admin" element={
                        <ProtectedRoute requiredRole="admin">
                          <AdminPanel />
                        </ProtectedRoute>
                      } />
  
                      {/* Error Pages */}
                      <Route path="/404" element={<NotFoundPage />} />
                      <Route path="/500" element={<ServerErrorPage />} />
  
                      {/* Catch-all 404 route */}
                      <Route path="*" element={<NotFoundPage />} />
                    </Route>
                  </Routes>
                  </Router>
                  <Toaster position="top-right" />
                </BreadcrumbProvider>
              </ChatProvider>
            </NotificationProvider>
          </AuthProvider>
        </FontSizeProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
