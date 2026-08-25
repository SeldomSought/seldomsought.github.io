import { INTRO_COPY } from '../../content/copy/intro'
import { HOW_IT_WORKS } from '../../content/copy/howItWorks'
import { DimensionsMap } from '../motifs/DimensionsMap'
import { Button, LinkButton } from '../shared/Button'
import { PrivacyList } from '../shared/PrivacyList'
import styles from './LandingPage.module.css'

export function LandingPage({ onBeginMapping }: { onBeginMapping: () => void }) {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={[styles.eyebrow, 'sc-eyebrow'].join(' ')}>{INTRO_COPY.eyebrow}</div>
        <h1 className={styles.wordmark}>{INTRO_COPY.wordmark}</h1>
        <p className={styles.tagline}>
          {INTRO_COPY.tagline.map((line, i) => (
            <span key={line}>
              {line}
              {i < INTRO_COPY.tagline.length - 1 && <br />}
            </span>
          ))}
        </p>

        <div className={styles.dimensionsBlock}>
          <div className={styles.dimensionsLabel}>Eight independent signals</div>
          <DimensionsMap />
        </div>

        <div className={styles.ctaRow}>
          <Button variant="primary" onClick={onBeginMapping}>Begin Mapping →</Button>
          <LinkButton variant="ghost" href="#how-it-works">How It Works</LinkButton>
          <LinkButton variant="ghost" href="#privacy">Privacy</LinkButton>
        </div>

        <p className={styles.consentNote}>{INTRO_COPY.consent}</p>
      </section>

      <section id="how-it-works" className={styles.howItWorks}>
        <div className={styles.sectionLabel}>How it works</div>
        <h2 className={styles.sectionTitle}>Not a personality quiz</h2>

        <div className={styles.howGrid}>
          {HOW_IT_WORKS.map((block) => (
            <div key={block.id} className={styles.howBlock}>
              <div className={styles.howLabel}>{block.label}</div>
              <p className={styles.howBody}>{block.body}</p>
            </div>
          ))}
        </div>

        <div className={styles.startRow}>
          <Button variant="primary" onClick={onBeginMapping}>Begin Mapping →</Button>
        </div>
      </section>

      <section id="privacy" className={styles.howItWorks}>
        <div className={styles.sectionLabel}>Privacy</div>
        <h2 className={styles.sectionTitle}>Where your answers actually go</h2>
        <PrivacyList />

        <div className={styles.startRow}>
          <Button variant="primary" onClick={onBeginMapping}>Begin Mapping →</Button>
        </div>
      </section>
    </main>
  )
}
