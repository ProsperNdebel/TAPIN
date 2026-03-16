import styles from './About.module.css'

export default function About() {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <h1 className={styles.title}>About TrendWise</h1>
          <p className={styles.subtitle}>
            Bridging the gap between generations through plain-language explanations
            of youth culture, social media, and online trends.
          </p>
        </header>

        <section className={styles.section}>
          <h2>Our Mission</h2>
          <p>
            Young people live a significant part of their lives online — and the
            language, platforms, and trends they engage with can feel foreign to
            the adults who care for them. TrendWise exists to change that.
          </p>
          <p>
            We write clear, non-judgmental articles that help parents, teachers,
            and caregivers understand what their young people are talking about,
            watching, and doing online.
          </p>
        </section>

        <section className={styles.section}>
          <h2>What We Cover</h2>
          <div className={styles.pillars}>
            {[
              { icon: '💬', title: 'Slang', desc: 'Decode the latest Gen Z words and phrases so you can actually keep up in conversation.' },
              { icon: '📈', title: 'Trends', desc: 'Understand viral challenges, content formats, and cultural moments before they fade.' },
              { icon: '📱', title: 'Apps', desc: 'In-depth explainers of the platforms young people use and how they work.' },
              { icon: '🛡️', title: 'Safety', desc: 'Practical advice on protecting young people from online harms and bad actors.' },
            ].map(p => (
              <div key={p.title} className={styles.pillar}>
                <span className={styles.pillarIcon}>{p.icon}</span>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2>Our Approach</h2>
          <p>
            Every article on TrendWise is written in plain language — no jargon,
            no judgment. We respect young people's culture while helping adults
            engage with it thoughtfully and safely.
          </p>
        </section>
      </div>
    </main>
  )
}
