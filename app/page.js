'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { ref, onValue, set, get } from 'firebase/database';
import { QUESTIONS, calculateTotalScore } from '../lib/questions';

export default function PlayerPage() {
  const [gameActive, setGameActive] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [nameConfirmed, setNameConfirmed] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [nameError, setNameError] = useState('');
  const [checkingName, setCheckingName] = useState(false);

  useEffect(() => {
    const gameActiveRef = ref(db, 'gameActive');

    const unsubActive = onValue(gameActiveRef, (snapshot) => {
      setGameActive(snapshot.val() === true);
      setLoading(false);
    });

    return () => {
      unsubActive();
    };
  }, []);

  const sanitizeName = (name) => {
    return name.trim().replace(/[.#$\/\[\]]/g, '_');
  };

  const checkDuplicateName = async () => {
    const trimmedName = playerName.trim();
    if (!trimmedName) {
      setNameError('Please enter your name');
      return;
    }

    setCheckingName(true);
    setNameError('');

    try {
      const submissionsRef = ref(db, 'submissions');
      const snapshot = await get(submissionsRef);
      const data = snapshot.val();

      if (data) {
        const existingNames = Object.values(data).map(sub => sub.name.toLowerCase());
        if (existingNames.includes(trimmedName.toLowerCase())) {
          setNameError('That name is taken, please choose another.');
          setCheckingName(false);
          return;
        }
      }

      setNameConfirmed(true);
    } catch (error) {
      setNameError('Error checking name. Please try again.');
    }
    setCheckingName(false);
  };

  const submitAnswers = async () => {
    const submission = {
      name: playerName.trim(),
      answers: { ...answers },
      timestamp: new Date().toISOString(),
      score: calculateTotalScore(answers)
    };

    const submissionRef = ref(db, 'submissions/' + sanitizeName(playerName));
    await set(submissionRef, submission);
    setSubmitted(true);
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
      maxWidth: '600px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '32px',
      position: 'relative'
    },
    titleRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#1e3a5f',
      marginBottom: '4px',
      letterSpacing: '-0.5px'
    },
    subtitle: {
      color: '#5b8cb8',
      fontSize: '15px',
      fontWeight: '500'
    },
    waitingContainer: {
      textAlign: 'center',
      marginTop: '120px'
    },
    waitingText: {
      fontSize: '16px',
      color: '#64748b',
      lineHeight: '1.6'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(30, 58, 95, 0.08)',
      border: '1px solid #e2e8f0'
    },
    input: {
      padding: '12px 14px',
      fontSize: '16px',
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      width: '100%',
      maxWidth: '280px',
      outline: 'none',
      transition: 'border-color 0.15s ease',
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
      transition: 'background-color 0.15s ease'
    },
    primaryButtonDisabled: {
      padding: '12px 24px',
      fontSize: '15px',
      fontWeight: '500',
      backgroundColor: '#cbd5e1',
      color: '#94a3b8',
      border: 'none',
      borderRadius: '8px',
      cursor: 'not-allowed'
    },
    errorText: {
      color: '#dc2626',
      fontSize: '14px',
      marginTop: '8px'
    },
    questionRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 0',
      borderBottom: '1px solid #e8f0f7'
    },
    questionLabel: {
      fontSize: '15px',
      fontWeight: '500',
      color: '#1e3a5f'
    },
    questionInput: {
      padding: '10px 12px',
      fontSize: '16px',
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      width: '120px',
      textAlign: 'right',
      outline: 'none',
      backgroundColor: '#fafcff'
    },
    stickyFooter: {
      position: 'sticky',
      bottom: '0',
      background: 'linear-gradient(to top, #f0f7ff 85%, rgba(240, 247, 255, 0))',
      padding: '24px 0',
      textAlign: 'center'
    },
    submitButton: {
      padding: '14px 48px',
      fontSize: '16px',
      fontWeight: '500',
      backgroundColor: '#3b82c4',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer'
    },
    counter: {
      fontSize: '14px',
      color: '#64748b',
      marginBottom: '12px'
    },
    successContainer: {
      textAlign: 'center',
      marginTop: '120px'
    },
    successTitle: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#1e3a5f',
      marginBottom: '12px'
    },
    successText: {
      fontSize: '16px',
      color: '#64748b',
      lineHeight: '1.6'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#475569',
      marginBottom: '8px'
    },
    hint: {
      fontSize: '14px',
      color: '#64748b',
      marginBottom: '24px'
    },
    playerInfo: {
      fontSize: '14px',
      color: '#64748b',
      marginBottom: '20px',
      paddingBottom: '16px',
      borderBottom: '1px solid #e8f0f7'
    },
    snowflakeDecor: {
      position: 'absolute',
      opacity: 0.4
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.inner}>
          <div style={styles.waitingContainer}>
            <p style={styles.waitingText}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Game not active - show waiting message only
  if (!gameActive) {
    return (
      <div style={styles.container}>
        <div style={styles.inner}>
          <div style={styles.waitingContainer}>
            <div style={{ marginBottom: '24px' }}>
              <Snowflake size={28} />
            </div>
            <h1 style={styles.title}>The Price is Right</h1>
            <p style={{ ...styles.subtitle, marginTop: '8px', marginBottom: '32px' }}>Holiday Edition</p>
            <p style={styles.waitingText}>
              Game hasn't started yet.<br />Please wait for the host.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Already submitted - show thank you (no score)
  if (submitted) {
    return (
      <div style={styles.container}>
        <div style={styles.inner}>
          <div style={styles.successContainer}>
            <div style={{ marginBottom: '24px' }}>
              <Snowflake />
            </div>
            <h1 style={styles.successTitle}>Thanks, {playerName}!</h1>
            <p style={styles.successText}>
              Your answers have been submitted.<br />Good luck!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Name entry
  if (!nameConfirmed) {
    return (
      <div style={styles.container}>
        <div style={styles.inner}>
          <div style={styles.header}>
            <div style={styles.titleRow}>
              <Snowflake />
              <h1 style={{ ...styles.title, marginBottom: 0 }}>The Price is Right</h1>
            </div>
            <p style={{ ...styles.subtitle, marginTop: '6px' }}>Holiday Edition</p>
          </div>

          <div style={styles.card}>
            <p style={styles.hint}>
              Guess closest without going over.
            </p>

            <div>
              <label style={styles.label}>Your name</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => {
                    setPlayerName(e.target.value);
                    setNameError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') checkDuplicateName();
                  }}
                  placeholder="Enter your name"
                  style={styles.input}
                />
                <button
                  onClick={checkDuplicateName}
                  disabled={checkingName}
                  style={checkingName ? styles.primaryButtonDisabled : styles.primaryButton}
                >
                  {checkingName ? 'Joining...' : 'Join Game'}
                </button>
              </div>
              {nameError && <p style={styles.errorText}>{nameError}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Answer questions
  const answeredCount = Object.keys(answers).filter(k => answers[k] !== '' && answers[k] !== undefined).length;

  return (
    <div style={styles.container}>
      <div style={styles.inner}>
        <div style={styles.header}>
          <div style={styles.titleRow}>
            <Snowflake />
            <h1 style={{ ...styles.title, marginBottom: 0 }}>The Price is Right</h1>
          </div>
          <p style={{ ...styles.subtitle, marginTop: '6px' }}>Holiday Edition</p>
        </div>

        <div style={styles.card}>
          <p style={styles.playerInfo}>
            Playing as <strong>{playerName}</strong>
          </p>

          <div style={{ marginBottom: '24px' }}>
            {QUESTIONS.map((q, index) => (
              <div key={q.id} style={{
                ...styles.questionRow,
                borderBottom: index === QUESTIONS.length - 1 ? 'none' : '1px solid #e8f0f7'
              }}>
                <label style={styles.questionLabel}>Q{q.id}</label>
                <input
                  type="number"
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                  placeholder="—"
                  style={styles.questionInput}
                />
              </div>
            ))}
          </div>
        </div>

        <div style={styles.stickyFooter}>
          <p style={styles.counter}>{answeredCount} of 25 answered</p>
          <button onClick={submitAnswers} style={styles.submitButton}>
            Submit Answers
          </button>
        </div>
      </div>
    </div>
  );
}
