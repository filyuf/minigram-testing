import { useEffect, useMemo, useState } from "react"
import { Icon } from "@iconify/react"
import { getComments, wsSendComment, wsSubscribePost, wsUnsubscribePost } from "../services"
import { formatDistanceToNow } from "date-fns"

export default function CommentModal({ postId, currentUser, onClose, liveEvents = [] }) {
  const [text, setText] = useState("")
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")

  // map event WS -> comment item
  const liveForThisPost = useMemo(() => {
    return (liveEvents || [])
      .filter((e) => e?.type === "COMMENT" && e?.postId === postId)
      .map((e) => ({
        commentId: e.commentId,
        fromUser: e.fromUser,
        text: e.text,
        createdAt: e.createdAt,
        _live: true,
      }))
  }, [liveEvents, postId])

  useEffect(() => {
    if (!postId) return

    // subscribe realtime
    wsSubscribePost(postId)

    // load comments lama (kalau endpoint ada)
    const load = async () => {
      setLoading(true)
      setError("")
      try {
        const data = await getComments(postId)
        // data expected array [{postId, commentId, fromUser, text, createdAt}]
        setItems(Array.isArray(data) ? data : [])
      } catch (e) {
        // kalau endpoint belum ada, jangan bikin modal rusak
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    load()

    return () => {
      wsUnsubscribePost(postId)
    }
  }, [postId])

  // gabung old + live (hindari duplikat commentId)
  const merged = useMemo(() => {
    const map = new Map()
    ;[...items, ...liveForThisPost].forEach((c) => {
      if (!c?.commentId) return
      map.set(c.commentId, c)
    })
    return Array.from(map.values()).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
  }, [items, liveForThisPost])

  const handleSend = async () => {
    const t = text.trim()
    if (!t) return
    setSending(true)
    setError("")
    try {
      wsSendComment({ postId, text: t, fromUser: currentUser })
      setText("")
    } catch (e) {
      setError("Failed to send comment")
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h3 style={styles.title}>Comments</h3>
          <button style={styles.closeBtn} onClick={onClose}>
            <Icon icon="mdi:close" style={{ fontSize: 22, color: "rgba(255,255,255,0.7)" }} />
          </button>
        </div>

        {/* List */}
        <div style={styles.body}>
          {loading ? (
            <div style={styles.empty}>Loading...</div>
          ) : merged.length === 0 ? (
            <div style={styles.empty}>No comments yet. Be the first!</div>
          ) : (
            merged.map((c) => (
              <div key={c.commentId} style={styles.item}>
                <div style={styles.avatar}>
                  <Icon icon="mdi:account" style={{ fontSize: 18 }} />
                </div>
                <div style={styles.content}>
                  <div style={styles.line}>
                    <b style={styles.user}>{c.fromUser}</b>
                    <span style={styles.time}>
                      {c.createdAt
                        ? formatDistanceToNow(new Date(c.createdAt * 1000), { addSuffix: true })
                        : ""}
                    </span>
                  </div>
                  <div style={styles.text}>{c.text}</div>
                </div>
              </div>
            ))
          )}

          {error && <div style={styles.error}>{error}</div>}
        </div>

        {/* Input */}
        <div style={styles.inputRow}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Join the conversation..."
            style={styles.input}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend()
            }}
          />
          <button
            onClick={handleSend}
            disabled={sending || !text.trim()}
            style={{
              ...styles.sendBtn,
              opacity: sending || !text.trim() ? 0.5 : 1,
              cursor: sending || !text.trim() ? "not-allowed" : "pointer",
            }}
          >
            <Icon icon="mdi:send" style={{ fontSize: 18 }} />
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1200,
  },
  modal: {
    width: "92%",
    maxWidth: 520,
    maxHeight: 640,
    background: "#1A1A1A",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 18,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Inter', system-ui, sans-serif",
    color: "white",
  },
  header: {
    padding: "16px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  title: { margin: 0, fontSize: 18, fontWeight: 800 },
  closeBtn: { background: "transparent", border: "none", cursor: "pointer" },
  body: {
    flex: 1,
    overflowY: "auto",
    padding: 10,
  },
  empty: {
    padding: 24,
    textAlign: "center",
    color: "rgba(255,255,255,0.6)",
  },
  item: {
    display: "flex",
    gap: 10,
    padding: "10px 10px",
    borderRadius: 12,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  content: { flex: 1, minWidth: 0 },
  line: {
    display: "flex",
    gap: 10,
    alignItems: "baseline",
  },
  user: { fontSize: 13 },
  time: { fontSize: 11, color: "rgba(255,255,255,0.5)" },
  text: { marginTop: 2, fontSize: 14, color: "rgba(255,255,255,0.92)", lineHeight: 1.4 },
  error: {
    marginTop: 8,
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(239, 68, 68, 0.12)",
    border: "1px solid rgba(239, 68, 68, 0.28)",
    color: "#ef4444",
    fontSize: 13,
  },
  inputRow: {
    display: "flex",
    gap: 10,
    padding: 12,
    borderTop: "1px solid rgba(255,255,255,0.06)",
    background: "#151515",
  },
  input: {
    flex: 1,
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "white",
    outline: "none",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    border: "none",
    background: "rgba(59, 130, 246, 0.9)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}
