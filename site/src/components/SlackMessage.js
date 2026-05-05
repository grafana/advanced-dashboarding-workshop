import React from 'react';
import styles from './SlackMessage.module.css';

/**
 * Renders a fake Slack message, useful for showing quotes in a realistic context.
 *
 * @param {string} name - Display name of the sender
 * @param {string} role - Role or team label shown next to the name
 * @param {string} time - Timestamp string, e.g. "Today at 9:41 AM"
 * @param {string} avatar - Single character shown in the avatar tile
 * @param {string} avatarColor - CSS gradient or color for the avatar background
 * @param {string[]} reactions - Emoji reaction strings to show below the message
 * @param {ReactNode} children - The message body
 */
export default function SlackMessage({
  name,
  role,
  time = 'Today at 9:41 AM',
  avatar,
  avatarColor = 'linear-gradient(135deg, #7C3AED, #4F46E5)',
  reactions = [],
  children,
}) {
  const initials = avatar ?? (name ? name[0].toUpperCase() : '?');

  return (
    <div className={styles.wrapper}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '6px',
          background: avatarColor,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '15px',
          fontWeight: 'bold',
          color: 'white',
        }}>{initials}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
            <span className={styles.name}>{name}</span>
            <span className={styles.meta}>{role ? `${role} · ` : ''}{time}</span>
          </div>
          <div className={styles.body}>
            {children}
          </div>
          {reactions.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
              {reactions.map((r, i) => (
                <div key={i} className={styles.reaction}>{r}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
