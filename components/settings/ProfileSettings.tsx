'use client';

import { useState, useRef } from 'react';
import { Upload, X, Plus } from 'lucide-react';
import Avatar from '../Avatar';
import styles from '@/styles/SettingsForm.module.css';

interface CustomSocialLink {
  name: string;
  url: string;
}

interface ProfileSettingsProps {
  user: any;
  onUpdate: (user: any) => void;
}

export default function ProfileSettings({ user, onUpdate }: ProfileSettingsProps) {
  const [formData, setFormData] = useState({
    firstName: user.profile.firstName || '',
    lastName: user.profile.lastName || '',
    jobTitle: user.profile.jobTitle || '',
    organization: user.profile.organization || '',
    bio: user.profile.bio || '',
    avatar: user.profile.avatar || '',
  });
  const [socialLinks, setSocialLinks] = useState(user.social || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: formData,
          social: socialLinks,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully');
      onUpdate(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.match(/^image\/(jpeg|png)$/)) {
      setError('Only JPG and PNG images are allowed');
      return;
    }

    try {
      setError('Processing image...');
      
      // Create image element to load the file
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = (event) => {
        img.src = event.target?.result as string;
      };
      
      img.onload = async () => {
        // Create canvas for image processing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setError('Failed to process image');
          return;
        }

        // Calculate crop dimensions (center square crop)
        const size = Math.min(img.width, img.height);
        const offsetX = (img.width - size) / 2;
        const offsetY = (img.height - size) / 2;

        // Start with a reasonable size and downscale if needed
        let targetSize = Math.min(size, 800);
        let quality = 0.9;
        let base64 = '';

        // Iteratively reduce size/quality until under 64KB
        while (quality > 0.1) {
          canvas.width = targetSize;
          canvas.height = targetSize;

          // Draw cropped square image
          ctx.clearRect(0, 0, targetSize, targetSize);
          ctx.drawImage(
            img,
            offsetX, offsetY, size, size,
            0, 0, targetSize, targetSize
          );

          // Convert to base64
          base64 = canvas.toDataURL('image/jpeg', quality);
          
          // Check size (base64 is ~4/3 the actual size, so multiply by 0.75)
          const sizeInBytes = (base64.length * 0.75);
          
          if (sizeInBytes <= 65536) {
            // Success! Under 64KB
            break;
          }

          // Try smaller size or lower quality
          if (targetSize > 200) {
            targetSize = Math.floor(targetSize * 0.9);
          } else {
            quality -= 0.1;
          }
        }

        setFormData({ ...formData, avatar: base64 });
        setError('');
      };

      img.onerror = () => {
        setError('Failed to load image');
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to upload image');
    }
  }

  function handleRemoveAvatar() {
    setFormData({ ...formData, avatar: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const displayName = formData.firstName || user.username;

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Profile Information</h2>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      <div className={styles.avatarSection}>
        <Avatar src={formData.avatar} name={displayName} size={100} />
        <div className={styles.avatarActions}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleAvatarUpload}
            className={styles.fileInput}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={styles.uploadButton}
          >
            <Upload size={16} />
            Upload Photo
          </button>
          {formData.avatar && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className={styles.removeButton}
            >
              <X size={16} />
              Remove
            </button>
          )}
          <p className={styles.hint}>JPG or PNG (auto-resized to square, max 64KB)</p>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            placeholder="John"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="lastName">Last Name</label>
          <input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            placeholder="Doe"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="jobTitle">Job Title</label>
        <input
          id="jobTitle"
          type="text"
          value={formData.jobTitle}
          onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
          placeholder="Software Engineer"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="organization">Organization</label>
        <input
          id="organization"
          type="text"
          value={formData.organization}
          onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
          placeholder="Company Name"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Tell us about yourself..."
          rows={4}
        />
      </div>

      <h3 className={styles.subtitle}>Social Links</h3>

      <div className={styles.grid}>
        {['x', 'linkedin', 'github', 'website'].map((platform) => (
          <div key={platform} className={styles.field}>
            <label htmlFor={platform}>
              {platform === 'x' ? 'X (Twitter)' : platform.charAt(0).toUpperCase() + platform.slice(1)}
            </label>
            <input
              id={platform}
              type="url"
              value={socialLinks[platform] || ''}
              onChange={(e) => setSocialLinks({ ...socialLinks, [platform]: e.target.value })}
              placeholder={`https://${platform === 'x' ? 'x' : platform}.com/...`}
            />
          </div>
        ))}
      </div>

      <div className={styles.customLinksSection}>
        <div className={styles.customLinksHeader}>
          <h3 className={styles.subtitle}>Custom Links</h3>
          <button
            type="button"
            onClick={() => {
              const custom = socialLinks.custom || [];
              setSocialLinks({
                ...socialLinks,
                custom: [...custom, { name: '', url: '' }]
              });
            }}
            className={styles.addButton}
          >
            <Plus size={16} />
            Add Link
          </button>
        </div>

        {socialLinks.custom?.map((link: CustomSocialLink, index: number) => (
          <div key={index} className={styles.customLink}>
            <div className={styles.field}>
              <input
                type="text"
                value={link.name}
                onChange={(e) => {
                  const custom = [...(socialLinks.custom || [])];
                  custom[index].name = e.target.value;
                  setSocialLinks({ ...socialLinks, custom });
                }}
                placeholder="Link name (e.g., YouTube)"
              />
            </div>
            <div className={styles.field}>
              <input
                type="url"
                value={link.url}
                onChange={(e) => {
                  const custom = [...(socialLinks.custom || [])];
                  custom[index].url = e.target.value;
                  setSocialLinks({ ...socialLinks, custom });
                }}
                placeholder="https://..."
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const custom = socialLinks.custom?.filter((_: any, i: number) => i !== index) || [];
                setSocialLinks({ ...socialLinks, custom });
              }}
              className={styles.removeCustomButton}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <button type="submit" disabled={loading} className={styles.submitButton}>
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}
