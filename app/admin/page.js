'use client';

import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { ref, onValue, set } from 'firebase/database';
import { QUESTIONS } from '../../lib/questions';

export default function AdminPage() {
  const [gameActive, setGameActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [submissions, setSubmissions] = useState([]);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthed, setIsAdminAuthed] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [showTopThreeOnly, setShowTopThreeOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNextConfirm, setShowNextConfirm] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  // Restore admin session from localStorage on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('priceIsRight_adminAuth');
    if (savedAuth === 'true') {
      setIsAdminAuthed(true);
    }
  }, []);

  // Save admin session to localStorage when authenticated
  useEffect(() => {
    if (isAdminAuthed) {
      localStorage.setItem('priceIsRight_adminAuth', 'true');
    }
  }, [isAdminAuthed]);

  useEffect(() => {
    const gameActiveRef = ref(db, 'gameActive');
    const currentQuestionRef = ref(db, 'currentQuestion');
    const submissionsRef = ref(db, 'submissions');

    const unsubActive = onValue(gameActiveRef, (snapshot) => {
      setGameActive(snapshot.val() === true);
      setLoading(false);
    });

    const unsubQuestion = onValue(currentQuestionRef, (snapshot) => {
      const val = snapshot.val();
      setCurrentQuestion(val !== null ? val : 0);
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
      unsubQuestion();
      unsubSubs();
    };
  }, []);

  const startGame = async () => {
    await set(ref(db, 'gameActive'), true);
    await set(ref(db, 'currentQuestion'), 1); // Start directly on Q1
  };

  const endGame = async () => {
    await set(ref(db, 'gameActive'), false);
    await set(ref(db, 'currentQuestion'), 0);
  };

  const nextQuestion = async () => {
    await set(ref(db, 'currentQuestion'), currentQuestion + 1);
    setShowNextConfirm(false);
  };

  const finishGame = async () => {
    await set(ref(db, 'currentQuestion'), 26);
    setShowFinishConfirm(false);
  };

  const clearSubmissions = async () => {
    if (confirm('Are you sure? This will clear all players and they will need to rejoin.')) {
      // Generate a new game session ID to invalidate all player sessions
      const newSessionId = Date.now().toString();
      await set(ref(db, 'submissions'), null);
      await set(ref(db, 'gameSession'), newSessionId);
    }
  };

  const getRankedSubmissions = () => {
    const sorted = [...submissions].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
    return showTopThreeOnly ? sorted.slice(0, 3) : sorted;
  };

  const getPlayersAnsweredCurrentQuestion = () => {
    if (currentQuestion === 0 || currentQuestion === 26) return [];
    return submissions.filter(sub => sub.answers && sub.answers[currentQuestion] !== undefined);
  };

  const handleLogin = () => {
    if (adminPassword === 'spring2025') {
      setIsAdminAuthed(true);
    } else {
      alert('Wrong password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('priceIsRight_adminAuth');
    setIsAdminAuthed(false);
    setAdminPassword('');
  };

  const Flower = ({ size = 20, color = "#ec4899" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="6" rx="3" ry="4" fill={color} opacity="0.9"/>
      <ellipse cx="12" cy="18" rx="3" ry="4" fill={color} opacity="0.9"/>
      <ellipse cx="6" cy="12" rx="4" ry="3" fill={color} opacity="0.9"/>
      <ellipse cx="18" cy="12" rx="4" ry="3" fill={color} opacity="0.9"/>
      <ellipse cx="7.5" cy="7.5" rx="3" ry="3.5" fill={color} opacity="0.85" transform="rotate(-45 7.5 7.5)"/>
      <ellipse cx="16.5" cy="7.5" rx="3" ry="3.5" fill={color} opacity="0.85" transform="rotate(45 16.5 7.5)"/>
      <ellipse cx="7.5" cy="16.5" rx="3" ry="3.5" fill={color} opacity="0.85" transform="rotate(45 7.5 16.5)"/>
      <ellipse cx="16.5" cy="16.5" rx="3" ry="3.5" fill={color} opacity="0.85" transform="rotate(-45 16.5 16.5)"/>
      <circle cx="12" cy="12" r="4" fill="#fbbf24"/>
    </svg>
  );

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #f0fdf4 0%, #fdf2f8 50%, #fffbeb 100%)',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#14532d'
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
      color: '#14532d',
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
      color: '#14532d'
    },
    input: {
      padding: '12px 14px',
      fontSize: '16px',
      border: '1px solid #bbf7d0',
      borderRadius: '8px',
      width: '100%',
      marginBottom: '12px',
      outline: 'none',
      backgroundColor: '#fafff7'
    },
    primaryButton: {
      padding: '12px 24px',
      fontSize: '15px',
      fontWeight: '500',
      backgroundColor: '#22c55e',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer'
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
      padding: '14px 28px',
      fontSize: '15px',
      fontWeight: '600',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      marginRight: '12px'
    },
    startButton: {
      backgroundColor: '#16a34a',
      color: 'white'
    },
    stopButton: {
      backgroundColor: '#64748b',
      color: 'white'
    },
    controlButton: {
      padding: '12px 24px',
      fontSize: '14px',
      fontWeight: '500',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      marginRight: '10px',
      marginBottom: '10px'
    },
    nextButton: {
      backgroundColor: '#22c55e',
      color: 'white'
    },
    finishButton: {
      backgroundColor: '#8b5cf6',
      color: 'white'
    },
    statusBadge: {
      display: 'inline-block',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '500',
      marginLeft: '12px'
    },
    statusActive: {
      backgroundColor: '#dcfce7',
      color: '#166534'
    },
    statusStopped: {
      backgroundColor: '#f1f5f9',
      color: '#64748b'
    },
    questionDisplay: {
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px'
    },
    currentQuestionNum: {
      fontSize: '48px',
      fontWeight: '700',
      color: '#22c55e',
      marginBottom: '8px'
    },
    questionText: {
      fontSize: '16px',
      color: '#14532d',
      marginBottom: '8px',
      lineHeight: '1.5'
    },
    answerText: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#16a34a'
    },
    playerStatus: {
      display: 'flex',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '1px solid #f1f5f9'
    },
    playerName: {
      flex: 1,
      fontSize: '14px'
    },
    checkmark: {
      color: '#16a34a',
      fontWeight: '600',
      fontSize: '16px'
    },
    crossmark: {
      color: '#94a3b8',
      fontSize: '16px'
    },
    statNumber: {
      fontSize: '36px',
      fontWeight: '600',
      color: '#14532d'
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
      color: '#14532d',
      border: '1px solid #bbf7d0',
      borderRadius: '6px',
      cursor: 'pointer',
      marginBottom: '16px'
    },
    secondaryButtonActive: {
      backgroundColor: '#22c55e',
      color: 'white',
      border: '1px solid #22c55e'
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
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      maxWidth: '400px',
      width: '90%',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
    },
    modalTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#14532d',
      marginBottom: '12px'
    },
    modalText: {
      fontSize: '14px',
      color: '#64748b',
      marginBottom: '20px',
      lineHeight: '1.5'
    },
    modalButtons: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end'
    },
    cancelButton: {
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: '500',
      backgroundColor: '#f1f5f9',
      color: '#64748b',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer'
    },
    confirmButton: {
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: '500',
      backgroundColor: '#22c55e',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer'
    },
    confirmButtonFinish: {
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: '500',
      backgroundColor: '#8b5cf6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer'
    },
    progressBar: {
      display: 'flex',
      gap: '4px',
      marginTop: '16px'
    },
    progressDot: {
      width: '12px',
      height: '12px',
      borderRadius: '3px',
      backgroundColor: '#e2e8f0'
    },
    progressDotActive: {
      backgroundColor: '#22c55e'
    },
    progressDotCurrent: {
      backgroundColor: '#fbbf24'
    },
    progressDotDone: {
      backgroundColor: '#16a34a'
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
            <Flower size={28} />
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
            <button onClick={handleLogin} style={{ ...styles.primaryButton, width: '100%' }}>
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin dashboard
  const ranked = getRankedSubmissions();
  const playersAnswered = getPlayersAnsweredCurrentQuestion();
  const currentQ = QUESTIONS.find(q => q.id === currentQuestion);

  const getRankStyle = (index) => {
    if (index === 0) return { ...styles.rank, ...styles.rankGold };
    if (index === 1) return { ...styles.rank, ...styles.rankSilver };
    if (index === 2) return { ...styles.rank, ...styles.rankBronze };
    return { ...styles.rank, ...styles.rankNormal };
  };

  // Progress bar for questions
  const renderProgressBar = () => (
    <div style={styles.progressBar}>
      {QUESTIONS.map((q) => {
        let dotStyle = { ...styles.progressDot };
        if (q.id < currentQuestion) {
          dotStyle = { ...dotStyle, ...styles.progressDotDone };
        } else if (q.id === currentQuestion) {
          dotStyle = { ...dotStyle, ...styles.progressDotCurrent };
        }
        return <div key={q.id} style={dotStyle} title={`Q${q.id}`} />;
      })}
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.inner}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Flower />
            <h1 style={styles.title}>Admin Dashboard</h1>
          </div>
          <button onClick={handleLogout} style={styles.secondaryButton}>
            Logout
          </button>
        </div>

        {/* Game Control */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Game Control</h2>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            {!gameActive ? (
              <button
                onClick={startGame}
                style={{ ...styles.gameButton, ...styles.startButton }}
              >
                Start Game
              </button>
            ) : (
              <button
                onClick={endGame}
                style={{ ...styles.gameButton, ...styles.stopButton }}
              >
                End Game
              </button>
            )}
            <span
              style={{
                ...styles.statusBadge,
                ...(gameActive ? styles.statusActive : styles.statusStopped)
              }}
            >
              {gameActive ? 'Game Active' : 'Game Stopped'}
            </span>
          </div>
        </div>

        {/* Question Control - only show when game is active */}
        {gameActive && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Current Question</h2>

            {currentQuestion === 26 ? (
              <div>
                <p style={{ fontSize: '18px', color: '#14532d', fontWeight: '600' }}>
                  Game Complete!
                </p>
                <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>
                  All 25 questions have been completed. Check the leaderboard for final results.
                </p>
              </div>
            ) : (
              <div>
                <div style={styles.questionDisplay}>
                  <div style={styles.currentQuestionNum}>Q{currentQuestion}</div>
                  <p style={styles.questionText}>{currentQ?.question}</p>
                  <p style={styles.answerText}>Answer: {currentQ?.answer.toLocaleString()}</p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '14px', color: '#64748b' }}>
                    Question {currentQuestion} of 25
                  </span>
                </div>

                <div>
                  {currentQuestion < 25 ? (
                    <button
                      onClick={() => setShowNextConfirm(true)}
                      style={{ ...styles.controlButton, ...styles.nextButton }}
                    >
                      Next Question
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowFinishConfirm(true)}
                      style={{ ...styles.controlButton, ...styles.finishButton }}
                    >
                      Finish Game
                    </button>
                  )}
                </div>

                {renderProgressBar()}
              </div>
            )}
          </div>
        )}

        {/* Live Submissions for current question */}
        {gameActive && currentQuestion >= 1 && currentQuestion <= 25 && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Live Submissions - Q{currentQuestion}</h2>
            <p style={{ fontSize: '16px', color: '#14532d', marginBottom: '16px' }}>
              <strong>{playersAnswered.length}</strong> of <strong>{submissions.length}</strong> players answered
            </p>

            {submissions.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>No players have joined yet.</p>
            ) : (
              <div>
                {submissions.map((sub, idx) => {
                  const hasAnswered = sub.answers && sub.answers[currentQuestion] !== undefined;
                  return (
                    <div key={idx} style={{
                      ...styles.playerStatus,
                      borderBottom: idx === submissions.length - 1 ? 'none' : '1px solid #f1f5f9'
                    }}>
                      <span style={styles.playerName}>{sub.name}</span>
                      {hasAnswered ? (
                        <span style={styles.checkmark}>✓</span>
                      ) : (
                        <span style={styles.crossmark}>—</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Players Count */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Players</h2>
          <p style={styles.statNumber}>{submissions.length}</p>
          <p style={styles.statLabel}>players joined</p>
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
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>No players yet.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, ...styles.rankCell }}>Rank</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Score</th>
                  <th style={styles.th}>Answered</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((sub, idx) => {
                  const answeredCount = sub.answers ? Object.keys(sub.answers).length : 0;
                  return (
                    <tr key={idx}>
                      <td style={styles.td}>
                        <span style={getRankStyle(idx)}>{idx + 1}</span>
                      </td>
                      <td style={{ ...styles.td, fontWeight: idx < 3 ? '600' : '400' }}>
                        {sub.name}
                      </td>
                      <td style={{ ...styles.td, fontWeight: idx < 3 ? '600' : '400' }}>
                        {sub.totalScore || 0}
                      </td>
                      <td style={{ ...styles.td, color: '#64748b' }}>
                        {answeredCount} / 25
                      </td>
                    </tr>
                  );
                })}
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
                  <tr key={q.id} style={{
                    backgroundColor: q.id === currentQuestion ? '#fef3c7' : 'transparent'
                  }}>
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

      {/* Next Question Confirmation Modal */}
      {showNextConfirm && (
        <div style={styles.modalOverlay} onClick={() => setShowNextConfirm(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Move to Next Question?</h3>
            <p style={styles.modalText}>
              This will close Q{currentQuestion} and move all players to Q{currentQuestion + 1}.
              Players who haven't answered yet will miss this question.
              <br /><br />
              <strong>{playersAnswered.length} of {submissions.length}</strong> players have answered.
            </p>
            <div style={styles.modalButtons}>
              <button
                onClick={() => setShowNextConfirm(false)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={nextQuestion}
                style={styles.confirmButton}
              >
                Yes, Next Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finish Game Confirmation Modal */}
      {showFinishConfirm && (
        <div style={styles.modalOverlay} onClick={() => setShowFinishConfirm(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Finish the Game?</h3>
            <p style={styles.modalText}>
              This will end the game and show final results to all players.
              This is the last question (Q25).
              <br /><br />
              <strong>{playersAnswered.length} of {submissions.length}</strong> players have answered Q25.
            </p>
            <div style={styles.modalButtons}>
              <button
                onClick={() => setShowFinishConfirm(false)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={finishGame}
                style={styles.confirmButtonFinish}
              >
                Yes, Finish Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
