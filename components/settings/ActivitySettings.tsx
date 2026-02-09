'use client';

import styles from '@/styles/SettingsForm.module.css';

interface ActivitySettingsProps {
  user: any;
}

export default function ActivitySettings({ user }: ActivitySettingsProps) {
  return (
    <div className={styles.form}>
      <h2 className={styles.title}>Activity & History</h2>
      <p className={styles.description}>View your account activity</p>

      <div className={styles.infoCard}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Account Created</span>
          <span className={styles.infoValue}>
            {new Date(user.metadata.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>

        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Last Login</span>
          <span className={styles.infoValue}>
            {new Date(user.metadata.lastLoginAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>

        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Email Verified</span>
          <span className={styles.infoValue}>
            {user.metadata.emailVerified ? 'Yes' : 'No'}
          </span>
        </div>

        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>User ID</span>
          <span className={styles.infoValue} style={{ fontFamily: 'monospace', fontSize: '0.9em' }}>
            {user.id}
          </span>
        </div>
      </div>

      <div className={styles.note}>
        <p>📊 More activity tracking features coming soon...</p>
      </div>
    </div>
  );
}
