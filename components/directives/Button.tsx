import styles from '@/styles/Directives.module.css';

export default function Button({ href, label, variant }: any) {
  const validVariants = ['primary', 'secondary', 'outline'];
  const btnVariant = variant && validVariants.includes(variant) ? variant : 'primary';
  const variantClass = styles[`button${btnVariant.charAt(0).toUpperCase()}${btnVariant.slice(1)}`];

  return (
    <a
      href={href || '#'}
      className={`${styles.button} ${variantClass || ''}`}
      role="button"
    >
      {label || 'Click here'}
    </a>
  );
}
