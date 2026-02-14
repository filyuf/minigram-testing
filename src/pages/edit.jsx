import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getPostById, updatePost } from "../services"
import Sidebar from "../components/Sidebar"

export default function Edit() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [caption, setCaption] = useState("")
  const [existingImage, setExistingImage] = useState(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    getPostById(id)
      .then((data) => {
        setCaption(data.caption)
        setExistingImage(data.image_url)
      })
      .catch((err) => setError(err.message))
  }, [id])

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // ✅ kirim caption aja
    updatePost(id, caption)
      .then(() => {
        setSuccess("Post updated successfully!")
        setTimeout(() => navigate("/index"), 1200)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  return (
    <div style={styles.container}>
      <Sidebar />
      
      <div style={styles.main}>
        <div style={styles.page}>
          <div style={styles.card}>
            <div style={styles.header}>
              <h1 style={styles.title}>Edit Post</h1>
              <p style={styles.subtitle}>Update your post</p>
            </div>

            {error && <Message type="error" text={error} />}
            {success && <Message type="success" text={success} />}

            <div style={styles.formWrapper}>
              <div style={styles.field}>
                <label style={styles.label}>Caption</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  style={styles.textarea}
                  placeholder="Write a caption..."
                />
              </div>

              {/* ✅ Image hanya tampil, tidak bisa diganti */}
              {existingImage && (
                <div style={styles.field}>
                  <label style={styles.label}>Image (cannot be changed)</label>
                  <div style={styles.imageContainer}>
                    <img src={existingImage} alt="current" style={styles.image} />
                  </div>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  ...styles.button,
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ===== UI COMPONENTS ===== */
function Message({ type, text }) {
  const color = type === "error" ? "#fecaca" : "#86efac"
  const bg = type === "error" ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)"
  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: "12px",
        background: bg,
        color,
        textAlign: "center",
        fontSize: "14px",
        fontWeight: 500,
        letterSpacing: "-0.01em",
      }}
    >
      {text}
    </div>
  )
}

/* ===== STYLES (pakai punyamu, ini cuma minimal yang kepake) ===== */
const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    background: "#0f0f0f",
  },
  main: {
    flex: 1,
    marginLeft: "240px",
    padding: "20px",
  },
  page: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    padding: "20px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "540px",
    padding: "40px",
    borderRadius: "20px",
    background: "#1A1A1A",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "28px",
    color: "white",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
  },
  header: {
    textAlign: "center",
    paddingBottom: "8px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  title: { margin: 0, fontWeight: 700, fontSize: "32px", letterSpacing: "-0.02em" },
  subtitle: { margin: "8px 0 0", fontSize: "14px", color: "rgba(255,255,255,0.5)" },
  formWrapper: { display: "flex", flexDirection: "column", gap: "24px" },
  field: { display: "flex", flexDirection: "column" },
  label: { fontSize: "13px", fontWeight: 600, marginBottom: "10px", color: "rgba(255,255,255,0.8)" },
  textarea: {
    width: "100%",
    minHeight: "120px",
    padding: "16px",
    borderRadius: "12px",
    background: "#0f0f0f",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "white",
    fontSize: "14px",
    resize: "vertical",
    fontFamily: "inherit",
    lineHeight: "1.6",
    outline: "none",
    boxSizing: "border-box",
  },
  imageContainer: { marginTop: "8px" },
  image: {
    width: "100%",
    maxHeight: "380px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.12)",
    objectFit: "cover",
    display: "block",
  },
  button: {
    height: "52px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "white",
    fontWeight: 600,
    fontSize: "15px",
    marginTop: "8px",
  },
}
