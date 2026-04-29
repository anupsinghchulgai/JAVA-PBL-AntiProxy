import React, { useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { api } from '../api';
import { useGeolocation } from '../hooks/useGeolocation';
import { styles } from '../styles';

export default function StudentScanner({ onBack }) {
  const [phase, setPhase] = useState('idle');
  const [scanned, setScanned] = useState(null);
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [result, setResult] = useState(null);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);

  const { getPosition } = useGeolocation();
  const videoRef = useRef(null);
  const readerRef = useRef(null);

  const startScanning = async () => {
    setPhase('scanning');
    setError(null);
    try {
      const sess = await api.getActiveSession();
      setSession(sess);
    } catch {
      setError('No active session found. Ask your teacher to start one first.');
      setPhase('error');
      return;
    }
    try {
      const reader = new BrowserQRCodeReader();
      readerRef.current = reader;
      await reader.decodeFromVideoDevice(undefined, videoRef.current, (res) => {
        if (res) handleQRResult(res.getText());
      });
    } catch (e) {
      setError('Camera access failed: ' + e.message);
      setPhase('error');
    }
  };

  const handleQRResult = async (raw) => {
    readerRef.current?.reset();
    try {
      const payload = JSON.parse(raw);
      if (!payload.token || !payload.sessionId) throw new Error('Invalid QR');
      try {
        await api.validateToken(payload.token);
      } catch {
        setError('QR code has expired! Please scan the latest code from the board.');
        setPhase('error');
        return;
      }
      setScanned(payload);
      setPhase('confirming');
    } catch {
      setError("Invalid QR code. Please scan the attendance QR from your teacher's screen.");
      setPhase('error');
    }
  };

  const submitAttendance = async () => {
    if (!studentId.trim() || !studentName.trim()) {
      setError('Please fill in both fields.');
      return;
    }
    setPhase('submitting');
    setError(null);
    try {
      const pos = await getPosition();
      const rec = await api.markAttendance({
        token: scanned.token,
        studentId: studentId.trim(),
        studentName: studentName.trim(),
        studentLat: pos.lat,
        studentLng: pos.lng,
      });
      setResult(rec);
      setPhase('success');
    } catch (e) {
      setError(e.message);
      setPhase('error');
    }
  };

  useEffect(() => () => readerRef.current?.reset(), []);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <button onClick={onBack} style={styles.backBtn}>
            ← Back
          </button>
          <span style={styles.logo}>📱 Mark Attendance</span>
        </div>
      </header>
      <div style={{ ...styles.content, alignItems: 'center', justifyContent: 'center', display: 'flex', minHeight: 'calc(100vh - 70px)' }}>
        {phase === 'idle' && (
          <div style={{ ...styles.card, ...styles.centreCard, animation: 'fadeUp 0.4s ease' }}>
            <div style={styles.bigIcon}>🔲</div>
            <h2 style={styles.cardTitle}>Scan QR Code</h2>
            <p style={styles.cardSub}>
              Point your camera at the QR code on your teacher&apos;s screen.
              <br />
              You must be within <strong style={{ color: 'var(--green)' }}>10 metres</strong> of the classroom.
            </p>
            <button className="btn-primary" onClick={startScanning}>
              📷 Open Camera
            </button>
          </div>
        )}
        {phase === 'scanning' && (
          <div style={{ ...styles.card, ...styles.centreCard, animation: 'fadeUp 0.4s ease' }}>
            <h2 style={{ ...styles.cardTitle, marginBottom: 16 }}>Point at QR Code</h2>
            <div style={styles.videoWrap}>
              <video ref={videoRef} style={styles.video} />
              {['tl', 'tr', 'bl', 'br'].map((c) => (
                <div key={c} style={{ ...styles.corner, ...styles[c] }} />
              ))}
              <div style={styles.scanLine} />
            </div>
            <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 12 }}>Align the QR within the frame</p>
            <button
              className="btn-secondary"
              onClick={() => {
                readerRef.current?.reset();
                setPhase('idle');
              }}
            >
              Cancel
            </button>
          </div>
        )}
        {phase === 'confirming' && (
          <div style={{ ...styles.card, ...styles.centreCard, animation: 'fadeUp 0.4s ease' }}>
            <div style={{ ...styles.bigIcon, fontSize: 36 }}>✅</div>
            <h2 style={styles.cardTitle}>QR Detected</h2>
            <p style={styles.cardSub}>Enter your details to confirm attendance.</p>
            {error && <div className="error-box">{error}</div>}
            <div className="form-group">
              <label>Roll Number / Student ID</label>
              <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="21CS045" autoFocus />
            </div>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Priya Sharma" />
            </div>
            <button className="btn-primary" onClick={submitAttendance}>
              📍 Submit Attendance
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                setScanned(null);
                setPhase('idle');
              }}
            >
              Rescan
            </button>
          </div>
        )}
        {phase === 'submitting' && (
          <div style={{ ...styles.card, ...styles.centreCard, textAlign: 'center', animation: 'fadeUp 0.4s ease' }}>
            <div className="spinner" />
            <h2 style={styles.cardTitle}>Verifying…</h2>
            <p style={styles.cardSub}>Getting GPS and validating with server.</p>
          </div>
        )}
        {phase === 'success' && (
          <div style={{ ...styles.card, ...styles.centreCard, textAlign: 'center', animation: 'fadeUp 0.4s ease' }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>🎉</div>
            <h2 style={{ ...styles.cardTitle, color: 'var(--green)' }}>Attendance Marked!</h2>
            <p style={styles.cardSub}>
              You&apos;re all set, <strong>{result?.studentName}</strong>.
            </p>
            <div style={styles.divider} />
            <div style={styles.infoGrid}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Subject</span>
                <span style={styles.infoVal}>{session?.subject}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Roll No.</span>
                <code style={styles.code}>{result?.studentId}</code>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Distance</span>
                <span style={{ ...styles.infoVal, color: 'var(--green)' }}>{result?.distanceMeters?.toFixed(1)}m</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Time</span>
                <span style={styles.infoVal}>{new Date(result?.markedAt).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        )}
        {phase === 'error' && (
          <div style={{ ...styles.card, ...styles.centreCard, textAlign: 'center', animation: 'fadeUp 0.4s ease' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>❌</div>
            <h2 style={styles.cardTitle}>Oops!</h2>
            <div className="error-box">{error}</div>
            <button
              className="btn-primary"
              onClick={() => {
                setError(null);
                setPhase('idle');
              }}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
