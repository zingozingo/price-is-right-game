'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { ref, onValue, set, get, update } from 'firebase/database';
import { QUESTIONS, calculateScore } from '../lib/questions';

export default function PlayerPage() {
  const [gameActive, setGameActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [nameConfirmed, setNameConfirmed] = useState(false);
  const [myAnswers, setMyAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [nameError, setNameError] = useState('');
  const [checkingName, setCheckingName] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [answerError, setAnswerError] = useState('');

  // Subscribe to game session and validate/restore local session
  useEffect(() => {
    const gameSessionRef = ref(db, 'gameSession');

    const unsub = onValue(gameSessionRef, (snapshot) => {
      const currentSession = snapshot.val();
      const savedSession = localStorage.getItem('priceIsRight_gameSession');
      const savedName = localStorage.getItem('priceIsRight_playerName');
      const savedConfirmed = localStorage.getItem('priceIsRight_nameConfirmed');

      // If session changed (admin cleared submissions), invalidate local session
      // Also invalidate if player has 'initial' session but server now has a real session
      if (currentSession && savedSession && currentSession !== savedSession) {
        localStorage.removeItem('priceIsRight_playerName');
        localStorage.removeItem('priceIsRight_nameConfirmed');
        localStorage.removeItem('priceIsRight_gameSession');
        setPlayerName('');
        setNameConfirmed(false);
        setMyAnswers({});
        return;
      }

      // Restore session if valid (session matches or no server session yet)
      if (savedName && savedConfirmed === 'true') {
        const sessionValid = !currentSession || !savedSession || currentSession === savedSession;
        if (sessionValid) {
          setPlayerName(savedName);
          setNameConfirmed(true);
        }
      }
    });

    return () => unsub();
  }, []);

  // Save session to localStorage when name is confirmed
  useEffect(() => {
    if (nameConfirmed && playerName) {
      localStorage.setItem('priceIsRight_playerName', playerName);
      localStorage.setItem('priceIsRight_nameConfirmed', 'true');
      // Also save current game session (or create a default if none exists)
      const gameSessionRef = ref(db, 'gameSession');
      get(gameSessionRef).then((snapshot) => {
        const session = snapshot.val() || 'initial';
        localStorage.setItem('priceIsRight_gameSession', session);
      });
    }
  }, [nameConfirmed, playerName]);

  // Subscribe to game state
  useEffect(() => {
    const gameActiveRef = ref(db, 'gameActive');
    const currentQuestionRef = ref(db, 'currentQuestion');

    const unsubActive = onValue(gameActiveRef, (snapshot) => {
      setGameActive(snapshot.val() === true);
      setLoading(false);
    });

    const unsubQuestion = onValue(currentQuestionRef, (snapshot) => {
      const val = snapshot.val();
      setCurrentQuestion(val !== null ? val : 0);
      setCurrentAnswer(''); // Reset input when question changes
      setAnswerError(''); // Reset error when question changes
    });

    return () => {
      unsubActive();
      unsubQuestion();
    };
  }, []);

  // Subscribe to my own answers when name is confirmed
  useEffect(() => {
    if (!nameConfirmed || !playerName) return;

    const sanitized = sanitizeName(playerName);
    const myAnswersRef = ref(db, `submissions/${sanitized}/answers`);

    const unsub = onValue(myAnswersRef, (snapshot) => {
      const data = snapshot.val();
      setMyAnswers(data || {});
    });

    return () => unsub();
  }, [nameConfirmed, playerName]);

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

      // Create initial player entry
      const sanitized = sanitizeName(trimmedName);
      await set(ref(db, `submissions/${sanitized}`), {
        name: trimmedName,
        answers: {},
        totalScore: 0,
        timestamp: new Date().toISOString()
      });

      setNameConfirmed(true);
    } catch (error) {
      setNameError('Error checking name. Please try again.');
    }
    setCheckingName(false);
  };

  const validateAnswer = (value) => {
    if (value === '') return 'Please enter an answer';

    const num = Number(value);
    if (isNaN(num)) return 'Please enter a valid number';
    if (!Number.isFinite(num)) return 'Please enter a valid number';
    if (num < -1000000000 || num > 1000000000) return 'Number is out of range';
    if (value.includes('e') || value.includes('E')) return 'Scientific notation not allowed';

    return '';
  };

  const submitAnswer = async () => {
    if (submitting || currentAnswer === '' || hasAnsweredCurrentQuestion()) return;

    const validationError = validateAnswer(currentAnswer);
    if (validationError) {
      setAnswerError(validationError);
      return;
    }

    setSubmitting(true);
    setAnswerError('');

    try {
      const question = QUESTIONS.find(q => q.id === currentQuestion);
      const score = calculateScore(currentAnswer, question.answer);
      const sanitized = sanitizeName(playerName);

      // Double-check they haven't already answered (race condition protection)
      const existingAnswer = await get(ref(db, `submissions/${sanitized}/answers/${currentQuestion}`));
      if (existingAnswer.val() !== null) {
        setSubmitting(false);
        return;
      }

      // Get current total score
      const scoreRef = ref(db, `submissions/${sanitized}/totalScore`);
      const scoreSnap = await get(scoreRef);
      const currentTotal = scoreSnap.val() || 0;

      // Update answers and total score
      await update(ref(db, `submissions/${sanitized}`), {
        [`answers/${currentQuestion}`]: currentAnswer,
        totalScore: currentTotal + score,
        timestamp: new Date().toISOString()
      });

      setCurrentAnswer('');
    } catch (error) {
      console.error('Error submitting answer:', error);
    }

    setSubmitting(false);
  };

  const hasAnsweredCurrentQuestion = () => {
    return myAnswers[currentQuestion] !== undefined;
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
      maxWidth: '500px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '32px',
      textAlign: 'center'
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
    centeredContainer: {
      textAlign: 'center',
      marginTop: '80px'
    },
    waitingText: {
      fontSize: '16px',
      color: '#64748b',
      lineHeight: '1.6'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '32px',
      boxShadow: '0 1px 3px rgba(30, 58, 95, 0.08)',
      border: '1px solid #e2e8f0',
      textAlign: 'center'
    },
    input: {
      padding: '14px 16px',
      fontSize: '18px',
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      width: '100%',
      maxWidth: '280px',
      outline: 'none',
      backgroundColor: '#fafcff',
      textAlign: 'center'
    },
    largeInput: {
      padding: '20px 24px',
      fontSize: '32px',
      border: '2px solid #cbd5e1',
      borderRadius: '12px',
      width: '200px',
      outline: 'none',
      backgroundColor: '#fafcff',
      textAlign: 'center',
      fontWeight: '600'
    },
    primaryButton: {
      padding: '14px 32px',
      fontSize: '16px',
      fontWeight: '500',
      backgroundColor: '#3b82c4',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'background-color 0.15s ease'
    },
    primaryButtonDisabled: {
      padding: '14px 32px',
      fontSize: '16px',
      fontWeight: '500',
      backgroundColor: '#cbd5e1',
      color: '#94a3b8',
      border: 'none',
      borderRadius: '8px',
      cursor: 'not-allowed'
    },
    largeButton: {
      padding: '18px 48px',
      fontSize: '18px',
      fontWeight: '600',
      backgroundColor: '#3b82c4',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      width: '100%',
      maxWidth: '280px'
    },
    largeButtonDisabled: {
      padding: '18px 48px',
      fontSize: '18px',
      fontWeight: '600',
      backgroundColor: '#cbd5e1',
      color: '#94a3b8',
      border: 'none',
      borderRadius: '10px',
      cursor: 'not-allowed',
      width: '100%',
      maxWidth: '280px'
    },
    errorText: {
      color: '#dc2626',
      fontSize: '14px',
      marginTop: '12px'
    },
    questionNumber: {
      fontSize: '64px',
      fontWeight: '700',
      color: '#3b82c4',
      marginBottom: '24px'
    },
    statusText: {
      fontSize: '18px',
      color: '#64748b',
      marginBottom: '32px'
    },
    lockedIn: {
      backgroundColor: '#dcfce7',
      color: '#166534',
      padding: '16px 24px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '500'
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
    progressDots: {
      display: 'flex',
      justifyContent: 'center',
      gap: '6px',
      marginTop: '24px',
      flexWrap: 'wrap',
      maxWidth: '300px',
      margin: '24px auto 0'
    },
    dot: {
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      backgroundColor: '#e2e8f0'
    },
    dotAnswered: {
      backgroundColor: '#3b82c4'
    },
    dotCurrent: {
      backgroundColor: '#fbbf24',
      boxShadow: '0 0 0 3px rgba(251, 191, 36, 0.3)'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.inner}>
          <div style={styles.centeredContainer}>
            <p style={styles.waitingText}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Game not active
  if (!gameActive) {
    return (
      <div style={styles.container}>
        <div style={styles.inner}>
          <div style={styles.centeredContainer}>
            <div style={{ marginBottom: '24px' }}>
              <Snowflake size={32} />
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

  // Game active but no name yet
  if (!nameConfirmed) {
    return (
      <div style={styles.container}>
        <div style={styles.inner}>
          <div style={styles.header}>
            <Snowflake size={28} />
            <h1 style={{ ...styles.title, marginTop: '12px' }}>The Price is Right</h1>
            <p style={styles.subtitle}>Holiday Edition</p>
          </div>

          <div style={styles.card}>
            <p style={styles.hint}>
              Guess closest without going over.
            </p>

            <div>
              <label style={styles.label}>Your name</label>
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
              {nameError && <p style={styles.errorText}>{nameError}</p>}
              <div style={{ marginTop: '20px' }}>
                <button
                  onClick={checkDuplicateName}
                  disabled={checkingName}
                  style={checkingName ? styles.primaryButtonDisabled : styles.primaryButton}
                >
                  {checkingName ? 'Joining...' : 'Join Game'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game finished
  if (currentQuestion === 26) {
    return (
      <div style={styles.container}>
        <div style={styles.inner}>
          <div style={styles.centeredContainer}>
            <div style={{ marginBottom: '24px' }}>
              <Snowflake size={32} />
            </div>
            <h1 style={styles.title}>Game Over!</h1>
            <p style={{ ...styles.statusText, marginTop: '16px' }}>
              Thanks for playing, {playerName}!<br />
              Check the screen for final results.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Active question (1-25)
  const answered = hasAnsweredCurrentQuestion();

  // Progress dots
  const renderProgressDots = () => (
    <div style={styles.progressDots}>
      {QUESTIONS.map((q) => {
        let dotStyle = { ...styles.dot };
        if (myAnswers[q.id] !== undefined) {
          dotStyle = { ...dotStyle, ...styles.dotAnswered };
        }
        if (q.id === currentQuestion) {
          dotStyle = { ...dotStyle, ...styles.dotCurrent };
        }
        return <div key={q.id} style={dotStyle} />;
      })}
    </div>
  );

  // Player hasn't answered current question yet
  if (!answered) {
    return (
      <div style={styles.container}>
        <div style={styles.inner}>
          <div style={styles.header}>
            <Snowflake size={28} />
            <h1 style={{ ...styles.title, marginTop: '12px' }}>The Price is Right</h1>
            <p style={styles.subtitle}>Holiday Edition</p>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>
              Playing as <strong>{playerName}</strong>
            </p>
          </div>

          <div style={styles.card}>
            <div style={styles.questionNumber}>Q{currentQuestion}</div>
            <p style={{ ...styles.statusText, marginBottom: '24px' }}>
              Enter your answer
            </p>

            <input
              type="number"
              value={currentAnswer}
              onChange={(e) => {
                setCurrentAnswer(e.target.value);
                setAnswerError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitAnswer();
              }}
              placeholder="?"
              style={{
                ...styles.largeInput,
                borderColor: answerError ? '#dc2626' : '#cbd5e1'
              }}
              autoFocus
            />
            {answerError && <p style={styles.errorText}>{answerError}</p>}

            <div style={{ marginTop: '24px' }}>
              <button
                onClick={submitAnswer}
                disabled={submitting || currentAnswer === ''}
                style={(submitting || currentAnswer === '') ? styles.largeButtonDisabled : styles.largeButton}
              >
                {submitting ? 'Submitting...' : 'Submit Answer'}
              </button>
            </div>

            {renderProgressDots()}
          </div>
        </div>
      </div>
    );
  }

  // Player HAS answered - waiting for next question
  return (
    <div style={styles.container}>
      <div style={styles.inner}>
        <div style={styles.header}>
          <Snowflake size={28} />
          <h1 style={{ ...styles.title, marginTop: '12px' }}>The Price is Right</h1>
          <p style={styles.subtitle}>Holiday Edition</p>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>
            Playing as <strong>{playerName}</strong>
          </p>
        </div>

        <div style={styles.card}>
          <div style={styles.questionNumber}>Q{currentQuestion}</div>
          <div style={styles.lockedIn}>
            Answer submitted! Waiting for next question...
          </div>

          {renderProgressDots()}
        </div>
      </div>
    </div>
  );
}
