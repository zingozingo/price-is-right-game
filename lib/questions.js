export const QUESTIONS = [
  { id: 1, question: "How many dimples does an average golf ball have?", answer: 336 },
  { id: 2, question: "How many miles of blood vessels are in the human body?", answer: 60000 },
  { id: 3, question: "How many years old is Jonathan, the oldest known tortoise?", answer: 190 },
  { id: 4, question: "How many pounds did the world's largest pumpkin weigh?", answer: 2749 },
  { id: 5, question: "How many inches of snow fell in the deepest one-day snowfall ever recorded in the U.S.?", answer: 76 },
  { id: 6, question: "How many inches wide was the largest snowflake ever recorded?", answer: 15 },
  { id: 7, question: "At what air temperature (in F) does human breath start to become visible?", answer: 45 },
  { id: 8, question: "How many calories can a person burn by shivering for one hour?", answer: 450 },
  { id: 9, question: "How many inches thick should lake ice be to safely support a car?", answer: 10 },
  { id: 10, question: "What was the lowest wind chill temperature ever recorded in the United States (in F)?", answer: -109 },
  { id: 11, question: "How many pounds of snow are in an average three-ball snowman?", answer: 350 },
  { id: 12, question: "How many candles would it take to raise the temperature of a small room by 1F?", answer: 40 },
  { id: 13, question: "In what year did Amazon Prime launch?", answer: 2005 },
  { id: 14, question: "How many employees did Amazon have in 1996?", answer: 151 },
  { id: 15, question: "What were Amazon's total sales in 1998 (in millions of dollars)?", answer: 610 },
  { id: 16, question: "During its big 2016 expansion, Amazon Prime Video launched in how many countries?", answer: 200 },
  { id: 17, question: "How many hours per year does the average office worker spend waiting for their computer to load?", answer: 22 },
  { id: 18, question: "How many miles does the average person walk over their lifetime?", answer: 110000 },
  { id: 19, question: "How many miles per hour was the fastest tennis serve ever recorded?", answer: 157 },
  { id: 20, question: "How many feet long is the world's longest single escalator?", answer: 367 },
  { id: 21, question: "How many Google searches happen every second worldwide?", answer: 99000 },
  { id: 22, question: "How many hours of video are uploaded to YouTube worldwide every six hours?", answer: 180000 },
  { id: 23, question: "How many years passed between the completion of the Great Pyramid of Giza and the birth of Cleopatra?", answer: 2530 },
  { id: 24, question: "How many billion people are estimated to have ever lived on Earth in total?", answer: 117 },
  { id: 25, question: "For about how many years have anatomically modern humans (Homo sapiens) existed?", answer: 300000 }
];

export const calculateScore = (guess, actual) => {
  if (guess === null || guess === undefined || guess === '') return 0;
  const numGuess = Number(guess);
  if (isNaN(numGuess)) return 0;
  if (numGuess > actual) return 0;
  if (numGuess === actual) return 100;
  
  const difference = actual - numGuess;
  const percentOff = difference / Math.abs(actual);
  
  if (percentOff >= 0.5) return Math.max(1, Math.floor(10 * (1 - percentOff)));
  
  const score = Math.floor(99 * (1 - percentOff * 2));
  return Math.max(1, score);
};

export const calculateTotalScore = (answers) => {
  return QUESTIONS.reduce((total, q) => {
    return total + calculateScore(answers[q.id], q.answer);
  }, 0);
};
