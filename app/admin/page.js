'use client';

import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { ref, onValue, set } from 'firebase/database';
import { QUESTIONS } from '../../lib/questions';

export default function AdminPage() {
  const [gameActive, setGameActive] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthed, setIsAdminAuthed] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [showTopThreeOnly, setShowTopThreeOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const gameActiveRef = ref(db, 'gameActive');
    const submissionsRef = ref(db, 'submissions');

    const unsubActive = onValue(gameActiveRef, (snapshot) => {
      setGameActive(snapshot.val() === true);
      setLoading(false);
    });

    const unsubSubs = onValue(submissionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const subsArray = Object.values(data);
        setSubmissions(subsArray);
      } else {
        setSubmissions([]);
      }
    });

    return () => {
      unsubActive();
      unsubSubs();
    };
  }, []);

  const toggleGameActive = async () => {
    const gameActiveRef = ref(db, 'gameActive');
    await set(gameActiveRef, !gameActive);
  };

  const clearSubmissions = async () => {
    if (confirm('Are you sure? This cannot be undone.')) {
      const submissionsRef = ref(db, 'submissions');
      await set(submissionsRef, null);
    }
  };

  const getRankedSubmissions = () => {
    const sorted = [...submissions].sort((a, b) => b.score - a.score);
    return showTopThreeOnly ? sorted.slice(0, 3) : sorted;
  };

  const handleLogin = () => {
    if (adminPassword === 'holiday2024') {
      setIsAdminAuthed(true);
    } else {
      alert('Wrong password');
    }
  };

  const Snowflake = ({ size = 20, color = "#3b82c4" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2v20" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M2 12h20" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M4.93 4.93l14.14 14.14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M19.07 4.93L4.93 19.07" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 6l-2-2M12 6l2-2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 18l-2 2M12 18l2 2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M6 12l-2-2M6 12l-2 2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M18 12l2-2M18 12l2 2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="2.5" fill={color}/>
    </svg>
  );

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #f0f7ff 0%, #e8f4fd 50%, #f8fafc 100%)',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#1e3a5f'
    },
    inner: {
      maxWidth: '900px',
      margin: '0 auto'
    },
    titleRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '32px'
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#1e3a5f',
      letterSpacing: '-0.5px'
    },
    loginContainer: {
      maxWidth: '320px',
      margin: '120px auto',
      textAlign: 'center'
    },
    loginCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '32px',
      boxShadow: '0 1px 3px rgba(30, 58, 95, 0.08)',
      border: '1px solid #e2e8f0'
    },
    loginTitle: {
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '24px',
      color: '#1e3a5f'
    },
    input: {
      padding: '12px 14px',
      fontSize: '16px',
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      width: '100%',
      marginBottom: '12px',
      outline: 'none',
      backgroundColor: '#fafcff'
    },
    primaryButton: {
      padding: '12px 24px',
      fontSize: '15px',
      fontWeight: '500',
      backgroundColor: '#3b82c4',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      width: '100%'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(30, 58, 95, 0.08)',
      border: '1px solid #e2e8f0',
      marginBottom: '20px'
    },
    sectionTitle: {
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: '#64748b',
      marginBottom: '16px'
    },
    gameButton: {
      padding: '14px 32px',
      fontSize: '15px',
      fontWeight: '600',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer'
    },
    startButton: {
      backgroundColor: '#3b82c4',
      color: 'white'
    },
    stopButton: {
      backgroundColor: '#64748b',
      color: 'white'
    },
    statusBadge: {
      display: 'inline-block',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '500',
      marginLeft: '16px'
    },
    statusActive: {
      backgroundColor: '#dbeafe',
      color: '#1e40af'
    },
    statusStopped: {
      backgroundColor: '#f1f5f9',
      color: '#64748b'
    },
    statNumber: {
      fontSize: '36px',
      fontWeight: '600',
      color: '#1e3a5f'
    },
    statLabel: {
      fontSize: '14px',
      color: '#64748b',
      marginTop: '4px'
    },
    secondaryButton: {
      padding: '8px 16px',
      fontSize: '13px',
      fontWeight: '500',
      backgroundColor: '#f8fafc',
      color: '#1e3a5f',
      border: '1px solid #cbd5e1',
      borderRadius: '6px',
      cursor: 'pointer',
      marginBottom: '16px'
    },
    secondaryButtonActive: {
      backgroundColor: '#3b82c4',
      color: 'white',
      border: '1px solid #3b82c4'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      textAlign: 'left',
      padding: '10px 12px',
      fontSize: '11px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: '#64748b',
      borderBottom: '1px solid #e2e8f0'
    },
    td: {
      padding: '12px',
      fontSize: '14px',
      borderBottom: '1px solid #f1f5f9'
    },
    rankCell: {
      width: '50px'
    },
    rank: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '24px',
      height: '24px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '600'
    },
    rankGold: {
      backgroundColor: '#fef3c7',
      color: '#92400e'
    },
    rankSilver: {
      backgroundColor: '#e2e8f0',
      color: '#475569'
    },
    rankBronze: {
      backgroundColor: '#fed7aa',
      color: '#9a3412'
    },
    rankNormal: {
      backgroundColor: '#f1f5f9',
      color: '#64748b'
    },
    dangerCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(30, 58, 95, 0.08)',
      border: '1px solid #fecaca',
      marginBottom: '20px'
    },
    dangerButton: {
      padding: '10px 20px',
      fontSize: '13px',
      fontWeight: '500',
      backgroundColor: 'white',
      color: '#dc2626',
      border: '1px solid #fecaca',
      borderRadius: '6px',
      cursor: 'pointer'
    },
    muted: {
      fontSize: '13px',
      color: '#94a3b8',
      marginTop: '8px'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.inner}>
          <p style={{ textAlign: 'center', marginTop: '120px', color: '#64748b' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Admin login screen
  if (!isAdminAuthed) {
    return (
      <div style={styles.container}>
        <div style={styles.loginContainer}>
          <div style={{ marginBottom: '24px' }}>
            <Snowflake size={28} />
          </div>
          <div style={styles.loginCard}>
            <h1 style={styles.loginTitle}>Admin Login</h1>
            <input
              type="password"
              placeholder="Password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLogin();
              }}
              style={styles.input}
            />
            <button onClick={handleLogin} style={styles.primaryButton}>
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin dashboard
  const ranked = getRankedSubmissions();

  const getRankStyle = (index) => {
    if (index === 0) return { ...styles.rank, ...styles.rankGold };
    if (index === 1) return { ...styles.rank, ...styles.rankSilver };
    if (index === 2) return { ...styles.rank, ...styles.rankBronze };
    return { ...styles.rank, ...styles.rankNormal };
  };

  return (
    <div style={styles.container}>
      <div style={styles.inner}>
        <div style={styles.titleRow}>
          <Snowflake />
          <h1 style={styles.title}>Admin Dashboard</h1>
        </div>

        {/* Game Control */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Game Control</h2>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={toggleGameActive}
              style={{
                ...styles.gameButton,
                ...(gameActive ? styles.stopButton : styles.startButton)
              }}
            >
              {gameActive ? 'Stop Game' : 'Start Game'}
            </button>
            <span
              style={{
                ...styles.statusBadge,
                ...(gameActive ? styles.statusActive : styles.statusStopped)
              }}
            >
              {gameActive ? 'Active' : 'Stopped'}
            </span>
          </div>
        </div>

        {/* Submissions Count */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Submissions</h2>
          <p style={styles.statNumber}>{submissions.length}</p>
          <p style={styles.statLabel}>players submitted</p>
        </div>

        {/* Leaderboard */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Leaderboard</h2>
          <button
            onClick={() => setShowTopThreeOnly(!showTopThreeOnly)}
            style={{
              ...styles.secondaryButton,
              ...(showTopThreeOnly ? styles.secondaryButtonActive : {})
            }}
          >
            {showTopThreeOnly ? 'Showing Top 3' : 'Show Top 3 Only'}
          </button>

          {ranked.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>No submissions yet.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, ...styles.rankCell }}>Rank</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Score</th>
                  <th style={styles.th}>Time</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((sub, idx) => (
                  <tr key={idx}>
                    <td style={styles.td}>
                      <span style={getRankStyle(idx)}>{idx + 1}</span>
                    </td>
                    <td style={{ ...styles.td, fontWeight: idx < 3 ? '600' : '400' }}>
                      {sub.name}
                    </td>
                    <td style={{ ...styles.td, fontWeight: idx < 3 ? '600' : '400' }}>
                      {sub.score} / 2500
                    </td>
                    <td style={{ ...styles.td, color: '#64748b' }}>
                      {new Date(sub.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Answer Key */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Answer Key</h2>
          <button
            onClick={() => setShowAnswers(!showAnswers)}
            style={styles.secondaryButton}
          >
            {showAnswers ? 'Hide Answers' : 'Show Answers'}
          </button>

          {showAnswers && (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, width: '60px' }}>#</th>
                  <th style={styles.th}>Question</th>
                  <th style={{ ...styles.th, width: '100px' }}>Answer</th>
                </tr>
              </thead>
              <tbody>
                {QUESTIONS.map((q) => (
                  <tr key={q.id}>
                    <td style={styles.td}>Q{q.id}</td>
                    <td style={{ ...styles.td, color: '#64748b' }}>{q.question}</td>
                    <td style={{ ...styles.td, fontWeight: '600' }}>{q.answer.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Danger Zone */}
        <div style={styles.dangerCard}>
          <h2 style={{ ...styles.sectionTitle, color: '#dc2626' }}>Danger Zone</h2>
          <button onClick={clearSubmissions} style={styles.dangerButton}>
            Clear All Submissions
          </button>
          <p style={styles.muted}>
            This will permanently delete all player submissions.
          </p>
        </div>
      </div>
    </div>
  );
}
