// frontend_new/src/pages/ArticlePage.jsx

import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { getArticle } from "../services/api";
import { MOCK_ARTICLES } from "../services/mockData";
import styles from "./ArticlePage.module.css";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ArticlePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (USE_MOCK) {
        // Use mock data
        const mockArticle = MOCK_ARTICLES.find((a) => a.slug === slug);
        setArticle(mockArticle);
        setLoading(false);
        return;
      }

      // Fetch from API
      try {
        const data = await getArticle(slug);
        setArticle(data);
      } catch (err) {
        console.error("Failed to fetch article:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  if (loading || authLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.loading}>Loading article...</div>
        </div>
      </main>
    );
  }

  if (!article) {
    return (
      <main className={styles.notFound}>
        <h1>Article not found</h1>
        <p>The article you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className={styles.back}>
          ← Back to home
        </Link>
      </main>
    );
  }

  // Check if user has access
  const hasAccess = user?.isSubscribed === true;
  // Show paywall if no access
  if (!hasAccess) {
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
          <Link to="/" className={styles.back}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to articles
          </Link>

          {/* Article Preview */}
          <article>
            <header className={styles.header}>
              {article.tags?.length > 0 && (
                <div className={styles.tags}>
                  {article.tags.map((t) => (
                    <span key={t} className={styles.tag}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <h1 className={styles.title}>{article.title}</h1>
              <div className={styles.meta}>
                <span>{formatDate(article.publishedAt || article.date)}</span>
                <span aria-hidden="true">·</span>
                <span>{article.readTime}</span>
              </div>
            </header>

            {article.imageUrl && (
              <div className={styles.heroImage}>
                <img src={article.imageUrl} alt="" />
              </div>
            )}

            <div className={styles.body}>
              <p>
                {article.excerpt ||
                  article.description?.substring(0, 200) + "..."}
              </p>
            </div>
          </article>

          {/* Paywall Overlay */}
          <div className={styles.paywallOverlay}>
            <div className={styles.paywallCard}>
              <div className={styles.lockIcon}>🔒</div>
              <h2>Premium Content</h2>
              <p className={styles.paywallDesc}>
                This article is available to schools and districts with a
                TrendWise subscription.
              </p>

              <ul className={styles.benefitsList}>
                <li>✅ Full access to all trend reports & insights</li>
                <li>✅ Weekly educator digest delivered Monday mornings</li>
                <li>✅ Downloadable resources for staff meetings</li>
                <li>✅ Priority support from our team</li>
              </ul>

              <button
                className={styles.contactBtn}
                onClick={() => navigate("/for-schools#plans")}
              >
                View Plans & Pricing
              </button>

              {user ? (
                <p className={styles.paywallNote}>
                  Your account doesn't have access yet. Choose a plan to get
                  started.
                </p>
              ) : (
                <p className={styles.paywallNote}>
                  Already have access?{" "}
                  <Link to="/?showSignIn=true">Sign in</Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Full article for subscribed users
  const {
    title,
    excerpt,
    description,
    tags,
    readTime,
    publishedAt,
    date,
    imageUrl,
    why_it_matters,
    how_to_talk_about_it,
  } = article;

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <Link to="/" className={styles.back}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to articles
        </Link>

        <article>
          <header className={styles.header}>
            {tags?.length > 0 && (
              <div className={styles.tags}>
                {tags.map((t) => (
                  <span key={t} className={styles.tag}>
                    {t}
                  </span>
                ))}
              </div>
            )}
            <h1 className={styles.title}>{title}</h1>
            <div className={styles.meta}>
              <span>{formatDate(publishedAt || date)}</span>
              <span aria-hidden="true">·</span>
              <span>{readTime}</span>
            </div>
          </header>

          {imageUrl && (
            <div className={styles.heroImage}>
              <img src={imageUrl} alt="" />
            </div>
          )}

          <div className={styles.body}>
            <p className={styles.excerpt}>{excerpt || description}</p>

            {why_it_matters && (
              <section className={styles.section}>
                <h2>Why It Matters</h2>
                <p>{why_it_matters}</p>
              </section>
            )}

            {how_to_talk_about_it && (
              <section className={styles.section}>
                <h2>How to Talk About It</h2>
                <p>{how_to_talk_about_it}</p>
              </section>
            )}

            {!why_it_matters && !how_to_talk_about_it && (
              <p className={styles.placeholder}>
                Full article content will be rendered here once connected to the
                Python backend. The API endpoint{" "}
                <code>GET /api/articles/{slug}</code> should return the complete
                article including its body.
              </p>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}
