import { useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import { createPost } from "../services"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"

export default function CreatePost() {
  const [caption, setCaption] = useState("")
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const username = localStorage.getItem("username")

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const handleImageChange = e => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB")
      return
    }

    if (preview) URL.revokeObjectURL(preview)

    setImageFile(file)
    setPreview(URL.createObjectURL(file))
    setError("")
  }

  const handleRemoveImage = () => {
    if (preview) URL.revokeObjectURL(preview)
    setImageFile(null)
    setPreview(null)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError("")

    if (!caption.trim()) {
      setError("Please write a caption")
      return
    }

    if (!imageFile) {
      setError("Please select an image")
      return
    }

    setLoading(true)
    try {
      await createPost(caption, imageFile)
      navigate("/index")
    } catch (err) {
      setError(err?.message || "Failed to create post")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <Sidebar username={username} onCreate={() => {}} onShowNotif={() => {}} />

      <div style={styles.main}>
        <div style={styles.content}>
          {/* Header */}
          <div style={styles.header}>
            <button onClick={() => navigate("/index")} style={styles.backBtn}>
              <Icon icon="mdi:arrow-left" style={{ fontSize: 24 }} />
            </button>
            <h1 style={styles.title}>Create New Post</h1>
            <div style={{ width: 40 }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Image Upload*/}
            <div style={styles.uploadSection}>
              {!preview ? (
                <label htmlFor="image-upload" style={styles.uploadArea}>
                  <Icon icon="mdi:image-plus" style={styles.uploadIcon} />
                  <p style={styles.uploadText}>Click to upload image</p>
                  <p style={styles.uploadHint}>JPG, PNG, or WEBP (Max 5MB)</p>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={styles.fileInput}
                  />
                </label>
              ) : (
                <div style={styles.previewContainer}>
                  <img src={preview} alt="Preview" style={styles.previewImage} />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    style={styles.removeBtn}
                  >
                    <Icon icon="mdi:close-circle" style={{ fontSize: 32 }} />
                  </button>
                </div>
              )}
            </div>

            {/* Caption */}
            <div style={styles.captionSection}>
              <label style={styles.label}>
                <Icon icon="mdi:text" style={{ fontSize: 20, marginRight: 8 }} />
                Caption
              </label>
              <textarea
                placeholder="Write a caption..."
                value={caption}
                onChange={e => setCaption(e.target.value)}
                style={styles.textarea}
                maxLength={2200}
              />
              <div style={styles.charCount}>{caption.length} / 2200</div>
            </div>

            {/* Error Message */}
            {error && (
              <div style={styles.errorBox}>
                <Icon icon="mdi:alert-circle" style={{ fontSize: 20, marginRight: 8 }} />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !caption.trim() || !imageFile}
              style={{
                ...styles.submitBtn,
                opacity: loading || !caption.trim() || !imageFile ? 0.5 : 1,
                cursor: loading || !caption.trim() || !imageFile ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <>
                  <Icon icon="mdi:loading" className="spin" style={{ fontSize: 20, marginRight: 8 }} />
                  Posting...
                </>
              ) : (
                <>
                  <Icon icon="mdi:send" style={{ fontSize: 20, marginRight: 8 }} />
                  Share Post
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  )
}

const styles = {
  container: {
    display: "flex",
    background: "#0A0A0A",
    minHeight: "100vh",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  },
  main: {
    marginLeft: 240,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    padding: "30px 20px",
  },
  content: { width: "100%", maxWidth: 600 },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
    padding: "0 8px",
  },
  backBtn: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "white",
    transition: "all 0.2s ease",
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: "white",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  form: {
    background: "#1A1A1A",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: 32,
    display: "flex",
    flexDirection: "column",
    gap: 28,
  },
  uploadSection: { width: "100%" },
  uploadArea: {
    width: "100%",
    aspectRatio: "1 / 1",
    border: "2px dashed rgba(255,255,255,0.2)",
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    background: "rgba(255,255,255,0.02)",
    position: "relative",
    overflow: "hidden",
  },
  uploadIcon: {
    fontSize: 64,
    color: "rgba(255,255,255,0.3)",
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: 600,
    color: "rgba(255,255,255,0.8)",
    margin: 0,
    marginBottom: 8,
  },
  uploadHint: { fontSize: 14, color: "rgba(255,255,255,0.4)", margin: 0 },
  fileInput: { display: "none" },
  previewContainer: {
    width: "100%",
    aspectRatio: "1 / 1",
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    background: "#0f0f0f",
  },
  previewImage: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  removeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    background: "rgba(0,0,0,0.7)",
    border: "none",
    borderRadius: "50%",
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "white",
    transition: "all 0.2s ease",
    backdropFilter: "blur(10px)",
  },
  captionSection: { display: "flex", flexDirection: "column", gap: 12 },
  label: {
    display: "flex",
    alignItems: "center",
    fontSize: 14,
    fontWeight: 600,
    color: "rgba(255,255,255,0.9)",
    letterSpacing: "-0.01em",
  },
  textarea: {
    width: "100%",
    minHeight: 120,
    padding: 16,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    color: "white",
    fontSize: 15,
    fontFamily: "inherit",
    resize: "vertical",
    outline: "none",
    transition: "all 0.2s ease",
    lineHeight: 1.6,
  },
  charCount: { fontSize: 12, color: "rgba(255,255,255,0.4)", textAlign: "right" },
  errorBox: {
    display: "flex",
    alignItems: "center",
    padding: "12px 16px",
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: 12,
    color: "#ef4444",
    fontSize: 14,
    fontWeight: 500,
  },
  submitBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: "14px 24px",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    border: "none",
    borderRadius: 12,
    color: "white",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    letterSpacing: "-0.01em",
  },
}
