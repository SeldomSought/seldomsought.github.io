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
        <div className={styles.introduction}>
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

        <div className={styles.ctaRow}>
          <Button variant="primary" onClick={onBeginMapping}>Begin Mapping →</Button>
          <LinkButton variant="ghost" href="?example=1">Explore an example ↗</LinkButton>
        </div>

        <p className={styles.consentNote}>Take it a region at a time. Your progress stays on this device, ready when you return.</p>
        <div className={styles.quietLinks}><a href="#how-it-works">How it works</a><a href="#privacy">Your privacy</a></div>
        </div>
        <div className={styles.chartPanel}>
          <div className={styles.chartIndex}><span>FIELD GUIDE / 01</span><span>THE WHOLE PICTURE</span></div>
        <div className={styles.dimensionsBlock}>
          <div className={styles.dimensionsLabel}>Eight independent signals</div>
          <DimensionsMap />
        </div>

          <p className={styles.chartCaption}>A map of independent signals.<br /><em>You bring the coordinates.</em></p>
        </div>
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
