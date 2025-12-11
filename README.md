# Price is Right - Holiday Edition

A simple guessing game for your holiday party.

## Quick Setup (15 minutes)

### Step 1: Create Firebase Project (Free)

1. Go to https://console.firebase.google.com/
2. Click "Create a project" (or "Add project")
3. Name it anything (e.g., "holiday-game")
4. Disable Google Analytics (not needed)
5. Click "Create project"

### Step 2: Enable Realtime Database

1. In your Firebase project, click "Build" > "Realtime Database"
2. Click "Create Database"
3. Choose a location (any is fine)
4. Select "Start in TEST MODE" (important!)
5. Click "Enable"

### Step 3: Get Your Config

1. Click the gear icon > "Project settings"
2. Scroll down to "Your apps" section
3. Click the web icon (</>)
4. Name it anything, click "Register app"
5. Copy the `firebaseConfig` object

### Step 4: Update the Code

1. Open `lib/firebase.js`
2. Replace the placeholder config with your config:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123...",
  appId: "1:123..."
};
```

### Step 5: Deploy to Vercel

1. Push this code to a GitHub repo
2. Go to https://vercel.com
3. Click "New Project"
4. Import your GitHub repo
5. Click "Deploy"
6. You'll get a URL like `https://your-app.vercel.app`

## Testing Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 in two browser windows:
- Window 1: Go to admin, start game
- Window 2: Enter answers as a player

## How to Use at Your Party

1. Before the party: Deploy and test
2. At the party:
   - Open admin view, enter password: `holiday2024`
   - Click "START GAME" when ready
   - Share the URL with everyone
   - They enter their guesses
   - Click "STOP GAME" when done
   - Show the leaderboard!

## Scoring

- Over the answer = 0 points
- Exact match = 100 points  
- Under = 1-99 points based on closeness
- Max score = 2500 (100 points x 25 questions)

## Admin Password

Default: `holiday2024`

To change it, edit `app/page.js` and find:
```js
if (adminPassword === 'holiday2024')
```
