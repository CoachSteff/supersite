import { notFound } from 'next/navigation';
import { X as XIcon, Linkedin, Github, Globe } from 'lucide-react';
import Avatar from '@/components/Avatar';
import { getPublicProfile } from '@/lib/users';
import styles from '@/styles/UserProfile.module.css';

interface PageProps {
  params: { username: string };
}

const socialIcons: Record<string, any> = {
  x: XIcon,
  linkedin: Linkedin,
  github: Github,
  website: Globe,
};

const socialLabels: Record<string, string> = {
  x: 'X',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  website: 'Website',
};

export default function UserProfilePage({ params }: PageProps) {
  const user = getPublicProfile(params.username);

  if (!user) {
    notFound();
  }

  const displayName = user.profile.firstName
    ? `${user.profile.firstName}${user.profile.lastName ? ' ' + user.profile.lastName : ''}`
    : user.username;

  // Collect all social links
  const socialLinks = [];
  
  // Add predefined social links
  Object.entries(user.social || {}).forEach(([platform, url]) => {
    if (url && platform !== 'custom' && socialIcons[platform]) {
      socialLinks.push({
        platform,
        url: url as string,
        icon: socialIcons[platform],
        label: socialLabels[platform] || platform,
      });
    }
  });

  // Add custom links
  if (user.social?.custom) {
    user.social.custom.forEach((link) => {
      if (link.url) {
        socialLinks.push({
          platform: 'custom',
          url: link.url,
          icon: Globe,
          label: link.name,
        });
      }
    });
  }

  return (
    <div className={styles.influencerContainer}>
      <div className={styles.influencerContent}>
        <Avatar
          src={user.profile?.avatar}
          name={displayName}
          size={180}
          className={styles.largeAvatar}
        />

        <h1 className={styles.influencerName}>{displayName}</h1>
        <p className={styles.influencerUsername}>@{user.username}</p>

        {(user.profile?.jobTitle || user.profile?.organization) && (
          <div className={styles.influencerMeta}>
            {user.profile.jobTitle && (
              <span className={styles.jobTitle}>{user.profile.jobTitle}</span>
            )}
            {user.profile.jobTitle && user.profile.organization && (
              <span className={styles.separator}>•</span>
            )}
            {user.profile.organization && (
              <span className={styles.organization}>{user.profile.organization}</span>
            )}
          </div>
        )}

        {user.profile?.bio && (
          <p className={styles.influencerBio}>{user.profile.bio}</p>
        )}

        {socialLinks.length > 0 && (
          <div className={styles.socialIcons}>
            {socialLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialIconButton}
                  aria-label={link.label}
                  title={link.label}
                >
                  <Icon size={24} />
                </a>
              );
            })}
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
