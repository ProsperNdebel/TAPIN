// frontend_new/src/services/api.js

import axios from "axios";

// Base URL configuration
let API_URL = import.meta.env.DEV
  ? "http://localhost:8000"
  : import.meta.env.VITE_API_URL;

API_URL = `${API_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================================
// TRENDS / ARTICLES
// ============================================================================

/**
 * Get all trends/articles with filters (no pagination for now)
 */
export const getArticles = async ({ category, search } = {}) => {
  const params = new URLSearchParams();

  if (category && category !== "All") params.append("category", category);
  if (search) params.append("search", search);

  const queryString = params.toString();
  const endpoint = queryString ? `/trends?${queryString}` : "/trends";

  const { data } = await api.get(endpoint);
  return data.trends || [];
};

/**
 * Get weekly trends (for homepage "Trending Now")
 */
export const getWeeklyTrends = async () => {
  const { data } = await api.get("/trends/weekly");
  return data.trends || [];
};

/**
 * Get trending articles (alias for compatibility)
 */
export const getTrendingArticles = async (limit = 3) => {
  const { data } = await api.get("/trends/weekly");
  return (data.trends || []).slice(0, limit);
};

/**
 * Get single trend/article by ID
 */
export const getArticle = async (id) => {
  const { data } = await api.get(`/trends/${id}`);
  return data;
};

export const getTrendById = async (id) => {
  const { data } = await api.get(`/trends/${id}`);
  return data;
};

/**
 * Get trends by category
 */
export const getTrendsByCategory = async (category) => {
  const { data } = await api.get(`/trends/category/${category}`);
  return data.trends || [];
};

/**
 * Search articles
 */
export const searchArticles = async (query) => {
  const { data } = await api.get(`/trends?search=${encodeURIComponent(query)}`);
  return data.trends || [];
};

// ============================================================================
// CATEGORIES & PLATFORMS
// ============================================================================

export const getCategories = async () => {
  const { data } = await api.get("/categories");
  return data.categories || [];
};

export const getPlatforms = async () => {
  // Static list for now
  return [
    "TikTok",
    "Instagram",
    "Reddit",
    "YouTube",
    "Discord",
    "BeReal",
    "Twitter",
  ];
};

// ============================================================================
// ARCHIVE.
// ============================================================================

export const getArchive = async (page = 1, limit = 10) => {
  const { data } = await api.get(`/trends/archive?page=${page}&limit=${limit}`);
  return data.trends || [];
};

export const getArchiveWeek = async (weekStart) => {
  const { data } = await api.get(`/trends/archive/${weekStart}`);
  return data.trends || [];
};

// ============================================================================
// EMAIL SUBSCRIPTION
// ============================================================================

export const subscribeToEmail = async (email) => {
  const { data } = await api.post("/email/subscribe", {
    email,
    subscribe: true,
  });
  return data;
};

export const getEmailSubscriptionStatus = async (email) => {
  const { data } = await api.get(`/email/subscription-status/${email}`);
  return data;
};

export const unsubscribeFromEmail = async (email) => {
  const { data } = await api.post("/email/subscribe", {
    email,
    subscribe: false,
  });
  return data;
};

// ============================================================================
// STRIPE / PAYMENTS
// ============================================================================

export const createCheckoutSession = async (uid) => {
  const { data } = await api.post("/create-checkout-session", { uid });
  return data;
};

// ============================================================================
// ADMIN - SCRAPERS
// ============================================================================

export const getAllScrapers = async (token) => {
  const { data } = await api.get("/admin/scrapers", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const createScraper = async (scraperData, token) => {
  const { data } = await api.post("/admin/scrapers", scraperData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const updateScraper = async (id, scraperData, token) => {
  const { data } = await api.put(`/admin/scrapers/${id}`, scraperData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const deleteScraper = async (id, token) => {
  const { data } = await api.delete(`/admin/scrapers/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const toggleScraper = async (id, token) => {
  const { data } = await api.post(
    `/admin/scrapers/${id}/toggle`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return data;
};

export const testScraper = async (id, token) => {
  const { data } = await api.post(
    `/admin/scrapers/test/${id}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return data;
};

// ============================================================================
// ADMIN - TRENDS
// ============================================================================

export const createTrend = async (trendData, token) => {
  const { data } = await api.post("/admin/trends", trendData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export { api };
export default api;
