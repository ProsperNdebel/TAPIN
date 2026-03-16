/**
 * API service for communicating with the Python backend.
 * All requests go through /api — proxied to localhost:8000 in dev via vite.config.js
 */

const BASE_URL = '/api'

/**
 * Generic fetch wrapper with error handling.
 * @param {string} endpoint
 * @param {RequestInit} options
 * @returns {Promise<any>}
 */
async function request(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || `HTTP ${response.status}`)
  }

  return response.json()
}

// ─── Articles ──────────────────────────────────────────────────────────────

/**
 * Fetch paginated articles with optional filters.
 * @param {{ category?: string, platform?: string, search?: string, page?: number, limit?: number }} params
 */
export function getArticles(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
  ).toString()
  return request(`/articles${query ? `?${query}` : ''}`)
}

/**
 * Fetch a single article by slug.
 * @param {string} slug
 */
export function getArticle(slug) {
  return request(`/articles/${slug}`)
}

/**
 * Fetch trending articles (top N).
 * @param {number} limit
 */
export function getTrendingArticles(limit = 3) {
  return request(`/articles/trending?limit=${limit}`)
}

// ─── Search ─────────────────────────────────────────────────────────────────

/**
 * Full-text search across articles.
 * @param {string} query
 */
export function searchArticles(query) {
  return request(`/search?q=${encodeURIComponent(query)}`)
}

// ─── Categories & Platforms ─────────────────────────────────────────────────

export function getCategories() {
  return request('/categories')
}

export function getPlatforms() {
  return request('/platforms')
}
