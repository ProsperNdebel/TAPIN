import { useParams, Link } from 'react-router-dom'
import { MOCK_ARTICLES } from '../services/mockData.js'
import styles from './ArticlePage.module.css'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function ArticlePage() {
  const { slug } = useParams()

  // In production this would call getArticle(slug) from the API
  const article = MOCK_ARTICLES.find(a => a.slug === slug)

  if (!article) {
    return (
      <main className={styles.notFound}>
        <h1>Article not found</h1>
        <p>The article you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className={styles.back}>← Back to home</Link>
      </main>
    )
  }

  const { title, excerpt, tags, readTime, publishedAt, imageUrl } = article

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <Link to="/" className={styles.back}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to articles
        </Link>

        <article>
          <header className={styles.header}>
            {tags.length > 0 && (
              <div className={styles.tags}>
                {tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
              </div>
            )}
            <h1 className={styles.title}>{title}</h1>
            <div className={styles.meta}>
              <span>{formatDate(publishedAt)}</span>
              <span aria-hidden="true">·</span>
              <span>{readTime} min read</span>
            </div>
          </header>

          {imageUrl && (
            <div className={styles.heroImage}>
              <img src={imageUrl} alt="" />
            </div>
          )}

          <div className={styles.body}>
            {/* Placeholder content — real content comes from the backend */}
            <p>{excerpt}</p>
            <p>
              Full article content will be rendered here once connected to the
              Python backend. The API endpoint <code>GET /api/articles/{slug}</code>{' '}
              should return the complete article including its body in HTML or
              Markdown format.
            </p>
          </div>
        </article>
      </div>
    </main>
  )
}
