import React, { useCallback, useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { api } from '../api';
import { POLL_INTERVAL_MS, TOKEN_REFRESH_MS } from '../constants';
import { useGeolocation } from '../hooks/useGeolocation';
import { styles } from '../styles';

export default function TeacherDashboard({ onBack }) {
  const [teacherName, setTeacherName] = useState('');
  const [subject, setSubject] = useState('');
  const [session, setSession] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [countdown, setCountdown] = useState(10);
  const [attendance, setAttendance] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle');

  const { getPosition } = useGeolocation();
  const tokenTimerRef = useRef(null);
  const countdownRef = useRef(null);
  const pollTimerRef = useRef(null);
  const prevCountRef = useRef(0);

  const generateQR = useCallback(async (tokenVal, sessionId) => {
    const payload = JSON.stringify({ token: tokenVal, sessionId });
    const url = await QRCode.toDataURL(payload, {
      width: 260,
      margin: 2,
      color: { dark: '#0b0f1a', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    });
    setQrDataUrl(url);
  }, []);

  const refreshToken = useCallback(
    async (sessionId) => {
      try {
        const t = await api.generateToken(sessionId);
        setCountdown(10);
        await generateQR(t.token, sessionId);
      } catch (e) {
        console.error('Token refresh failed', e);
      }
    },
    [generateQR]
  );

  const pollAttendance = useCallback(async (sessionId) => {
    try {
      const data = await api.getAttendance(sessionId);
      const records = data.records || [];
      setAttendance(records);
      if (records.length > prevCountRef.current) {
        const latest = records[records.length - 1];
        setToast(latest);
        setTimeout(() => setToast(null), 3500);
      }
      prevCountRef.current = records.length;
    } catch {}
  }, []);

  const startSession = useCallback(async () => {
    if (!teacherName.trim() || !subject.trim()) {
      setError('Please enter your name and subject.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const pos = await getPosition();
      const sess = await api.createSession({
        teacherName: teacherName.trim(),
        subject: subject.trim(),
        teacherLat: pos.lat,
        teacherLng: pos.lng,
      });
      setSession(sess);
      setStatus('active');
      await refreshToken(sess.sessionId);
      tokenTimerRef.current = setInterval(() => refreshToken(sess.sessionId), TOKEN_REFRESH_MS);
      countdownRef.current = setInterval(() => setCountdown((c) => (c <= 1 ? 10 : c - 1)), 1000);
      pollTimerRef.current = setInterval(() => pollAttendance(sess.sessionId), POLL_INTERVAL_MS);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [teacherName, subject, getPosition, refreshToken, pollAttendance]);

  const stopSession = () => {
    [tokenTimerRef, countdownRef, pollTimerRef].forEach((r) => clearInterval(r.current));
    setStatus('ended');
    setQrDataUrl(null);
  };

  useEffect(() => () => [tokenTimerRef, countdownRef, pollTimerRef].forEach((r) => clearInterval(r.current)), []);

  const R = 18;
  const CIRC = 2 * Math.PI * R;
  const dash = (countdown / 10) * CIRC;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <button onClick={onBack} style={styles.backBtn}>
            ← Back
          </button>
          <span style={styles.logo}>🎓 Anti-Proxy Attendance</span>
        </div>
        {session && status === 'active' && (
          <div style={styles.sessionPill}>
            <span style={styles.liveDot} />
            {session.subject} · {session.teacherName}
          </div>
        )}
      </header>
      <div style={styles.content}>
        {status === 'idle' && (
          <div style={{ ...styles.card, maxWidth: 460, margin: '0 auto', animation: 'fadeUp 0.4s ease' }}>
            <h2 style={styles.cardTitle}>Start Session</h2>
            <p style={styles.cardSub}>
              Your GPS location is captured as the classroom anchor. Students must be within{' '}
              <strong style={{ color: 'var(--green)' }}>10 metres</strong> to mark attendance.
            </p>
            <div style={styles.divider} />
            <div className="form-group">
              <label>Teacher Name</label>
              <input type="text" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} placeholder="Dr. Ramesh Kumar" />
            </div>
            <div className="form-group">
              <label>Subject / Course</label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Data Structures — CS301" />
            </div>
            {error && <div className="error-box">{error}</div>}
            <button className="btn-primary" onClick={startSession} disabled={loading}>
              {loading ? '📡 Getting GPS location…' : '📍 Start Attendance Session'}
            </button>
          </div>
        )}
        {status === 'active' && (
          <div style={styles.activeGrid}>
            <div style={{ ...styles.card, ...styles.qrCard, animation: 'fadeUp 0.35s ease' }}>
              <div style={styles.qrHeader}>
                <h2 style={styles.cardTitle}>Live QR Code</h2>
                <svg width="48" height="48" viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r={R} fill="none" stroke="var(--border)" strokeWidth="3.5" />
                  <circle
                    cx="22"
                    cy="22"
                    r={R}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${CIRC}`}
                    transform="rotate(-90 22 22)"
                    style={{ transition: 'stroke-dasharray 0.9s linear' }}
                  />
                  <text x="22" y="26.5" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--accent)" fontFamily="JetBrains Mono, monospace">
                    {countdown}s
                  </text>
                </svg>
              </div>
              <div style={styles.qrFrame}>
                {qrDataUrl ? <img src={qrDataUrl} alt="QR Code" style={styles.qrImg} /> : <div style={styles.qrPlaceholder}><div className="spinner" /></div>}
              </div>
              <p style={styles.qrHint}>Refreshes every 10 s · screenshots rejected</p>
              <div style={styles.infoGrid}>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Subject</span>
                  <span style={styles.infoVal}>{session?.subject}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Session ID</span>
                  <code style={styles.code}>{session?.sessionId}</code>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Radius</span>
                  <span style={{ ...styles.infoVal, color: 'var(--green)' }}>10 m strict</span>
                </div>
              </div>
              <button className="btn-danger" onClick={stopSession}>
                ⏹ End Session
              </button>
            </div>
            <div style={{ ...styles.card, ...styles.attendCard, animation: 'fadeUp 0.45s ease' }}>
              <div style={styles.attendHeader}>
                <h2 style={styles.cardTitle}>Live Attendance</h2>
                <span style={styles.countBadge}>{attendance.length} present</span>
              </div>
              {attendance.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>📋</div>
                  <p style={{ color: 'var(--text2)', fontSize: 14 }}>Waiting for students to scan…</p>
                </div>
              ) : (
                <ul style={styles.attendList}>
                  {[...attendance].reverse().map((rec) => (
                    <li key={rec.studentId} style={styles.attendItem}>
                      <div style={styles.avatar}>{rec.studentName.charAt(0).toUpperCase()}</div>
                      <div style={styles.studentInfo}>
                        <strong style={{ fontSize: 14, color: 'var(--text)' }}>{rec.studentName}</strong>
                        <span style={{ fontSize: 12, color: 'var(--text2)' }}>{rec.studentId}</span>
                      </div>
                      <div style={styles.studentMeta}>
                        <span style={styles.distBadge}>📍 {rec.distanceMeters.toFixed(1)}m</span>
                        <span style={styles.timeBadge}>{new Date(rec.markedAt).toLocaleTimeString()}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
        {status === 'ended' && (
          <div style={{ ...styles.card, maxWidth: 520, margin: '0 auto', animation: 'fadeUp 0.4s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <h2 style={styles.cardTitle}>Session Ended</h2>
              <p style={{ color: 'var(--text2)', fontSize: 14 }}>
                <strong style={{ color: 'var(--green)' }}>{attendance.length}</strong> students present for <strong>{session?.subject}</strong>
              </p>
            </div>
            <div style={styles.divider} />
            <ul style={styles.finalList}>
              {attendance.map((r, i) => (
                <li key={r.studentId} style={styles.finalItem}>
                  <span style={styles.finalNum}>{i + 1}</span>
                  <span style={{ flex: 1 }}>{r.studentName}</span>
                  <code style={styles.code}>{r.studentId}</code>
                  <span style={styles.distBadge}>{r.distanceMeters.toFixed(1)}m</span>
                </li>
              ))}
            </ul>
            <button
              className="btn-primary"
              style={{ marginTop: 20 }}
              onClick={() => {
                setStatus('idle');
                setSession(null);
                setAttendance([]);
                prevCountRef.current = 0;
              }}
            >
              + New Session
            </button>
          </div>
        )}
      </div>
      {toast && (
        <div style={styles.toast}>
          <span style={{ fontSize: 20 }}>✅</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{toast.studentName}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>
              {toast.studentId} · {toast.distanceMeters.toFixed(1)}m away
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
