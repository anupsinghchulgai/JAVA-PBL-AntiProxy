import React from 'react';
import { styles } from '../styles';

export default function RoleSelector({ onSelect }) {
  return (
    <div style={styles.roleWrap}>
      <div style={{ animation: 'fadeUp 0.5s ease', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🏫</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em' }}>
          Anti-Proxy Attendance
        </h1>
        <p style={{ color: 'var(--text2)', marginBottom: 40, fontSize: 15 }}>
          GPS-verified · Dynamic QR · 10-metre geofence
        </p>
        <div style={styles.roleGrid}>
          <button style={styles.roleBtn} onClick={() => onSelect('teacher')}>
            <span style={styles.roleBtnIcon}>🎓</span>
            <strong style={{ fontSize: 17, display: 'block', marginBottom: 4 }}>Teacher</strong>
            <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 400 }}>
              Start session &amp; display QR
            </span>
          </button>
          <button style={{ ...styles.roleBtn, ...styles.roleBtnStudent }} onClick={() => onSelect('student')}>
            <span style={styles.roleBtnIcon}>📱</span>
            <strong style={{ fontSize: 17, display: 'block', marginBottom: 4 }}>Student</strong>
            <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 400 }}>
              Scan QR &amp; mark attendance
            </span>
          </button>
        </div>
        <div style={styles.featureRow}>
          {['🔄 10s QR refresh', '📍 10m geofence', '🚫 No duplicates', '⚡ Live dashboard'].map((f) => (
            <span key={f} style={styles.featureChip}>
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
