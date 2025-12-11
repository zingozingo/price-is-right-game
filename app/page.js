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

  const styles = {
    container: {
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    title: {
      fontSize: '28px',
      color: '#c41e3a',
      marginBottom: '10px'
    },
    subtitle: {
      color: '#228b22',
      fontSize: '18px',
      marginBottom: '20px'
    },
    waitingContainer: {
      textAlign: 'center',
      marginTop: '100px'
    },
    waitingIcon: {
      fontSize: '48px',
      marginBottom: '20px'
    },
    waitingText: {
      fontSize: '20px',
      color: '#666'
    },
    nameInput: {
      padding: '12px 16px',
      fontSize: '18px',
      border: '2px solid #ddd',
      borderRadius: '8px',
      width: '100%',
      maxWidth: '300px',
      marginBottom: '10px'
    },
    joinButton: {
      padding: '12px 32px',
      fontSize: '18px',
      backgroundColor: '#228b22',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      marginLeft: '10px'
    },
    joinButtonDisabled: {
      padding: '12px 32px',
      fontSize: '18px',
      backgroundColor: '#ccc',
      color: '#666',
      border: 'none',
      borderRadius: '8px',
      cursor: 'not-allowed',
      marginLeft: '10px'
    },
    errorText: {
      color: '#c41e3a',
      marginTop: '10px',
      fontWeight: 'bold'
    },
    questionContainer: {
      marginBottom: '20px',
      padding: '15px',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      border: '1px solid #eee'
    },
    questionLabel: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '8px',
      display: 'block'
    },
    questionInput: {
      padding: '10px 14px',
      fontSize: '16px',
      border: '2px solid #ddd',
      borderRadius: '6px',
      width: '150px'
    },
    stickyFooter: {
      position: 'sticky',
      bottom: '0',
      background: 'linear-gradient(to top, white 80%, transparent)',
      padding: '20px 10px',
      textAlign: 'center'
    },
    submitButton: {
      padding: '16px 48px',
      fontSize: '20px',
      backgroundColor: '#c41e3a',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: 'bold'
    },
    counter: {
      fontSize: '16px',
      color: '#666',
      marginBottom: '10px'
    },
    thankYouContainer: {
      textAlign: 'center',
      marginTop: '80px'
    },
    thankYouIcon: {
      fontSize: '64px',
      marginBottom: '20px'
    },
    thankYouTitle: {
      fontSize: '32px',
      color: '#228b22',
      marginBottom: '20px'
    },
    thankYouText: {
      fontSize: '18px',
      color: '#666'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.waitingContainer}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Game not active - show waiting message only
  if (!gameActive) {
    return (
      <div style={styles.container}>
        <div style={styles.waitingContainer}>
          <div style={styles.waitingIcon}>🎄</div>
          <h1 style={styles.title}>The Price is Right</h1>
          <p style={styles.subtitle}>Holiday Edition</p>
          <p style={styles.waitingText}>
            Game hasn't started yet. Please wait for the host.
          </p>
        </div>
      </div>
    );
  }

  // Already submitted - show thank you (no score)
  if (submitted) {
    return (
      <div style={styles.container}>
        <div style={styles.thankYouContainer}>
          <div style={styles.thankYouIcon}>🎉</div>
          <h1 style={styles.thankYouTitle}>Thanks {playerName}!</h1>
          <p style={styles.thankYouText}>
            Your answers have been submitted. Good luck!
          </p>
        </div>
      </div>
    );
  }

  // Step 1: Name entry
  if (!nameConfirmed) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>The Price is Right</h1>
        <p style={styles.subtitle}>Holiday Edition</p>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          Guess closest WITHOUT going over!
        </p>

        <div style={{ marginTop: '40px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            Enter your name to join:
          </label>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
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
              placeholder="Your name"
              style={styles.nameInput}
            />
            <button
              onClick={checkDuplicateName}
              disabled={checkingName}
              style={checkingName ? styles.joinButtonDisabled : styles.joinButton}
            >
              {checkingName ? 'Checking...' : 'Join Game'}
            </button>
          </div>
          {nameError && <p style={styles.errorText}>{nameError}</p>}
        </div>
      </div>
    );
  }

  // Step 2: Answer questions
  const answeredCount = Object.keys(answers).filter(k => answers[k] !== '' && answers[k] !== undefined).length;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>The Price is Right</h1>
      <p style={styles.subtitle}>Holiday Edition</p>
      <p style={{ marginBottom: '30px', color: '#666' }}>
        Playing as: <strong>{playerName}</strong> | Guess closest WITHOUT going over!
      </p>

      <div style={{ marginBottom: '100px' }}>
        {QUESTIONS.map((q) => (
          <div key={q.id} style={styles.questionContainer}>
            <label style={styles.questionLabel}>
              Q{q.id}
            </label>
            <input
              type="number"
              value={answers[q.id] || ''}
              onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
              placeholder="Your guess"
              style={styles.questionInput}
            />
          </div>
        ))}
      </div>

      <div style={styles.stickyFooter}>
        <p style={styles.counter}>Answered: {answeredCount} / 25</p>
        <button onClick={submitAnswers} style={styles.submitButton}>
          Submit Answers
        </button>
      </div>
    </div>
  );
}
