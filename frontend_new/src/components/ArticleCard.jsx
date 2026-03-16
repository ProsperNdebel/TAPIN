import { Link } from 'react-router-dom'
import styles from './ArticleCard.module.css'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function ArticleCard({ article, featured = false, style }) {
  const { slug, title, excerpt, tags = [], readTime, publishedAt, imageUrl } = article

  return (
    <Link
      to={`/articles/${slug}`}
      className={`${styles.card} ${featured ? styles.featured : ''}`}
      style={style}
    >
      <div className={styles.image}>
        {imageUrl ? (
          <img src={imageUrl} alt="" loading="lazy" />
        ) : (
          <div className={styles.placeholder} aria-hidden="true">
            <div className={styles.placeholderInner}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="2" y="6" width="28" height="20" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="10" cy="13" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M2 22L10 16L16 20L22 14L30 22" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              <span className={styles.placeholderText}>Resource</span>
            </div>
          </div>
        )}
      </div>

      <div className={styles.body}>
        {tags.length > 0 && (
          <div className={styles.tags} aria-label="Tags">
            {tags.map(tag => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
        )}

        <h3 className={styles.title}>{title}</h3>
        <p className={styles.excerpt}>{excerpt}</p>

        <div className={styles.footer}>
          <div className={styles.meta}>
            <span className={styles.metaItem}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <rect x="1" y="2" width="11" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M4 1V3M9 1V3M1 5H12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              {formatDate(publishedAt)}
            </span>
            <span className={styles.metaItem}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M6.5 3.5V6.5L8.5 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              {readTime} min read
            </span>
          </div>
          <span className={styles.cardArrow} aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7H12M8 3L12 7L8 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}
