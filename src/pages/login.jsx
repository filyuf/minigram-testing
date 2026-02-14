import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Icon } from "@iconify/react"
import { login } from "../services"
import "../styles.css"

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await login(username, password)

      if (res.token) {
        // simpan token dan username
        localStorage.setItem("token", res.token)
        localStorage.setItem("username", username) // username dari input
        navigate("/index")
      } else {
        setError(res.message || "Login failed")
      }
    } catch (err) {
      setError(err.message || "Server error. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: "100%",
    height: "48px",
    padding: "0 14px 0 44px",
    borderRadius: "10px",
    background: "#1A1A1A",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "white",
    fontSize: "14px",
    outline: "none"
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#1A1A1A",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "'Inter', system-ui, sans-serif",
      padding: "20px"
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "48px 40px",
          borderRadius: "20px",
          background: "#1A1A1A",
          border: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          flexDirection: "column",
          gap: "22px",
          color: "white",
          boxShadow: "0 20px 50px rgba(0,0,0,0.7)"
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1 style={{ margin: 0, fontWeight: 700, fontSize: "30px" }}>Minigram</h1>
          <p style={{ marginTop: "6px", fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>
            Sign in to your account
          </p>
        </div>

        {error && (
          <div style={{
            padding: "12px",
            borderRadius: "10px",
            background: "rgba(239,68,68,0.15)",
            color: "#fecaca",
            fontSize: "14px",
            textAlign: "center"
          }}>
            {error}
          </div>
        )}

        {/* Username */}
        <div>
          <label style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>Username</label>
          <div style={{ position: "relative", marginTop: "6px" }}>
            <Icon icon="mdi:account" style={{
              position: "absolute",
              top: "50%",
              left: "14px",
              transform: "translateY(-50%)",
              fontSize: "20px",
              color: "white"
            }} />
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              placeholder="Enter username"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>Password</label>
          <div style={{ position: "relative", marginTop: "6px" }}>
            <Icon icon="mdi:lock" style={{
              position: "absolute",
              top: "50%",
              left: "14px",
              transform: "translateY(-50%)",
              fontSize: "20px",
              color: "white"
            }} />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Enter password"
              style={{ ...inputStyle, paddingRight: "48px" }}
            />
            <Icon
              icon={showPassword ? "mdi:eye-off" : "mdi:eye"}
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                top: "50%",
                right: "14px",
                transform: "translateY(-50%)",
                fontSize: "20px",
                cursor: "pointer",
                color: "white"
              }}
            />
          </div>
        </div>

        <button
          disabled={loading}
          type="submit"
          style={{
            height: "50px",
            borderRadius: "12px",
            border: "none",
            background: loading ? "#1e293b" : "#2563eb",
            color: "white",
            fontWeight: 600,
            fontSize: "15px",
            cursor: loading ? "not-allowed" : "pointer",
            marginTop: "10px"
          }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <div style={{
          fontSize: "14px",
          textAlign: "center",
          color: "rgba(255,255,255,0.6)"
        }}>
          Don't have an account?{" "}
          <span
            style={{ color: "#3b82f6", cursor: "pointer", fontWeight: 600 }}
            onClick={() => window.location.href = "/register"}
          >
            Sign up
          </span>
        </div>
      </form>
    </div>
  )

}