'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { ref, onValue, set, get } from 'firebase/database';
import { QUESTIONS, calculateTotalScore, calculateScore } from '../lib/questions';

export default function Home() {
  const [view, setView] = useState('player');
  const [gameActive, setGameActive] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthed, setIsAdminAuthed] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [loading, setLoading] = useState(true);

  // Subscribe to real-time updates
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

  const submitAnswers = async () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }

    const submission = {
      name: playerName.trim(),
      answers: { ...answers },
      timestamp: new Date().toISOString(),
      score: calculateTotalScore(answers)
    };

    const submissionRef = ref(db, 'submissions/' + playerName.trim().replace(/[.#$\/\[\]]/g, '_'));
    await set(submissionRef, submission);
    setSubmitted(true);
  };

  const clearSubmissions = async () => {
    if (confirm('Clear all submissions?')) {
      const submissionsRef = ref(db, 'submissions');
      await set(submissionsRef, null);
    }
  };

  const getRankedSubmissions = () => {
    return [...submissions].sort((a, b) => b.score - a.score);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  // ADMIN VIEW
  if (view === 'admin') {
    if (!isAdminAuthed) {
      return (
        <div style={{ padding: 20 }}>
          <h2>Admin Login</h2>
          <input
            type="password"
            placeholder="Password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
          />
          <button onClick={() => {
            if (adminPassword === 'holiday2024') {
              setIsAdminAuthed(true);
            } else {
              alert('Wrong password');
            }
          }}>
            Login
          </button>
          <br /><br />
          <button onClick={() => setView('player')}>Back to Player View</button>
          <p style={{ color: '#999' }}>Password: holiday2024</p>
        </div>
      );
    }

    const ranked = getRankedSubmissions();

    return (
      <div style={{ padding: 20 }}>
        <h1>Admin Dashboard</h1>
        
        <div style={{ marginBottom: 20 }}>
          <button onClick={toggleGameActive} style={{ marginRight: 10 }}>
            {gameActive ? 'STOP GAME' : 'START GAME'}
          </button>
          <span>{gameActive ? 'Game is ACTIVE' : 'Game is STOPPED'}</span>
        </div>

        <div style={{ marginBottom: 20 }}>
          <button onClick={() => setShowAnswers(!showAnswers)} style={{ marginRight: 10 }}>
            {showAnswers ? 'Hide Answers' : 'Show Answers'}
          </button>
          <button onClick={clearSubmissions} style={{ marginRight: 10 }}>
            Clear All Submissions
          </button>
          <button onClick={() => setView('player')}>
            Player View
          </button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <strong>Total Submissions: {submissions.length}</strong>
        </div>

        <h2>Leaderboard</h2>
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Score</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((sub, idx) => (
              <tr key={idx} style={idx < 3 ? { fontWeight: 'bold' } : {}}>
                <td>{idx + 1}</td>
                <td>{sub.name}</td>
                <td>{sub.score} / 2500</td>
                <td>{new Date(sub.timestamp).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {showAnswers && (
          <div style={{ marginTop: 20 }}>
            <h2>Answer Key</h2>
            <table border="1" cellPadding="5">
              <thead>
                <tr>
                  <th>Q#</th>
                  <th>Answer</th>
                </tr>
              </thead>
              <tbody>
                {QUESTIONS.map((q) => (
                  <tr key={q.id}>
                    <td>{q.id}</td>
                    <td>{q.answer.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // PLAYER VIEW - Game not active
  if (!gameActive) {
    return (
      <div style={{ padding: 20 }}>
        <h1>The Price is Right - Holiday Edition</h1>
        <p>Game is not active yet. Please wait for the host to start.</p>
        <br />
        <button onClick={() => setView('admin')}>Admin</button>
      </div>
    );
  }

  // PLAYER VIEW - Already submitted
  if (submitted) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Submitted!</h1>
        <p>Thanks for playing, {playerName}!</p>
        <p>Your score: {calculateTotalScore(answers)} / 2500</p>
        <p>Winners will be announced at the end.</p>
      </div>
    );
  }

  // PLAYER VIEW - Enter answers
  const answeredCount = Object.keys(answers).filter(k => answers[k] !== '' && answers[k] !== undefined).length;

  return (
    <div style={{ padding: 20 }}>
      <h1>The Price is Right - Holiday Edition</h1>
      <p>Guess closest WITHOUT going over!</p>

      <div style={{ marginBottom: 20 }}>
        <label>Your Name: </label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        {QUESTIONS.map((q) => (
          <div key={q.id} style={{ marginBottom: 15 }}>
            <label>
              <strong>Q{q.id}.</strong> {q.question}
            </label>
            <br />
            <input
              type="number"
              value={answers[q.id] || ''}
              onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
              placeholder="Your guess"
              style={{ width: 150 }}
            />
          </div>
        ))}
      </div>

      <div style={{ position: 'sticky', bottom: 0, background: 'white', padding: 10, borderTop: '1px solid #ccc' }}>
        <p>Answered: {answeredCount} / 25</p>
        <button onClick={submitAnswers}>Submit Answers</button>
      </div>

      <br />
      <button onClick={() => setView('admin')}>Admin</button>
    </div>
  );
}
