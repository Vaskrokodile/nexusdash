import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import AdminLayout from './pages/AdminLayout'
import AdminDashboard from './pages/AdminDashboard'
import ClientsPage from './pages/ClientsPage'
import ClientDetailPage from './pages/ClientDetailPage'
import UsersPage from './pages/UsersPage'
import PublicDashboard from './pages/PublicDashboard'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  if (user.client_id) {
    return <Navigate to={`/dashboard/${user.client_id}`} replace />
  }
  
  return children
}

function RootRedirect() {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div className="loading-spinner" />
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  if (user.client_id) {
    return <Navigate to={`/dashboard/${user.client_id}`} replace />
  }
  
  return <Navigate to="/admin" replace />
}

function App() {
  return (
    <div className="app-container">
      <div className="background-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      <div className="page-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard/:id" element={<PublicDashboard />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="clients/:id" element={<ClientDetailPage />} />
            <Route path="users" element={<UsersPage />} />
          </Route>
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
