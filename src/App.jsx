import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { ConfigProvider } from '@/context/ConfigContext'
import Layout from '@/components/layout/Layout'
import LoadingHeart from '@/components/shared/LoadingHeart'
import FloatingPhotos from '@/components/ui/FloatingPhotos'
import FloatingHearts from '@/components/ui/FloatingHearts'

// Code splitting
const Landing        = lazy(() => import('@/pages/Landing'))
const Story          = lazy(() => import('@/pages/Story'))
const Gallery        = lazy(() => import('@/pages/Gallery'))
const Reasons        = lazy(() => import('@/pages/Reasons'))
const Letter         = lazy(() => import('@/pages/Letter'))
const Countdown      = lazy(() => import('@/pages/Countdown'))
const LoveJar        = lazy(() => import('@/pages/LoveJar'))
const BucketList     = lazy(() => import('@/pages/BucketList'))
const Games          = lazy(() => import('@/pages/Games'))
const Music          = lazy(() => import('@/pages/Music'))
const Quiz           = lazy(() => import('@/pages/Quiz'))
const Wishes         = lazy(() => import('@/pages/Wishes'))
const NotFound       = lazy(() => import('@/pages/NotFound'))
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'))
const SecretLetters  = lazy(() => import('@/pages/SecretLetters'))
const Diary          = lazy(() => import('@/pages/Diary'))
const Challenges     = lazy(() => import('@/pages/Challenges'))
const Stats          = lazy(() => import('@/pages/Stats'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [pathname])
  return null
}

function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen"><LoadingHeart /></div>
  return isLoggedIn ? children : <Navigate to="/" replace />
}

function AdminRoute({ children }) {
  const { isLoggedIn, loading, role } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen"><LoadingHeart /></div>
  if (!isLoggedIn) return <Navigate to="/" replace />
  return role === 'boy' ? children : <Navigate to="/story" replace />
}

function MainSite() {
  return (
    <Layout>
      <ScrollToTop />
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><LoadingHeart /></div>}>
        <Routes>
          <Route path="/"            element={<Landing />} />
          <Route path="/story"       element={<ProtectedRoute><Story /></ProtectedRoute>} />
          <Route path="/gallery"     element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
          <Route path="/reasons"     element={<ProtectedRoute><Reasons /></ProtectedRoute>} />
          <Route path="/letter"      element={<ProtectedRoute><Letter /></ProtectedRoute>} />
          <Route path="/countdown"   element={<ProtectedRoute><Countdown /></ProtectedRoute>} />
          <Route path="/jar"         element={<ProtectedRoute><LoveJar /></ProtectedRoute>} />
          <Route path="/bucket"      element={<ProtectedRoute><BucketList /></ProtectedRoute>} />
          <Route path="/games"       element={<ProtectedRoute><Games /></ProtectedRoute>} />
          <Route path="/music"       element={<ProtectedRoute><Music /></ProtectedRoute>} />
          <Route path="/quiz"        element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
          <Route path="/wishes"      element={<ProtectedRoute><Wishes /></ProtectedRoute>} />
          <Route path="/letters"     element={<ProtectedRoute><SecretLetters /></ProtectedRoute>} />
          <Route path="/diary"       element={<ProtectedRoute><Diary /></ProtectedRoute>} />
          <Route path="/challenges"  element={<ProtectedRoute><Challenges /></ProtectedRoute>} />
          <Route path="/stats"       element={<ProtectedRoute><Stats /></ProtectedRoute>} />
          <Route path="*"            element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

function AppRoutes() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><LoadingHeart /></div>}>
      <Routes>
        <Route path="/admin"           element={<Navigate to="/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"       element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/*" element={<MainSite />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ConfigProvider>
        <AuthProvider>
          {/* Global bg & floating layers — hiện trên MỌI trang */}
          <div className="bg-romantic fixed inset-0 -z-20" aria-hidden="true" />
          <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
            <div style={{ position:'absolute', top:'-10%', right:'-5%', width:'45vw', height:'45vw', borderRadius:'50%', background:'radial-gradient(circle, rgba(255,107,157,0.22) 0%, transparent 70%)', filter:'blur(40px)' }} />
            <div style={{ position:'absolute', bottom:'5%', left:'-8%', width:'40vw', height:'40vw', borderRadius:'50%', background:'radial-gradient(circle, rgba(255,51,102,0.14) 0%, transparent 70%)', filter:'blur(50px)' }} />
            <div style={{ position:'absolute', top:'40%', right:'10%', width:'25vw', height:'25vw', borderRadius:'50%', background:'radial-gradient(circle, rgba(200,100,255,0.12) 0%, transparent 70%)', filter:'blur(35px)' }} />
          </div>
          <FloatingPhotos />
          <FloatingHearts />
          <AppRoutes />
        </AuthProvider>
        </ConfigProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
