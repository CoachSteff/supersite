import styles from '@/styles/Footer.module.css';

interface FooterProps {
  style?: 'full' | 'minimal' | 'centered' | 'none';
}

export default function Footer({ style = 'minimal' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  if (style === 'none') {
    return null;
  }

  const footerClasses = [
    styles.footer,
    styles[`footer-${style}`],
  ].filter(Boolean).join(' ');

  return (
    <footer className={footerClasses}>
      <div className={styles.container}>
        {style === 'full' ? (
          <>
            <div className={styles.footerGrid}>
              <div className={styles.footerSection}>
                <h4>SuperSite</h4>
                <p>Built with Next.js and AI</p>
              </div>
              <div className={styles.footerSection}>
                <h4>Links</h4>
                <ul>
                  <li><a href="/about">About</a></li>
                  <li><a href="/contact">Contact</a></li>
                </ul>
              </div>
              <div className={styles.footerSection}>
                <h4>Legal</h4>
                <ul>
                  <li><a href="/privacy">Privacy</a></li>
                  <li><a href="/terms">Terms</a></li>
                </ul>
              </div>
            </div>
            <div className={styles.copyright}>
              <p>&copy; {currentYear} SuperSite. All rights reserved.</p>
            </div>
          </>
        ) : (
          <p>&copy; {currentYear} SuperSite. All rights reserved.</p>
        )}
      </div>
    </footer>
  );
}
