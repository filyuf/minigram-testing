import { useState, useEffect } from "react"
import { Icon } from "@iconify/react"
import { sendLike, checkLike } from "../services"
import { useNavigate } from "react-router-dom"

const formatTimeID = (ts) => {
  if (!ts) return "-"
  const date = new Date(ts)
  return date.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function PostCard({
  post,
  currentUser,
  onDeleted,
  onRequestDelete,
  onOpenComments, // ✅ NEW
}) {
  const navigate = useNavigate()
  const [boom, setBoom] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [liked, setLiked] = useState(null)

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const res = await checkLike(post.id, currentUser)
        if (alive) setLiked(res.liked)
      } catch {
        if (alive) setLiked(false)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [post.id, currentUser])

  const handleLike = async () => {
    if (liked) return
    setLiked(true)
    try {
      await sendLike(post.id, post.username)
    } catch {
      setLiked(false)
    }
  }

  const handleDouble = async () => {
    if (!liked) {
      setLiked(true)
      try {
        await sendLike(post.id, post.username)
      } catch {
        setLiked(false)
      }
    }
    setBoom(true)
    setTimeout(() => setBoom(false), 600)
  }

  const handleEdit = () => {
    setShowMenu(false)
    navigate(`/${post.id}/edit`)
  }

  // ✅ Tidak delete di sini. Cuma buka modal di parent.
  const handleDelete = () => {
    setShowMenu(false)
    onRequestDelete?.(post.id)
  }

  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.avatarWrapper}>
          <div style={styles.avatar}>
            <Icon icon="mdi:account" style={{ fontSize: 20 }} />
          </div>
          <div>
            <div style={styles.username}>{post.username}</div>
            <div style={styles.time}>{formatTimeID(post.created_at)}</div>
          </div>
        </div>

        {post.username === currentUser && (
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowMenu(!showMenu)} style={styles.moreBtn}>
              <Icon icon="mdi:dots-horizontal" style={{ fontSize: 22, color: "white" }} />
            </button>

            {showMenu && (
              <div style={styles.menu}>
                <button onClick={handleEdit} style={styles.menuItem}>
                  ✏️ Edit
                </button>
                <button
                  onClick={handleDelete}
                  style={{ ...styles.menuItem, color: "#ff6b6b" }}
                >
                  🗑 Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image */}
      <div onDoubleClick={handleDouble} style={styles.imageBox}>
        <img src={post.image} alt="post" style={styles.img} />
        {boom && <Icon icon="mdi:heart" style={styles.heartBoom} />}
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <button onClick={handleLike} style={styles.btn}>
            <Icon
              icon={liked ? "mdi:heart" : "mdi:heart-outline"}
              style={{ fontSize: 26, color: liked ? "#ff3040" : "white" }}
            />
          </button>

          {/* ✅ Comment icon */}
          <button onClick={() => onOpenComments?.(post.id)} style={styles.btn}>
            <Icon icon="mdi:comment-outline" style={{ fontSize: 26, color: "white" }} />
          </button>
        </div>
      </div>

      <div style={styles.caption}>
        <b>{post.username}</b> {post.content}
      </div>
    </div>
  )
}

const styles = {
  card: {
    background: "#1A1A1A",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    overflow: "hidden",
    width: "100%",
    maxWidth: "470px",
    margin: "0 auto 24px",
    color: "white",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  avatarWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  avatar: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "#2b2b2b",
    border: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  username: {
    fontWeight: 600,
    fontSize: "14px",
    marginBottom: "3px",
    letterSpacing: "-0.01em",
  },
  time: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.5)",
  },
  moreBtn: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    cursor: "pointer",
    padding: "6px",
    display: "flex",
    alignItems: "center",
    transition: "all 0.2s ease",
    borderRadius: "50%",
  },
  imageBox: {
    width: "100%",
    aspectRatio: "1 / 1",
    overflow: "hidden",
    position: "relative",
    cursor: "pointer",
    background: "#0f0f0f",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  heartBoom: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "120px",
    color: "white",
    filter: "drop-shadow(0 0 20px rgba(255, 48, 64, 0.8))",
    animation: "boom 0.6s ease-out",
    pointerEvents: "none",
  },
  actions: {
    padding: "14px 16px 8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  btn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0",
    display: "flex",
    alignItems: "center",
    transition: "transform 0.2s ease",
    outline: "none",
  },
  caption: {
    padding: "0 16px 10px",
    fontSize: "14px",
    lineHeight: 1.5,
    letterSpacing: "-0.01em",
  },
  menu: {
    position: "absolute",
    top: "40px",
    right: 0,
    background: "#1A1A1A",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "12px",
    overflow: "hidden",
    zIndex: 10,
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
    minWidth: "120px",
  },
  menuItem: {
    padding: "12px 16px",
    background: "none",
    border: "none",
    color: "white",
    fontSize: "14px",
    width: "100%",
    textAlign: "left",
    cursor: "pointer",
    transition: "background 0.2s ease",
    letterSpacing: "-0.01em",
  },
}
