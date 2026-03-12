import styles from '@/styles/Footer.module.css';

interface FooterProps {
  style?: 'full' | 'minimal' | 'centered' | 'none';
  copyrightName?: string;
  socialLinks?: { linkedin?: string; github?: string };
}

export default function Footer({ style = 'minimal', copyrightName = 'SuperSite', socialLinks }: FooterProps) {
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
                <p>&copy; {currentYear} {copyrightName}</p>
              </div>
              <div className={styles.footerSection}>
                <ul>
                  {socialLinks?.linkedin && <li><a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></li>}
                  {socialLinks?.github && <li><a href={socialLinks.github} target="_blank" rel="noopener noreferrer">GitHub</a></li>}
                  <li><a href="/contact">Contact</a></li>
                  <li><a href="/about">About</a></li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          <p>&copy; {currentYear} {copyrightName}</p>
        )}
      </div>
    </footer>
  );
}
