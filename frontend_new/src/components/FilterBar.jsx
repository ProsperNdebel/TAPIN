import styles from './FilterBar.module.css'

export default function FilterBar({ label, options, active, onChange }) {
  return (
    <div className={styles.group}>
      <span className={styles.label}>{label}</span>
      <div className={styles.pills} role="group" aria-label={label}>
        {options.map(option => (
          <button
            key={option}
            className={`${styles.pill} ${active === option ? styles.active : ''}`}
            onClick={() => onChange(option)}
            aria-pressed={active === option}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
