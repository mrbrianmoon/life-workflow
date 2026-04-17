import styles from './SeasonCards.module.css';

// seasons: array of { title, color, items[] }
export default function SeasonCards({ seasons }) {
  return (
    <div className={styles.grid}>
      {seasons.map(function (s) {
        return (
          <div
            key={s.title}
            className={styles.card}
            style={{ borderTopColor: s.color, '--dot-color': s.color }}
          >
            <h3 className={styles.cardTitle}>{s.title}</h3>
            <ul className={styles.list}>
              {s.items.map(function (item, idx) {
                return (
                  <li key={idx} className={styles.item}>{item}</li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
