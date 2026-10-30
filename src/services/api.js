import defaultPlaceImage from '../assets/hero.png'

const TOKEN_KEY = 'guiapc-token'
const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

async function request(path, options = {}) {
  const token = sessionStorage.getItem(TOKEN_KEY)
  const headers = new Headers(options.headers)

  if (options.body) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(body.error ?? `La solicitud falló (${response.status}).`)
    error.status = response.status
    throw error
  }
  return body
}

function saveSession({ token, user }) {
  sessionStorage.setItem(TOKEN_KEY, token)
  return user
}

export const apiService = {
  async getLugares() {
    const { places } = await request('/places')
    return places.map((place) => ({ ...place, image: place.image || defaultPlaceImage }))
  },

  async getEvents() {
    const { events } = await request('/events')
    return events
  },

  async register(credentials) {
    return saveSession(await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }))
  },

  async login(credentials) {
    return saveSession(await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }))
  },

  async getCurrentUser() {
    if (!sessionStorage.getItem(TOKEN_KEY)) return null
    try {
      const { user } = await request('/auth/me')
      return user
    } catch (error) {
      if (error.status === 401) sessionStorage.removeItem(TOKEN_KEY)
      throw error
    }
  },

  logout() {
    sessionStorage.removeItem(TOKEN_KEY)
  },

  async getMyPlaces() {
    const { places } = await request('/places/mine')
    return places
  },

  async getPendingPlaces() {
    const { places } = await request('/places/pending')
    return places
  },

  async getMyEvents() {
    const { events } = await request('/events/mine')
    return events
  },

  async getPendingEvents() {
    const { events } = await request('/events/pending')
    return events
  },

  async createEvent(event) {
    return request('/events', { method: 'POST', body: JSON.stringify(event) })
  },

  async updateEvent(id, event) {
    return request(`/events/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(event) })
  },

  async moderateEvent(id, status) {
    return request(`/events/${encodeURIComponent(id)}/moderation`, { method: 'PATCH', body: JSON.stringify({ status }) })
  },

  async toggleEventFeatured(id, isFeatured) {
    return request(`/events/${encodeURIComponent(id)}/featured`, { method: 'PATCH', body: JSON.stringify({ isFeatured }) })
  },

  async createPlace(place) {
    return request('/places', {
      method: 'POST',
      body: JSON.stringify(place),
    })
  },

  async updatePlace(id, place) {
    return request(`/places/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(place),
    })
  },

  async moderatePlace(id, status) {
    return request(`/places/${encodeURIComponent(id)}/moderation`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },

  async getUsers() {
    const { users } = await request('/admin/users')
    return users
  },

  async updateUserRole(id, role) {
    return request(`/admin/users/${encodeURIComponent(id)}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    })
  },

  async getPendingReviews() {
    const { reviews } = await request('/admin/reviews/pending')
    return reviews
  },

  async moderateReview(id, status) {
    return request(`/admin/reviews/${encodeURIComponent(id)}/moderation`, { method: 'PATCH', body: JSON.stringify({ status }) })
  },

  async togglePlaceFeatured(id, isFeatured) {
    return request(`/admin/places/${encodeURIComponent(id)}/featured`, { method: 'PATCH', body: JSON.stringify({ isFeatured }) })
  },

  async getFavorites() {
    const { favoriteIds } = await request('/favorites')
    return favoriteIds
  },

  async setFavorite(id, isFavorite) {
    return request(`/favorites/${encodeURIComponent(id)}`, { method: isFavorite ? 'PUT' : 'DELETE' })
  },

  async addReview(id, review) {
    return request(`/places/${encodeURIComponent(id)}/reviews`, { method: 'POST', body: JSON.stringify(review) })
  },
}
