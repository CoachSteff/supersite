import styles from '@/styles/Directives.module.css';

export default function YouTube({ id }: any) {
  if (!id) return null;

  return (
    <div className={styles.youtube}>
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
