export const quotes = [
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Don't watch the clock; do what it does. Keep going.",
  "The only way to do great work is to love what you do.",
  "Consistency is the key to mastery. Show up every day.",
  "Your streak is a reflection of your commitment to growth.",
  "Small daily improvements over time lead to stunning results.",
  "The secret of getting ahead is getting started.",
  "Don't let yesterday take up too much of today.",
  "It always seems impossible until it's done.",
  "Mastery is a journey, not a destination.",
  "Believe you can and you're halfway there.",
  "The future depends on what you do today.",
  "Focus on progress, not perfection.",
  "Every challenge is an opportunity to learn.",
  "Build habits that your future self will thank you for.",
  "Dream big. Start small. But most importantly, start.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Your only limit is your mind.",
  "Wake up with determination. Go to bed with satisfaction.",
  "Discipline is choosing between what you want now and what you want most.",
  "A river cuts through rock, not because of its power, but because of its persistence.",
  "Knowledge is power, but practice is mastery.",
  "Don't be afraid to give up the good to go for the great.",
  "Success usually comes to those who are too busy to be looking for it.",
  "Opportunities don't happen. You create them.",
  "The only person you should try to be better than is the person you were yesterday.",
  "The way to get started is to quit talking and begin doing.",
  "Action is the foundational key to all success.",
  "Start where you are. Use what you have. Do what you can.",
  "You don't have to be great to start, but you have to start to be great."
];

export function getQuoteOfDay() {
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  return quotes[dayOfYear % quotes.length];
}
