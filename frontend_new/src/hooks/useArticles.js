// frontend_new/src/hooks/useArticles.js

import { useState, useEffect, useCallback } from "react";
import { getArticles } from "../services/api";
import { MOCK_ARTICLES } from "../services/mockData";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

/**
 * Hook to fetch articles/trends with filters.
 * Falls back to mock data when VITE_USE_MOCK is not 'false'.
 */
export function useArticles({
  category = "",
  platform = "",
  search = "",
  page = 1,
  limit = 20,
} = {}) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (USE_MOCK) {
        // Simulate network delay in development
        await new Promise((r) => setTimeout(r, 400));

        let data = [...MOCK_ARTICLES];

        // Apply filters to mock data
        if (category && category !== "All") {
          data = data.filter((a) => a.category === category);
        }
        if (platform && platform !== "All") {
          data = data.filter((a) => a.platform === platform);
        }
        if (search) {
          data = data.filter(
            (a) =>
              a.title.toLowerCase().includes(search.toLowerCase()) ||
              a.excerpt?.toLowerCase().includes(search.toLowerCase()) ||
              a.description?.toLowerCase().includes(search.toLowerCase()),
          );
        }

        setArticles(data);
      } else {
        // Fetch from real backend
        const trends = await getArticles({
          category,
          platform,
          search,
          page,
          limit,
        });

        // Transform backend data to frontend article format
        const transformed = trends.map((trend) => ({
          id: trend.id,
          slug: trend.id,
          title: trend.title,
          description: trend.description,
          excerpt: trend.description?.substring(0, 150) + "...",
          category: trend.category?.name || "General",
          platform: extractPlatform(trend.sources),
          date: formatDate(trend.created_at),
          readTime: estimateReadTime(trend.description),
          imageUrl: getCategoryImage(trend.category?.name),

          // Additional fields from backend
          whyItMatters: trend.why_it_matters,
          howToTalkAboutIt: trend.how_to_talk_about_it,
          sources: trend.sources?.split(", ").filter(Boolean) || [],
          relevanceScore: trend.relevance_score,
          weekStart: trend.week_start,
          weekEnd: trend.week_end,
        }));

        setArticles(transformed);
      }
    } catch (err) {
      console.error("Failed to fetch articles:", err);
      setError(err.message || "Failed to load articles");
    } finally {
      setLoading(false);
    }
  }, [category, platform, search, page, limit]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return { articles, loading, error, refetch: fetchArticles };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract primary platform from sources string
 */
function extractPlatform(sources) {
  if (!sources) return "Multiple";

  const sourceStr = sources.toLowerCase();

  if (sourceStr.includes("tiktok")) return "TikTok";
  if (sourceStr.includes("instagram")) return "Instagram";
  if (sourceStr.includes("reddit")) return "Reddit";
  if (sourceStr.includes("twitter") || sourceStr.includes("x.com"))
    return "Twitter";
  if (sourceStr.includes("youtube")) return "YouTube";
  if (sourceStr.includes("discord")) return "Discord";
  if (sourceStr.includes("bereal")) return "BeReal";
  if (sourceStr.includes("snapchat")) return "Snapchat";

  return "Multiple";
}

/**
 * Format date string to human-readable format
 */
function formatDate(dateString) {
  if (!dateString) return "Recently";

  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Estimate read time based on word count
 */
function estimateReadTime(text) {
  if (!text) return "5 min read";

  const words = text.split(/\s+/).length;
  const minutes = Math.ceil(words / 200); // Average reading speed: 200 words/min

  return `${minutes} min read`;
}

/**
 * Get category-specific image URL
 */
function getCategoryImage(category) {
  const images = {
    Slang: "/images/slang.jpg",
    "Social Media": "/images/social-media.jpg",
    Gaming: "/images/gaming.jpg",
    Music: "/images/music.jpg",
    Fashion: "/images/fashion.jpg",
    Technology: "/images/tech.jpg",
    News: "/images/news.jpg",
    "Mental Health": "/images/mental-health.jpg",
    Politics: "/images/politics.jpg",
  };

  return images[category] || "/images/default.jpg";
}
