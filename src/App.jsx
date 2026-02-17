import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import Login from "./pages/login"
import Register from "./pages/register"
import Home from "./pages/index"
import Create from "./pages/create"
import Edit from "./pages/edit"

function ProtectedRoute({ element }) {
  const token = localStorage.getItem("token")
  return token ? element : <Navigate to="/login" replace />
}

function PublicRoute({ element }) {
  const token = localStorage.getItem("token")
  return token ? <Navigate to="/index" replace /> : element
}

export default function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      setLoading(false)
    } else {
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
