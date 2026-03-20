// components/landing/LandingPage.tsx
import Link from 'next/link';
import { ArrowRight, Sparkles, LayoutGrid, MessageSquare, CheckCircle2 } from 'lucide-react';
import styles from './landing.module.css';

export default function LandingPage() {
  return (
    <main className={styles.container}>
      {/* Ambient background effects */}
      <div className={styles.ambientBg} />
      <div className={styles.ambientBlur1} />
      <div className={styles.ambientBlur2} />
      <div className={styles.ambientBlur3} />

      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Sparkles className={styles.logoIconSvg} />
          </div>
          <span className={styles.logoText}>AI Task Breakdown</span>
        </div>
        <div className={styles.navLinks}>
          <Link href="/login" className={styles.navLink}>
            Log In
          </Link>
          <Link href="/signup" className={styles.signupButton}>
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero section */}
      <section className={styles.hero}>
        <div className={styles.badge}>
          <Sparkles className={styles.badgeIcon} />
          AI-Powered Task Breakdown
        </div>
        <h1 className={styles.title}>
          Turn complex projects into{' '}
          <span className={styles.gradientText}>actionable tasks.</span>
        </h1>
        <p className={styles.description}>
          Describe your project or assignment in natural language, and let our LLM instantly decompose it into a structured, manageable workflow. Stop planning and start doing.
        </p>
        <div className={styles.ctaGroup}>
          <Link href="/signup" className={styles.primaryButton}>
            Start for free
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href="/main" className={styles.secondaryButton}>
            Try the Demo
          </Link>
        </div>
      </section>

      {/* Feature cards section */}
      <section className={styles.features}>
        <div className={styles.featuresGrid}>
          {/* Feature 1 */}
          <div className={styles.featureCard}>
            <div className={`${styles.featureIconWrapper} ${styles.featureIconWrapper1}`}>
              <MessageSquare className={styles.featureIcon} />
            </div>
            <h3 className={styles.featureTitle}>Conversational Edits</h3>
            <p className={styles.featureDescription}>
              Chat with your AI assistant to add, remove, or revise tasks on the fly without ever touching a form.
            </p>
          </div>

          {/* Feature 2 */}
          <div className={styles.featureCard}>
            <div className={`${styles.featureIconWrapper} ${styles.featureIconWrapper2}`}>
              <LayoutGrid className={styles.featureIcon} />
            </div>
            <h3 className={styles.featureTitle}>Dynamic Views</h3>
            <p className={styles.featureDescription}>
              Toggle instantly between structured List views and Kanban boards to visualize your workflow exactly how you want.
            </p>
          </div>

          {/* Feature 3 */}
          <div className={styles.featureCard}>
            <div className={`${styles.featureIconWrapper} ${styles.featureIconWrapper3}`}>
              <CheckCircle2 className={styles.featureIcon} />
            </div>
            <h3 className={styles.featureTitle}>Track & Export</h3>
            <p className={styles.featureDescription}>
              Track priority levels and time estimates. Export your entire generated task list to PDF or JSON for external use.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}