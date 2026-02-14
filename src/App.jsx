import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import Login from "./pages/login"
import Register from "./pages/register"
import Home from "./pages/index"
import Create from "./pages/create"
import Edit from "./pages/edit"

// Protected Route Component
function ProtectedRoute({ element }) {
  const token = localStorage.getItem("token")
  return token ? element : <Navigate to="/login" replace />
}

// Public Route Component (redirects to /index if already logged in)
function PublicRoute({ element }) {
  const token = localStorage.getItem("token")
  return token ? <Navigate to="/index" replace /> : element
}

export default function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check token on app mount
    const token = localStorage.getItem("token")
    if (!token) {
      // No token, safe to proceed
      setLoading(false)
    } else {
      // Token exists, verify it's still valid (optional)
      setLoading(false)
    }
  }, [])

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Loading...</div>
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/index" replace />} />
        <Route path="/login" element={<PublicRoute element={<Login />} />} />
        <Route path="/register" element={<PublicRoute element={<Register />} />} />
        <Route path="/index" element={<ProtectedRoute element={<Home />} />} />
        <Route path="/create" element={<ProtectedRoute element={<Create />} />} />
        <Route path="/:id/edit" element={<ProtectedRoute element={<Edit />} />} />
      </Routes>
    </BrowserRouter>
  )
}
