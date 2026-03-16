import React, { Children } from 'react';
import styles from '@/styles/Directives.module.css';

type FormulaItem =
  | { kind: 'card'; node: React.ReactNode }
  | { kind: 'operator'; text: string };

export default function Formula({ children }: any) {
  const items: FormulaItem[] = [];

  Children.forEach(children, (child: any) => {
    const directive = child?.props?.['data-directive'];
    if (directive === 'formula-card') {
      items.push({ kind: 'card', node: child });
    } else if (child?.type === 'p' && child?.props?.children) {
      const text = typeof child.props.children === 'string'
        ? child.props.children.trim()
        : '';
      if (text) {
        items.push({ kind: 'operator', text });
      }
    }
  });

  return (
    <div className={styles.formula}>
      {items.map((item, i) =>
        item.kind === 'operator' ? (
          <div key={i} className={styles.formulaOperator}>
            <span>{item.text}</span>
          </div>
        ) : (
          <React.Fragment key={i}>{item.node}</React.Fragment>
        )
      )}
    </div>
  );
}
