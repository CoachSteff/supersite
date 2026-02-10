import { notFound } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import { MapPin, Mail, Globe } from 'lucide-react';
import Avatar from '@/components/Avatar';
import { getPublicProfile } from '@/lib/users';
import { detectPlatform, sortLinks } from '@/lib/link-utils';
import styles from '@/styles/UserProfile.module.css';

interface PageProps {
  params: { username: string };
}

export default function UserProfilePage({ params }: PageProps) {
  const user = getPublicProfile(params.username);

  if (!user) {
    notFound();
  }

  const displayName = user.profile?.firstName
    ? `${user.profile.firstName}${user.profile.lastName ? ' ' + user.profile.lastName : ''}`
    : (user.username || 'Anonymous');

  // Use unified links array
  const sortedLinks = user.links ? sortLinks(user.links) : [];

  return (
    <div className={styles.influencerContainer}>
      <div className={styles.influencerContent}>
        <Avatar
          src={user.profile?.avatar}
          name={displayName}
          size={150}
          className={styles.largeAvatar}
        />

        <h1 className={styles.influencerName}>{displayName}</h1>
        
        {user.profile?.jobTitle && (
          <p className={styles.influencerTitle}>
            {user.profile.jobTitle}
          </p>
        )}

        {user.profile?.bio && (
          <p className={styles.influencerBio}>{user.profile.bio}</p>
        )}

        {(user.profile?.location || user.profile?.email) && (
          <div className={styles.profileDetails}>
            {user.profile?.location && (
              <span className={styles.profileDetail}>
                <MapPin size={16} />
                {user.profile.location}
              </span>
            )}
            {user.profile?.email && (
              <span className={styles.profileDetail}>
                <Mail size={16} />
                <a href={`mailto:${user.profile.email}`}>
                  {user.profile.email}
                </a>
              </span>
            )}
          </div>
        )}

        {sortedLinks.length > 0 && (
          <div className={styles.socialIcons}>
            {sortedLinks.map((link, index) => {
              const platformInfo = detectPlatform(link.url);
              const IconComponent = platformInfo?.icon 
                ? (LucideIcons as any)[platformInfo.icon] 
                : Globe;
              const label = link.label || platformInfo?.label || 'Link';

              return (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialIconButton}
                  aria-label={label}
                  title={label}
                >
                  <IconComponent size={20} />
                </a>
              );
            })}
          </div>
        )}

        <div className={styles.footer}>
          <p className={styles.joinDate}>
            Member since {new Date(user.metadata?.createdAt || new Date()).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
