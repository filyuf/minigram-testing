const API = import.meta.env.VITE_API_URL
const WS_URL = import.meta.env.VITE_WS_URL

// Helper
const getToken = () => localStorage.getItem("token")

const authFetch = (url, options = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  })
}

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result.split(",")[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

// Auth
export const login = async (username, password) => {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || "Invalid credentials")
  return data
}

export const register = async (username, email, password) => {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || "Registration failed")
  return data
}

// Posts
export const getPosts = async () => {
  const token = localStorage.getItem("token")
  const res = await fetch(`${API}/posts`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Failed to load posts")
  return res.json()
}

export const getPostById = async (id) => {
  const res = await authFetch(`${API}/posts/${id}`)
  if (!res.ok) throw new Error("Failed to load post")
  return res.json()
}

export const createPost = async (caption, imageFile) => {
  const imageBase64 = await fileToBase64(imageFile)

  const res = await authFetch(`${API}/posts`, {
    method: "POST",
    body: JSON.stringify({
      caption,
      image: imageBase64,
      contentType: imageFile.type,
      filename: imageFile.name,
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || "Failed to create post")
  return data
}

export const updatePost = async (id, caption) => {
  const res = await authFetch(`${API}/posts/${id}`, {
    method: "PUT",
    body: JSON.stringify({ caption }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || "Update failed")
  return data
}

export const deletePost = async (postId) => {
  const res = await authFetch(`${API}/posts/${postId}`, { method: "DELETE" })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || "Failed to delete post")
  }
  return res.json()
}

// WebSocket
let ws
let pending = []

export const connectWS = (onMessage) => {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return ws
  }

  ws = new WebSocket(WS_URL)

  ws.onopen = () => {
    // flush queue
    pending.forEach((m) => ws.send(m))
    pending = []
  }

  ws.onmessage = (e) => {
    try {
      onMessage?.(JSON.parse(e.data))
    } catch {
      // ignore bad payload
    }
  }

  ws.onclose = () => {
    // optionally handle close, e.g. try reconnecting after a delay
  }

  ws.onerror = () => {
    // optionally handle errors
  }

  return ws
}

const wsSend = (obj) => {
  const msg = JSON.stringify(obj)
  if (ws && ws.readyState === WebSocket.OPEN) ws.send(msg)
  else pending.push(msg)
}

export const wsSubscribePost = (postId) => wsSend({ action: "subscribe", postId })
export const wsUnsubscribePost = (postId) => wsSend({ action: "unsubscribe", postId })
export const wsSendComment = ({ postId, text, fromUser }) =>
  wsSend({ action: "comment", postId, text, fromUser })

export const sendComment = (payload) => wsSend({ action: "comment", ...payload })

export const getComments = async (postId) => {
  const res = await authFetch(`${API}/comments?postId=${encodeURIComponent(postId)}`, {
    method: "GET",
  })
  if (!res.ok) throw new Error("Failed to load comments")
  return res.json()
}

// Notifications
export const getNotifications = async () => {
  const res = await authFetch(`${API}/notif`)
  if (!res.ok) throw new Error("Failed to load notifications")
  return res.json()
}

export const sendLike = async (postId, toUser) => {
  const res = await authFetch(`${API}/notif`, {
    method: "POST",
    body: JSON.stringify({ postId, toUser }),
  })
  if (!res.ok) throw new Error("Failed to like")
  return res.json()
}

export const checkLike = async (postId, username) => {
  const notifs = await getNotifications()
  const liked =
    Array.isArray(notifs) &&
    notifs.some((n) => (n.post_id ?? n.postId) === postId && (n.from_user ?? n.fromUser) === username)

  return { liked }
}
