import styles from './SectionLabel.module.css';

export default function SectionLabel({ text, completed }) {
  return (
    <div className={`${styles.label} ${completed ? styles.completedLabel : ''}`}>
      {text}
    </div>
  );
}