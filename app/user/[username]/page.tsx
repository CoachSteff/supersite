import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Twitter, Linkedin, Github, Facebook, Instagram, Youtube, Globe, ExternalLink } from 'lucide-react';
import Avatar from '@/components/Avatar';
import { getPublicProfile } from '@/lib/users';
import styles from '@/styles/UserProfile.module.css';

interface PageProps {
  params: { username: string };
}

const socialIcons: Record<string, any> = {
  twitter: Twitter,
  linkedin: Linkedin,
  github: Github,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  website: Globe,
  blog: Globe,
};

export default function UserProfilePage({ params }: PageProps) {
  const user = getPublicProfile(params.username);

  if (!user) {
    notFound();
  }

  const displayName = user.profile.firstName
    ? `${user.profile.firstName}${user.profile.lastName ? ' ' + user.profile.lastName : ''}`
    : user.username;

  return (
    <div className={styles.container}>
      <div className={styles.profileCard}>
        <div className={styles.header}>
          <Avatar
            src={user.profile.avatar}
            name={displayName}
            size={120}
            className={styles.avatar}
          />
          <div className={styles.headerInfo}>
            <h1 className={styles.name}>{displayName}</h1>
            <p className={styles.username}>@{user.username}</p>
            {user.profile.jobTitle && (
              <p className={styles.jobTitle}>{user.profile.jobTitle}</p>
            )}
            {user.profile.organization && (
              <p className={styles.organization}>{user.profile.organization}</p>
            )}
          </div>
        </div>

        {user.profile.bio && (
          <div className={styles.bio}>
            <p>{user.profile.bio}</p>
          </div>
        )}

        {(Object.values(user.social).some(v => v) || user.social.custom?.length) && (
          <div className={styles.social}>
            <h2 className={styles.sectionTitle}>Connect</h2>
            <div className={styles.socialLinks}>
              {Object.entries(user.social).map(([platform, url]) => {
                if (!url || platform === 'custom') return null;
                const Icon = socialIcons[platform];
                return (
                  <a
                    key={platform}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    aria-label={platform}
                  >
                    <Icon size={20} />
                    <span>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                    <ExternalLink size={14} className={styles.externalIcon} />
                  </a>
                );
              })}
              {user.social.custom?.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  <Globe size={20} />
                  <span>{link.name}</span>
                  <ExternalLink size={14} className={styles.externalIcon} />
                </a>
              ))}
            </div>
          </div>
        )}

        <div className={styles.footer}>
          <p className={styles.joinDate}>
            Member since {new Date(user.metadata.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
