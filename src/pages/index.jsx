import { useEffect, useState } from "react"
import Sidebar from "../components/Sidebar"
import PostCard from "../components/PostCard"
import NotificationModal from "../components/NotificationModal"
import CommentModal from "../components/CommentModal" 
import { getPosts, deletePost, connectWS } from "../services"
import { useNavigate } from "react-router-dom"
import { Icon } from "@iconify/react"

export default function Home() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [notifs, setNotifs] = useState([])
  const [showNotif, setShowNotif] = useState(false)

  // ✅ comments modal state
  const [showComments, setShowComments] = useState(false)
  const [activePostId, setActivePostId] = useState(null)
  const [liveEvents, setLiveEvents] = useState([])

  // modal delete state
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    postId: null,
    loading: false,
    error: "",
  })

  const username = localStorage.getItem("username")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login", { replace: true })
      return
    }

    loadPosts()

    connectWS((msg) => {
      setLiveEvents((prev) => [msg, ...prev].slice(0, 200))
    })

  }, [])

  const loadPosts = async () => {
    try {
      const data = await getPosts()
      setPosts(data)
    } catch (err) {
      console.error("Gagal load posts:", err)
    }
  }

  const handleDeleted = (id) => {
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  const handleRequestDelete = (id) => {
    setConfirmDelete({
      open: true,
      postId: id,
      loading: false,
      error: "",
    })
  }

  const handleCancelDelete = () => {
    if (confirmDelete.loading) return
    setConfirmDelete({ open: false, postId: null, loading: false, error: "" })
  }

  const handleConfirmDelete = async () => {
    const id = confirmDelete.postId
    if (!id) return

    setConfirmDelete((prev) => ({ ...prev, loading: true, error: "" }))
    try {
      await deletePost(id)
      handleDeleted(id)
      setConfirmDelete({ open: false, postId: null, loading: false, error: "" })
    } catch (err) {
      setConfirmDelete((prev) => ({
        ...prev,
        loading: false,
        error: err?.message || "Failed to delete post",
      }))
    }
  }

  return (
    <div style={{ display: "flex", background: "#0A0A0A", minHeight: "100vh" }}>
      <Sidebar
        username={username}
        onCreate={() => navigate("/create")}
        onShowNotif={() => setShowNotif(true)}
      />

      <div style={styles.feedWrapper}>
        <div style={styles.feed}>
          {posts.length === 0 ? (
            <div style={styles.empty}>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "16px" }}>
                No posts yet. Create your first post!
              </p>
            </div>
          ) : (
            posts.map((p) => (
              <PostCard
                key={p.id}
                post={{
                  id: p.id,
                  username: p.username,
                  content: p.caption,
                  image: p.image_url,
                  created_at: p.created_at,
                }}
                currentUser={username}
                onRequestDelete={() => handleRequestDelete(p.id)}
                onDeleted={handleDeleted}
                // ✅ open comment modal
                onOpenComments={(postId) => {
                  setActivePostId(postId)
                  setShowComments(true)
                }}
              />
            ))
          )}
        </div>
      </div>

      {showNotif && (
        <NotificationModal notifications={notifs} onClose={() => setShowNotif(false)} />
      )}

      {/* ✅ Comment Modal */}
      {showComments && activePostId && (
        <CommentModal
          postId={activePostId}
          currentUser={username}
          liveEvents={liveEvents}
          onClose={() => {
            setShowComments(false)
            setActivePostId(null)
          }}
        />
      )}

      {confirmDelete.open && (
        <div style={modalStyles.overlay} onClick={handleCancelDelete}>
          <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={modalStyles.header}>
              <h3 style={modalStyles.title}>Delete post?</h3>
              <button style={modalStyles.iconBtn} onClick={handleCancelDelete}>
                <Icon icon="mdi:close" style={{ fontSize: 22, color: "rgba(255,255,255,0.7)" }} />
              </button>
            </div>

            <p style={modalStyles.desc}>
              This action can’t be undone. Your post will be permanently deleted.
            </p>

            {confirmDelete.error && (
              <div style={modalStyles.errorBox}>
                <Icon icon="mdi:alert-circle" style={{ fontSize: 18 }} />
                <span>{confirmDelete.error}</span>
              </div>
            )}

            <div style={modalStyles.footer}>
              <button
                onClick={handleCancelDelete}
                disabled={confirmDelete.loading}
                style={{
                  ...modalStyles.btn,
                  ...modalStyles.btnGhost,
                  opacity: confirmDelete.loading ? 0.6 : 1,
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDelete}
                disabled={confirmDelete.loading}
                style={{
                  ...modalStyles.btn,
                  ...modalStyles.btnDanger,
                  opacity: confirmDelete.loading ? 0.6 : 1,
                }}
              >
                {confirmDelete.loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  feedWrapper: {
    marginLeft: 240,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    padding: "30px 20px",
  },
  feed: {
    width: "100%",
    maxWidth: 500,
  },
  empty: {
    textAlign: "center",
    padding: "60px 20px",
    background: "#1A1A1A",
    borderRadius: "24px",
    border: "1px solid rgba(255,255,255,0.08)",
  },
}

const modalStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#1A1A1A",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    width: "92%",
    maxWidth: 420,
    padding: 20,
    color: "white",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: { margin: 0, fontSize: 18, fontWeight: 700 },
  iconBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 6,
    borderRadius: 10,
  },
  desc: {
    margin: "8px 0 16px 0",
    color: "rgba(255,255,255,0.65)",
    fontSize: 14,
    lineHeight: 1.5,
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(239, 68, 68, 0.12)",
    border: "1px solid rgba(239, 68, 68, 0.28)",
    color: "#ef4444",
    fontSize: 13,
    marginBottom: 14,
  },
  footer: {
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
  },
  btn: {
    border: "none",
    borderRadius: 12,
    padding: "10px 14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  btnGhost: {
    background: "rgba(255,255,255,0.06)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  btnDanger: {
    background: "rgba(239, 68, 68, 0.95)",
    color: "white",
  },
}
