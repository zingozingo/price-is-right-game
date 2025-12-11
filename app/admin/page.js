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

  const styles = {
    container: {
      padding: '20px',
      maxWidth: '1000px',
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    title: {
      fontSize: '28px',
      color: '#333',
      marginBottom: '30px'
    },
    loginContainer: {
      maxWidth: '400px',
      margin: '100px auto',
      textAlign: 'center'
    },
    loginTitle: {
      fontSize: '24px',
      marginBottom: '20px',
      color: '#333'
    },
    passwordInput: {
      padding: '12px 16px',
      fontSize: '16px',
      border: '2px solid #ddd',
      borderRadius: '8px',
      width: '100%',
      marginBottom: '15px'
    },
    loginButton: {
      padding: '12px 32px',
      fontSize: '16px',
      backgroundColor: '#333',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      width: '100%'
    },
    section: {
      marginBottom: '30px',
      padding: '20px',
      backgroundColor: '#f9f9f9',
      borderRadius: '12px',
      border: '1px solid #eee'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '15px',
      color: '#333'
    },
    gameControlButton: {
      padding: '20px 40px',
      fontSize: '20px',
      fontWeight: 'bold',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      marginRight: '20px'
    },
    startButton: {
      backgroundColor: '#228b22',
      color: 'white'
    },
    stopButton: {
      backgroundColor: '#c41e3a',
      color: 'white'
    },
    statusIndicator: {
      display: 'inline-block',
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: 'bold'
    },
    statusActive: {
      backgroundColor: '#d4edda',
      color: '#155724'
    },
    statusStopped: {
      backgroundColor: '#f8d7da',
      color: '#721c24'
    },
    submissionCount: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333'
    },
    toggleButton: {
      padding: '10px 20px',
      fontSize: '14px',
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      marginBottom: '15px'
    },
    toggleButtonActive: {
      backgroundColor: '#007bff'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '10px'
    },
    th: {
      textAlign: 'left',
      padding: '12px 15px',
      backgroundColor: '#e9ecef',
      borderBottom: '2px solid #dee2e6',
      fontWeight: 'bold'
    },
    td: {
      padding: '12px 15px',
      borderBottom: '1px solid #dee2e6'
    },
    goldRow: {
      backgroundColor: '#fff9e6'
    },
    silverRow: {
      backgroundColor: '#f5f5f5'
    },
    bronzeRow: {
      backgroundColor: '#fdf5ef'
    },
    rankBadge: {
      display: 'inline-block',
      width: '28px',
      height: '28px',
      lineHeight: '28px',
      textAlign: 'center',
      borderRadius: '50%',
      fontWeight: 'bold',
      fontSize: '14px'
    },
    goldBadge: {
      backgroundColor: '#ffd700',
      color: '#333'
    },
    silverBadge: {
      backgroundColor: '#c0c0c0',
      color: '#333'
    },
    bronzeBadge: {
      backgroundColor: '#cd7f32',
      color: 'white'
    },
    normalBadge: {
      backgroundColor: '#e9ecef',
      color: '#333'
    },
    expandButton: {
      padding: '10px 20px',
      fontSize: '14px',
      backgroundColor: '#17a2b8',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer'
    },
    answerKeyTable: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '15px'
    },
    answerKeyQuestion: {
      fontSize: '14px',
      color: '#666'
    },
    clearButton: {
      padding: '12px 24px',
      fontSize: '14px',
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }

  // Admin login screen
  if (!isAdminAuthed) {
    return (
      <div style={styles.container}>
        <div style={styles.loginContainer}>
          <h1 style={styles.loginTitle}>Admin Login</h1>
          <input
            type="password"
            placeholder="Enter password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleLogin();
            }}
            style={styles.passwordInput}
          />
          <button onClick={handleLogin} style={styles.loginButton}>
            Login
          </button>
        </div>
      </div>
    );
  }

  // Admin dashboard
  const ranked = getRankedSubmissions();

  const getRowStyle = (index) => {
    if (index === 0) return styles.goldRow;
    if (index === 1) return styles.silverRow;
    if (index === 2) return styles.bronzeRow;
    return {};
  };

  const getBadgeStyle = (index) => {
    if (index === 0) return { ...styles.rankBadge, ...styles.goldBadge };
    if (index === 1) return { ...styles.rankBadge, ...styles.silverBadge };
    if (index === 2) return { ...styles.rankBadge, ...styles.bronzeBadge };
    return { ...styles.rankBadge, ...styles.normalBadge };
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Admin Dashboard</h1>

      {/* Game Control Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Game Control</h2>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <button
            onClick={toggleGameActive}
            style={{
              ...styles.gameControlButton,
              ...(gameActive ? styles.stopButton : styles.startButton)
            }}
          >
            {gameActive ? 'STOP GAME' : 'START GAME'}
          </button>
          <span
            style={{
              ...styles.statusIndicator,
              ...(gameActive ? styles.statusActive : styles.statusStopped)
            }}
          >
            {gameActive ? 'Game is ACTIVE' : 'Game is STOPPED'}
          </span>
        </div>
      </div>

      {/* Submissions Count */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Submissions</h2>
        <p style={styles.submissionCount}>{submissions.length} players submitted</p>
      </div>

      {/* Leaderboard Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Leaderboard</h2>
        <button
          onClick={() => setShowTopThreeOnly(!showTopThreeOnly)}
          style={{
            ...styles.toggleButton,
            ...(showTopThreeOnly ? styles.toggleButtonActive : {})
          }}
        >
          {showTopThreeOnly ? 'Show All' : 'Show Top 3'}
        </button>

        {ranked.length === 0 ? (
          <p style={{ color: '#666' }}>No submissions yet.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Rank</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Score</th>
                <th style={styles.th}>Time Submitted</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((sub, idx) => (
                <tr key={idx} style={getRowStyle(idx)}>
                  <td style={styles.td}>
                    <span style={getBadgeStyle(idx)}>{idx + 1}</span>
                  </td>
                  <td style={{ ...styles.td, fontWeight: idx < 3 ? 'bold' : 'normal' }}>
                    {sub.name}
                  </td>
                  <td style={{ ...styles.td, fontWeight: idx < 3 ? 'bold' : 'normal' }}>
                    {sub.score} / 2500
                  </td>
                  <td style={styles.td}>
                    {new Date(sub.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Answer Key Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Answer Key</h2>
        <button
          onClick={() => setShowAnswers(!showAnswers)}
          style={styles.expandButton}
        >
          {showAnswers ? 'Hide Answers' : 'Show Answers'}
        </button>

        {showAnswers && (
          <table style={styles.answerKeyTable}>
            <thead>
              <tr>
                <th style={styles.th}>Q#</th>
                <th style={styles.th}>Question</th>
                <th style={styles.th}>Answer</th>
              </tr>
            </thead>
            <tbody>
              {QUESTIONS.map((q) => (
                <tr key={q.id}>
                  <td style={styles.td}>{q.id}</td>
                  <td style={{ ...styles.td, ...styles.answerKeyQuestion }}>{q.question}</td>
                  <td style={{ ...styles.td, fontWeight: 'bold' }}>{q.answer.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Clear Submissions Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Danger Zone</h2>
        <button onClick={clearSubmissions} style={styles.clearButton}>
          Clear All Submissions
        </button>
        <p style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
          This will permanently delete all player submissions.
        </p>
      </div>
    </div>
  );
}
