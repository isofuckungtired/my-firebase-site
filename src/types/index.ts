
export interface ProblemHistoryItem {
  id: string; // This will be the Firestore document ID for items from Firestore, or a generated ID for local items
  problemImageUri?: string | null; // The image of the problem
  problemStatement?: string | null; // Or a textual representation if available/extracted
  solution: string;
  timestamp: number; // JavaScript timestamp (milliseconds since epoch)
  knowledgePoints?: string | null; // AI-generated knowledge points related to the solution
  userId?: string; // Optional: might be useful for some local operations or if merging
  userAttempt?: string | null; // User's attempt at solving the problem
  isIncorrectAttempt?: boolean; // Flag if AI marked the attempt as incorrect
}

export interface KnowledgeNookHistoryItem {
  id: string;
  knowledgePoints: string;
  timestamp: number;
}

export type QuizQuestionType = 'calculation' | 'fill-in-the-blank' | 'single-choice';

export interface QuizQuestion {
  id: string;
  text: string; // The question itself, e.g., "2 + 2 = ?"
  topic: string; // e.g., "數與式", "一次函數"
  questionType: QuizQuestionType;
  answer: string; // Correct answer for calculation/fill-in. For single-choice, this is the text of the correct option.
  options?: string[]; // Options for single-choice questions
  correctOptionIndex?: number; // Index of the correct option for single-choice
  explanation: string; // Detailed explanation for the question
  difficulty?: 'easy' | 'medium' | 'hard'; // Optional difficulty
}

export interface LeaderboardEntry {
  id?: string; // Firestore document ID
  userId?: string | null; // Firebase Auth User ID
  displayName: string;
  score: number;
  timestamp: number; // JavaScript timestamp
}

export interface AnsweredQuizQuestion {
  question: QuizQuestion;
  userAnswer: string;
  isCorrect: boolean;
  scoreAwarded: number;
  timeTaken: number; // for quick quiz
}

// For the new Themed Quiz
export interface AnsweredThemedQuizQuestion {
  question: QuizQuestion;
  userAnswerText: string; // User's actual input or selected option text
  isCorrect: boolean;
}


export interface Flashcard {
  id: string;
  term: string; // e.g., "畢氏定理" or "乘法公式 (和的平方)"
  definition: string; // e.g., "a² + b² = c²" or "(a+b)² = a² + 2ab + b²"
  details?: string; // e.g., "適用於直角三角形，a、b 為兩股長，c 為斜邊長" or "口訣：頭平方，尾平方，頭尾相乘兩倍強"
  imageUrl?: string; // Optional image URL for visual formulas
}

export interface FlashcardSet {
  id: string;
  title: string; // e.g., "國中重要幾何公式"
  description?: string;
  cards: Flashcard[];
}
