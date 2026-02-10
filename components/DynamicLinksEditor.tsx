'use client';

import { useState, useEffect } from 'react';
import { Plus, X, GripVertical, ExternalLink, Globe } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { detectPlatform, isValidUrl, getFaviconUrl, reorderLinks } from '@/lib/link-utils';
import type { Link } from '@/lib/users';
import styles from '@/styles/DynamicLinksEditor.module.css';

interface DynamicLinksEditorProps {
  links: Link[];
  onChange: (links: Link[]) => void;
}

export default function DynamicLinksEditor({ links, onChange }: DynamicLinksEditorProps) {
  const [editingLinks, setEditingLinks] = useState<Link[]>(links);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    setEditingLinks(links);
    
    // Auto-detect platform info for links that don't have it
    const needsDetection = links.some(link => link.url && !link.platform);
    if (needsDetection) {
      const updatedLinks = links.map(link => {
        if (link.url && isValidUrl(link.url) && !link.platform) {
          const platformInfo = detectPlatform(link.url);
          if (platformInfo) {
            return {
              ...link,
              platform: platformInfo.platform,
              icon: platformInfo.icon,
              label: link.label || platformInfo.label,
            };
          }
        }
        return link;
      });
      
      if (JSON.stringify(updatedLinks) !== JSON.stringify(links)) {
        setEditingLinks(updatedLinks);
        onChange(updatedLinks);
      }
    }
  }, [links]);

  const handleAddLink = () => {
    const newLinks = [...editingLinks, {
      url: '',
      order: editingLinks.length,
    }];
    setEditingLinks(newLinks);
    onChange(newLinks);
  };

  const handleRemoveLink = (index: number) => {
    const newLinks = editingLinks
      .filter((_, i) => i !== index)
      .map((link, i) => ({ ...link, order: i }));
    setEditingLinks(newLinks);
    onChange(newLinks);
  };

  const handleUrlChange = (index: number, url: string) => {
    const newLinks = [...editingLinks];
    newLinks[index] = { ...newLinks[index], url };

    // Auto-detect platform
    if (url && isValidUrl(url)) {
      const platformInfo = detectPlatform(url);
      if (platformInfo) {
        newLinks[index].platform = platformInfo.platform;
        newLinks[index].icon = platformInfo.icon;
        if (!newLinks[index].label) {
          newLinks[index].label = platformInfo.label;
        }
      }
    }

    setEditingLinks(newLinks);
    onChange(newLinks);
  };

  const handleLabelChange = (index: number, label: string) => {
    const newLinks = [...editingLinks];
    newLinks[index] = { ...newLinks[index], label };
    setEditingLinks(newLinks);
    onChange(newLinks);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === toIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = reorderLinks(editingLinks, draggedIndex, toIndex);
    setEditingLinks(reordered);
    onChange(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const renderIcon = (link: Link) => {
    if (!link.url || !isValidUrl(link.url)) {
      return <Globe size={20} className={styles.icon} />;
    }

    // Try to use Lucide icon
    if (link.icon) {
      const IconComponent = (LucideIcons as any)[link.icon];
      if (IconComponent) {
        return <IconComponent size={20} className={styles.icon} />;
      }
    }

    // Fallback to favicon
    const faviconUrl = getFaviconUrl(link.url);
    if (faviconUrl) {
      return (
        <img 
          src={faviconUrl} 
          alt="" 
          className={styles.favicon}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove(styles.hidden);
          }}
        />
      );
    }

    return <Globe size={20} className={styles.icon} />;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Links</h3>
      </div>

      {editingLinks.length === 0 && (
        <div className={styles.empty}>
          <Globe size={32} className={styles.emptyIcon} />
          <p>No links yet. Add your first link to get started!</p>
        </div>
      )}

      <div className={styles.linksList}>
        {editingLinks.map((link, index) => (
          <div
            key={index}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`${styles.linkItem} ${
              draggedIndex === index ? styles.dragging : ''
            } ${dragOverIndex === index ? styles.dragOver : ''}`}
          >
            <div className={styles.dragHandle}>
              <GripVertical size={16} />
            </div>

            <div className={styles.iconPreview}>
              {renderIcon(link)}
              <Globe size={20} className={`${styles.icon} ${styles.hidden}`} />
            </div>

            <div className={styles.fields}>
              <div className={styles.field}>
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => handleUrlChange(index, e.target.value)}
                  placeholder="https://example.com"
                  className={styles.urlInput}
                />
              </div>
              <div className={styles.field}>
                <input
                  type="text"
                  value={link.label || ''}
                  onChange={(e) => handleLabelChange(index, e.target.value)}
                  placeholder={link.platform ? `Label (auto: ${link.platform})` : 'Label (optional)'}
                  className={styles.labelInput}
                />
              </div>
            </div>

            {link.url && isValidUrl(link.url) && (
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.previewLink}
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={16} />
              </a>
            )}

            <button
              type="button"
              onClick={() => handleRemoveLink(index)}
              className={styles.removeButton}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddLink}
        className={styles.addButton}
      >
        <Plus size={16} />
        Add Link
      </button>
    </div>
  );
}
