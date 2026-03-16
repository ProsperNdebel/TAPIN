import styles from './ArticleCardSkeleton.module.css'

export default function ArticleCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={`${styles.image} skeleton`} />
      <div className={styles.body}>
        <div className={styles.tags}>
          <div className={`${styles.tag} skeleton`} />
          <div className={`${styles.tag} skeleton`} />
        </div>
        <div className={`${styles.title} skeleton`} />
        <div className={`${styles.titleLine2} skeleton`} />
        <div className={`${styles.excerpt} skeleton`} />
        <div className={`${styles.excerptLine2} skeleton`} />
        <div className={styles.meta}>
          <div className={`${styles.metaItem} skeleton`} />
          <div className={`${styles.metaItem} skeleton`} />
        </div>
      </div>
    </div>
  )
}
