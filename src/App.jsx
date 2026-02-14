import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/login"
import Register from "./pages/register"
import Home from "./pages/index"
import Create from "./pages/create"
import Edit from "./pages/edit"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/index" element={<Home />} />
        <Route path="/create" element={<Create />} />
        <Route path=":id/edit" element={<Edit />} />
      </Routes>
    </BrowserRouter>
  )
}
