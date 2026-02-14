import { Icon } from "@iconify/react"
import { formatDistanceToNow } from "date-fns"

export default function NotificationModal({ notifications, currentUser, onClose }) {
  const grouped = notifications.reduce((acc, n) => {
    const user = n.fromUser === currentUser ? "You" : n.fromUser
    if (!acc[user]) acc[user] = { count: 0, latest: n.createdAt, titles: [] }
    acc[user].count += 1
    acc[user].titles.push(n.postTitle)
    if (new Date(n.createdAt) > new Date(acc[user].latest)) acc[user].latest = n.createdAt
    return acc
  }, {})

  const users = Object.keys(grouped)

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h3 style={styles.title}>Notifications</h3>
          <button style={styles.closeBtn} onClick={onClose}>
            <Icon icon="mdi:close" style={{ fontSize: "24px", color: "rgba(255,255,255,0.7)" }} />
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {users.length === 0 ? (
            <div style={styles.empty}>
              <Icon icon="mdi:bell-outline" style={{ fontSize: "48px", color: "rgba(255,255,255,0.3)" }} />
              <p style={styles.emptyText}>No notifications yet</p>
              <p style={styles.emptySubtext}>
                When someone likes or comments on your posts, you'll see it here
              </p>
            </div>
          ) : (
            users.map((user, i) => {
              const info = grouped[user]
              return (
                <div key={i} style={styles.item}>
                  <div style={styles.notifIcon}>
                    <Icon icon="mdi:heart" style={{ fontSize: "20px", color: "#ff3040" }} />
                  </div>
                  <div style={styles.notifContent}>
                    {info.titles.map((title, idx) => (
                      <p key={idx} style={styles.notifText}>
                        {user} liked your post "{title}"
                      </p>
                    ))}
                    <p style={styles.notifTime}>
                      {formatDistanceToNow(new Date(info.latest), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
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
    zIndex: 1000
  },
  modal: {
    background: "#1A1A1A",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    width: "90%",
    maxWidth: "480px",
    maxHeight: "600px",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Inter', system-ui, sans-serif"
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px",
    borderBottom: "1px solid rgba(255,255,255,0.06)"
  },
  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 700,
    color: "white"
  },
  closeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    borderRadius: "8px"
  },
  content: {
    flex: 1,
    overflowY: "auto",
    padding: "8px"
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 40px",
    textAlign: "center"
  },
  emptyText: {
    margin: "16px 0 8px 0",
    fontSize: "16px",
    fontWeight: 600,
    color: "white"
  },
  emptySubtext: {
    margin: 0,
    fontSize: "14px",
    color: "rgba(255,255,255,0.5)",
    lineHeight: 1.5
  },
  item: {
    display: "flex",
    gap: "12px",
    padding: "16px",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "background 0.2s ease",
    margin: "4px 8px"
  },
  notifIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "rgba(255, 48, 64, 0.15)",
    border: "1px solid rgba(255, 48, 64, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  notifContent: {
    flex: 1,
    minWidth: 0
  },
  notifText: {
    margin: 0,
    fontSize: "14px",
    color: "white",
    lineHeight: 1.5
  },
  notifTime: {
    margin: "4px 0 0 0",
    fontSize: "12px",
    color: "rgba(255,255,255,0.5)"
  },
  footer: {
    padding: "16px 24px",
    borderTop: "1px solid rgba(255,255,255,0.06)"
  },
  markAllBtn: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "rgba(59, 130, 246, 0.15)",
    color: "#3b82f6",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px"
  }
}
