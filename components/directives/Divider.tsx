import styles from '@/styles/Directives.module.css';

export default function Divider({ variant }: any) {
  const validVariants = ['dots', 'wave', 'gradient', 'fade'];
  const divVariant = variant && validVariants.includes(variant) ? variant : 'default';
  const variantClass = divVariant !== 'default'
    ? styles[`divider${divVariant.charAt(0).toUpperCase()}${divVariant.slice(1)}`]
    : '';

  return <hr className={`${styles.divider} ${variantClass}`} aria-hidden="true" />;
}
