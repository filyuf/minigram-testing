import { useState, useEffect } from "react"
import { Icon } from "@iconify/react"
import { useNavigate, useLocation } from "react-router-dom"
import NotificationModal from "./NotificationModal"
import { getNotifications } from "../services"

const API = import.meta.env.VITE_API_URL

export default function Sidebar() {
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeMenu, setActiveMenu] = useState("home")
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])

  const username = localStorage.getItem("username") || "User"
  const token = localStorage.getItem("token")
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === "/index") setActiveMenu("home")
    else if (location.pathname === "/create") setActiveMenu("create")
    else if (location.pathname.includes("/edit")) setActiveMenu("create")
  }, [location.pathname])

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications()

        const postIds = [...new Set((data || []).map(n => n.post_id).filter(Boolean))]

        const results = await Promise.allSettled(
          postIds.map(id =>
            fetch(`${API}/posts/${id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
              .then(res => (res.ok ? res.json() : null))
          )
        )

        const posts = results
          .map(result => (result.status === "fulfilled" ? result.value : null))
          .filter(Boolean)

        const mapped = (data || []).map(n => {
          const post = posts.find(p => p?.id === n.post_id)
          return {
            fromUser: n.from_user || "Unknown",
            postTitle: post?.caption || "Post deleted",
            createdAt: n.created_at || new Date().toISOString(),
          }
        })

        setNotifications(mapped)
      } catch (err) {
        console.error("Failed to fetch notifications:", err)
      }
    }

    fetchNotifications()
  }, [token])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("username")
    navigate("/login")
  }

  const handleMenuClick = (path) => {
    navigate(path)
  }

  return (
    <div style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logoContainer}>
        <div style={styles.logoIcon}>
          <Icon icon="mingcute:message-3-fill" width="24" height="24" style={{ color: "#fff" }} />
        </div>
        <div style={styles.logo}>Minigram</div>
      </div>

      {/* Menu Items */}
      <div style={styles.menuSection}>
        <Menu
          icon="mdi:home"
          label="Home"
          active={activeMenu === "home"}
          onClick={() => handleMenuClick("/index")}
        />
        <Menu
          icon="mdi:heart-outline"
          label="Notifications"
          active={showNotifications}
          onClick={() => setShowNotifications(true)}
        />
        <Menu
          icon="mdi:plus-box"
          label="Create"
          active={activeMenu === "create"}
          onClick={() => handleMenuClick("/create")}
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* User Profile */}
      <div
        style={styles.usernameContainer}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <div style={styles.userAvatar}>
          <Icon icon="mdi:account" style={{ fontSize: "20px", color: "white" }} />
        </div>
        <div style={styles.userInfo}>
          <div style={styles.username}>{username}</div>
          <div style={styles.userStatus}>Active</div>
        </div>
        <Icon
          icon={showDropdown ? "mdi:chevron-up" : "mdi:chevron-down"}
          style={{ fontSize: "20px", color: "rgba(255,255,255,0.6)" }}
        />
      </div>

      {showDropdown && (
        <div style={styles.dropdown}>
          <div
            style={{ ...styles.dropdownItem, color: "#ff3040" }}
            onClick={handleLogout}
          >
            <Icon icon="mdi:logout" style={{ fontSize: "18px" }} />
            <span>Logout</span>
          </div>
        </div>
      )}

      {showNotifications && (
        <NotificationModal
          notifications={notifications}
          currentUser={username}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </div>
  )
}

function Menu({ icon, label, onClick, active }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      style={{
        ...styles.item,
        background: active ? "rgba(59, 130, 246, 0.15)" : isHovered ? "rgba(255,255,255,0.05)" : "transparent",
        borderLeft: active ? "3px solid #3b82f6" : "3px solid transparent",
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Icon
        icon={icon}
        style={{
          fontSize: "24px",
          color: active ? "#3b82f6" : "white",
          transition: "color 0.2s ease",
        }}
      />
      <span
        style={{
          fontWeight: active ? 600 : 400,
          color: active ? "white" : "rgba(255,255,255,0.8)",
        }}
      >
        {label}
      </span>
    </div>
  )
}

const styles = {
  sidebar: {
    width: 240,
    height: "100vh",
    position: "fixed",
    left: 0,
    top: 0,
    zIndex: 50,
    background: "#1A1A1A",
    borderRight: "1px solid rgba(255,255,255,0.08)",
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "32px",
    padding: "0 8px",
  },
  logoIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "#1A1A1A",
    border: "1px solid rgba(255,255,255,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { fontSize: "20px", fontWeight: 700, color: "white", letterSpacing: "-0.3px" },
  menuSection: { display: "flex", flexDirection: "column", gap: "4px" },
  usernameContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    borderRadius: "12px",
    cursor: "pointer",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "white",
    position: "relative",
    transition: "all 0.2s ease",
  },
  userAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "#2b2b2b",
    border: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  userInfo: { flex: 1, minWidth: 0 },
  username: {
    fontSize: "14px",
    fontWeight: 600,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userStatus: { fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "2px" },
  dropdown: {
    position: "absolute",
    bottom: "80px",
    left: "16px",
    right: "16px",
    background: "#1A1A1A",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
    zIndex: 100,
  },
  dropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    cursor: "pointer",
    color: "white",
    fontSize: "14px",
    fontWeight: 500,
    transition: "background 0.2s ease",
  },
  dropdownDivider: { height: "1px", background: "rgba(255,255,255,0.08)", margin: "4px 0" },
  item: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "12px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    color: "white",
    fontSize: "15px",
  },
}
