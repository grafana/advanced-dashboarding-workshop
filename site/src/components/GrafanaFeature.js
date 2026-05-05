import React from 'react';

/**
 * Inline highlight for Grafana feature names (e.g. SQL Expressions, Transformations).
 *
 * @param {ReactNode} children - The feature name to display
 * @param {string} [href] - Optional link to Grafana documentation
 */
export default function GrafanaFeature({children, href}) {
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="grafana-feature"
        style={{textDecoration: 'none'}}
      >
        {children}
      </a>
    );
  }

  return <span className="grafana-feature">{children}</span>;
}
