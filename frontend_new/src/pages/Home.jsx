// frontend_new/src/pages/Home.jsx

import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ArticleCard from "../components/ArticleCard.jsx";
import ArticleCardSkeleton from "../components/ArticleCardSkeleton.jsx";
import FilterBar from "../components/FilterBar.jsx";
import NewsletterSignup from "../components/NewsletterSignup.jsx";
import { useArticles } from "../hooks/useArticles.js";
import { getWeeklyTrends, getCategories } from "../services/api.js";
import { MOCK_TRENDING, CATEGORIES, PLATFORMS } from "../services/mockData.js";
import styles from "./Home.module.css";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false"; // ← Check environment variable

const STATS = [
  { value: "200+", label: "Schools using Trendwise" },
  { value: "3×", label: "Weekly new articles" },
  { value: "50+", label: "Platforms covered" },
  { value: "100%", label: "Free for teachers" },
];

export default function Home() {
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState("All");
  const [platform, setPlatform] = useState("All");
  const [categories, setCategories] = useState(["All"]);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  const searchQuery = searchParams.get("search") || "";

  // Load categories (mock or real based on USE_MOCK)
  useEffect(() => {
    const fetchCategories = async () => {
      if (USE_MOCK) {
        // Use mock categories
        setCategories(CATEGORIES);
        return;
      }

      // Use real API
      try {
        const cats = await getCategories();
        setCategories(["All", ...cats.map((c) => c.name)]);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setCategories(CATEGORIES); // Fallback to mock
      }
    };

    fetchCategories();
  }, []);

  // Load trending articles (mock or real based on USE_MOCK)
  useEffect(() => {
    const fetchTrending = async () => {
      if (USE_MOCK) {
        // Use mock data
        await new Promise((r) => setTimeout(r, 400)); // Simulate network delay
        setTrendingArticles(MOCK_TRENDING);
        setTrendingLoading(false);
        return;
      }

      // Use real API
      try {
        setTrendingLoading(true);
        const trends = await getWeeklyTrends();

        const topTrends = trends
          .sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0))
          .slice(0, 3);

        setTrendingArticles(topTrends);
      } catch (err) {
        console.error("Failed to fetch trending:", err);
        setTrendingArticles(MOCK_TRENDING); // Fallback to mock
      } finally {
        setTrendingLoading(false);
      }
    };

    fetchTrending();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setCategory("All");
      setPlatform("All");
    }
  }, [searchQuery]);

  const { articles, loading, error } = useArticles({
    category: category === "All" ? "" : category,
    platform: platform === "All" ? "" : platform,
    search: searchQuery,
  });

  const isFiltered = category !== "All" || platform !== "All" || searchQuery;

  return (
    <main>
      {!isFiltered && (
        <>
          {/* ── Hero ── */}
          <section className={styles.hero} aria-labelledby="hero-heading">
            <div className={styles.heroInner}>
              <div className={styles.heroContent}>
                <div className={styles.heroBadge}>
                  <span className={styles.heroBadgeDot} aria-hidden="true" />
                  Trusted by educators
                </div>
                <h1 id="hero-heading" className={styles.heroTitle}>
                  Get the scoop without the scroll!
                  <br />
                </h1>
                <p className={styles.heroSubtitle}>
                  TrendWise keeps educators and parents informed about the
                  social media trends, slang, and apps circulating among
                  students — so you can have proactive conversations before
                  issues arise.
                </p>
                <div className={styles.heroCtas}>
                  <a href="#resources" className={styles.ctaPrimary}>
                    Browse resources
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 8H13M9 4L13 8L9 12"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                  <Link to="/for-schools" className={styles.ctaSecondary}>
                    School &amp; district plans
                  </Link>
                </div>
              </div>

              {/* Stats panel */}
              <div className={styles.statsPanel} aria-label="Key statistics">
                {STATS.map((s) => (
                  <div key={s.label} className={styles.statItem}>
                    <span className={styles.statValue}>{s.value}</span>
                    <span className={styles.statLabel}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Decorative bar */}
            <div className={styles.heroBorderBar} aria-hidden="true">
              {["TikTok", "Instagram", "Discord", "BeReal", "YouTube"].map(
                (t) => (
                  <span key={t} className={styles.heroBorderBarItem}>
                    {t}
                  </span>
                ),
              )}
            </div>
          </section>

          {/* ── How it works strip ── */}
          <section className={styles.howStrip} aria-label="How TrendWise works">
            <div className={styles.howInner}>
              {[
                {
                  icon: "📡",
                  title: "Trends monitored weekly",
                  desc: "We track whats circulating across TikTok, Instagram, Discord, and more.",
                },
                {
                  icon: "✍️",
                  title: "Written for educators",
                  desc: "Plain language, no jargon. Reviewed for school-appropriate accuracy.",
                },
                {
                  icon: "📬",
                  title: "Delivered every Monday",
                  desc: "A concise digest lands in your inbox, ready to share with colleagues or parents.",
                },
              ].map((item) => (
                <div key={item.title} className={styles.howItem}>
                  <span className={styles.howIcon} aria-hidden="true">
                    {item.icon}
                  </span>
                  <div>
                    <strong className={styles.howTitle}>{item.title}</strong>
                    <p className={styles.howDesc}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Trending ── USES MOCK OR REAL BASED ON ENV */}
          <section
            className={styles.section}
            aria-labelledby="trending-heading"
          >
            <div className={styles.sectionHeader}>
              <div>
                <div className={styles.sectionEyebrow}>Updated this week</div>
                <h2 id="trending-heading" className={styles.sectionTitle}>
                  Trending Now
                </h2>
              </div>
              <a href="#resources" className={styles.sectionLink}>
                View all resources →
              </a>
            </div>

            {trendingLoading ? (
              <div className={styles.grid}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <ArticleCardSkeleton key={i} />
                ))}
              </div>
            ) : trendingArticles.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No trending articles yet. Check back soon!</p>
              </div>
            ) : (
              <div className={styles.grid}>
                {trendingArticles.map((article, i) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    featured
                    style={{ animationDelay: `${i * 80}ms` }}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* ── Resources ── */}
      <div id="resources" className={styles.pageBody}>
        <section
          className={styles.filtersSection}
          aria-label="Filter resources"
        >
          <div className={styles.filtersHeader}>
            <h2 className={styles.filtersTitle}>
              {searchQuery
                ? `Search results for "${searchQuery}"`
                : isFiltered
                  ? "Filtered Resources"
                  : "All Resources"}
            </h2>
            <div className={styles.filtersGroup}>
              <FilterBar
                label="Category"
                options={categories}
                active={category}
                onChange={setCategory}
              />
              <FilterBar
                label="Platform"
                options={PLATFORMS}
                active={platform}
                onChange={setPlatform}
              />
            </div>
          </div>
        </section>

        {error && (
          <div className={styles.errorBanner} role="alert">
            <strong>Failed to load resources:</strong> {error}
          </div>
        )}

        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon} aria-hidden="true">
              🔍
            </span>
            <p>No resources found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {articles.map((article, i) => (
              <ArticleCard
                key={article.id}
                article={article}
                style={{ animationDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Newsletter ── */}
      {!isFiltered && (
        <section id="newsletter" className={styles.newsletterSection}>
          <NewsletterSignup />
        </section>
      )}
    </main>
  );
}
