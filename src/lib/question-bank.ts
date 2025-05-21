
import type { QuizQuestion } from '@/types';

// Renamed from sampleQuestions to masterQuestionBank
export const masterQuestionBank: QuizQuestion[] = [
  // 數與式 (Numbers and Expressions)
  { id: 'q1', topic: '數與式', questionType: 'calculation', text: '計算：(-5) + 7 = ?', answer: '2', explanation: '負五加上七，相當於從七中減去五，所以答案是二。或者在數線上，從 -5 向右移動 7 個單位到達 2。' },
  { id: 'q2', topic: '數與式', questionType: 'calculation', text: '計算：12 - (-4) = ?', answer: '16', explanation: '減去一個負數等於加上其對應的正數。所以 12 - (-4) 等於 12 + 4，答案是 16。' },
  { id: 'q3', topic: '數與式', questionType: 'calculation', text: '計算：(-3) * (-6) = ?', answer: '18', explanation: '兩個負數相乘的結果是正數。3 乘以 6 等於 18，所以 (-3) 乘以 (-6) 等於 18。' },
  { id: 'q4', topic: '數與式', questionType: 'calculation', text: '計算：(-20) / 5 = ?', answer: '-4', explanation: '一個負數除以一個正數的結果是負數。20 除以 5 等於 4，所以 (-20) 除以 5 等於 -4。' },
  { id: 'q5', topic: '數與式', questionType: 'calculation', text: '計算：(2/3) + (1/6) = ? (請用最簡分數表示，例如 a/b)', answer: '5/6', explanation: '分數相加需要先通分。2/3 可以化為 4/6。然後 4/6 + 1/6 = (4+1)/6 = 5/6。這是最簡分數。' },
  { id: 'q6', topic: '數與式', questionType: 'calculation', text: '計算：0.5 * 0.2 = ?', answer: '0.1', explanation: '小數乘法：5 乘以 2 等於 10。由於 0.5 有一位小數，0.2 有一位小數，所以乘積共有 1+1=2 位小數。因此，0.5 * 0.2 = 0.10，即 0.1。' },
  { id: 'q7', topic: '數與式', questionType: 'calculation', text: '計算：2³ = ?', answer: '8', explanation: '2³ 表示 2 乘以自身三次，即 2 * 2 * 2。2*2 = 4，然後 4*2 = 8。' },
  { id: 'q8', topic: '數與式', questionType: 'calculation', text: '將 0.00052 用科學記號表示。 (格式：a*10^b)', answer: '5.2*10^-4', explanation: '科學記號的形式是 a × 10^n，其中 1 ≤ |a| < 10。將小數點向右移動 4 位得到 5.2，所以指數是 -4。因此是 5.2 × 10⁻⁴。' },
  { id: 'q9', topic: '數與式', questionType: 'calculation', text: '若 x = -2，則 3x + 5 = ?', answer: '-1', explanation: '將 x = -2 代入表達式：3*(-2) + 5 = -6 + 5 = -1。' },
  { id: 'q10', topic: '數與式', questionType: 'calculation', text: '化簡：2(x - 3) + 3(x + 1) = ? (格式：ax+b 或 ax-b)', answer: '5x-3', explanation: '使用分配律展開：2x - 6 + 3x + 3。合併同類項：(2x + 3x) + (-6 + 3) = 5x - 3。' },
  { id: 'q11', topic: '數與式', questionType: 'single-choice', text: '下列何者為質數？', options: ['1', '4', '7', '9'], answer: '7', correctOptionIndex: 2, explanation: '質數是指大於1的自然數中，除了1和自身以外無法被其他自然數整除的數。1不是質數也不是合數；4可以被2整除；9可以被3整除；7只能被1和7整除，所以7是質數。' },
  { id: 'q12', topic: '數與式', questionType: 'fill-in-the-blank', text: '|-5| 的值是多少？', answer: '5', explanation: '絕對值表示一個數在數線上與原點的距離，所以 |-5| = 5。' },
  { 
    id: 'wp1', 
    topic: '數與式', 
    questionType: 'calculation', 
    text: '小華的媽媽給了他 200 元零用錢。他先去文具店買了一支 35 元的原子筆和一本 50 元的筆記本。之後，他又去超商買了一瓶 25 元的飲料。請問小華最後剩下多少錢？', 
    answer: '90', 
    explanation: '這是一個關於金錢計算的應用問題。\n1. 首先計算小華花掉的總金額：原子筆 35 元 + 筆記本 50 元 + 飲料 25 元 = 110 元。\n2. 然後從媽媽給的零用錢中減去花掉的總金額：200 元 - 110 元 = 90 元。\n所以，小華最後剩下 90 元。算式可以列為：200 - (35 + 50 + 25) = 200 - 110 = 90。' 
  },

  // 一元一次方程式 (Linear Equations in One Variable)
  { id: 'eq1', topic: '一元一次方程式', questionType: 'calculation', text: '解方程式：2x + 5 = 11，x = ?', answer: '3', explanation: '移項：2x = 11 - 5，得到 2x = 6。兩邊同除以 2：x = 6 / 2 = 3。' },
  { id: 'eq2', topic: '一元一次方程式', questionType: 'calculation', text: '解方程式：(x/3) - 1 = 2，x = ?', answer: '9', explanation: '移項：x/3 = 2 + 1，得到 x/3 = 3。兩邊同乘以 3：x = 3 * 3 = 9。' },
  { id: 'eq3', topic: '一元一次方程式', questionType: 'single-choice', text: '如果 3x - 7 = 5，那麼 x 等於多少？', options: ['3', '4', '5', '6'], answer: '4', correctOptionIndex: 1, explanation: '3x - 7 = 5  =>  3x = 5 + 7  =>  3x = 12  => x = 12 / 3  => x = 4。' },
  { 
    id: 'wp_eq1', 
    topic: '一元一次方程式', 
    questionType: 'calculation', 
    text: '一個長方形的周長是 30 公分，已知長比寬多 3 公分。請問這個長方形的寬是多少公分？', 
    answer: '6', 
    explanation: '這是一個需要利用一元一次方程式解決的應用問題。\n1. 假設寬是 x 公分，則長是 (x+3) 公分。\n2. 長方形的周長公式是 2 * (長 + 寬)。\n3. 根據題意列出方程式：2 * ((x+3) + x) = 30。\n4. 化簡方程式：2 * (2x + 3) = 30  =>  4x + 6 = 30。\n5. 解方程式：4x = 30 - 6  =>  4x = 24  =>  x = 24 / 4 = 6。\n所以，長方形的寬是 6 公分。驗算：長是 6+3=9 公分，周長是 2*(9+6) = 2*15 = 30 公分，符合題意。' 
  },


  // 二元一次聯立方程式 (Systems of Linear Equations in Two Variables) - 簡化為求單一值
  { id: 'sys_eq1', topic: '二元一次聯立方程式', questionType: 'calculation', text: '若 x + y = 5 且 x - y = 1，則 x = ?', answer: '3', explanation: '兩式相加：(x+y) + (x-y) = 5+1，得到 2x = 6，所以 x = 3。' },

  // 不等式 (Inequalities) - 簡化為求範圍
  { id: 'ineq1', topic: '不等式', questionType: 'calculation', text: '解不等式：2x - 1 > 7，x 的範圍是？ (格式：x>a, x<a, x>=a, x<=a)', answer: 'x>4', explanation: '移項：2x > 7 + 1，得到 2x > 8。兩邊同除以正數 2，不等號方向不變：x > 4。' },
  
  // 乘法公式與多項式 (Multiplication Formulas and Polynomials)
  { id: 'poly1', topic: '乘法公式與多項式', questionType: 'calculation', text: '計算：(x + 2)² = ? (格式：ax^2+bx+c)', answer: 'x^2+4x+4', explanation: '使用完全平方公式 (a+b)² = a² + 2ab + b²。這裡 a=x, b=2。所以 (x+2)² = x² + 2*x*2 + 2² = x² + 4x + 4。' },
  { id: 'poly2', topic: '乘法公式與多項式', questionType: 'calculation', text: '計算：(a - 3)(a + 3) = ? (格式：ax^2-b)', answer: 'a^2-9', explanation: '使用平方差公式 (a-b)(a+b) = a² - b²。這裡第一個 a 是公式中的 a，b=3。所以 (a-3)(a+3) = a² - 3² = a² - 9。' },

  // 平方根與畢氏定理 (Square Roots and Pythagorean Theorem)
  { id: 'sqrt1', topic: '平方根與畢氏定理', questionType: 'calculation', text: '√49 = ?', answer: '7', explanation: '49 的平方根是 7，因為 7 * 7 = 49。' },
  { id: 'pyth1', topic: '平方根與畢氏定理', questionType: 'calculation', text: '直角三角形兩股長為 3 和 4，斜邊長為多少？', answer: '5', explanation: '根據畢氏定理 a² + b² = c²。3² + 4² = 9 + 16 = 25。c² = 25，所以 c = √25 = 5。' },
  { id: 'pyth2', topic: '平方根與畢氏定理', questionType: 'single-choice', text: '一個直角三角形的斜邊長為 13，一股長為 5，另一股長為多少？', options: ['8', '10', '12', '14'], answer: '12', correctOptionIndex: 2, explanation: '設另一股長為 b。根據畢氏定理，5² + b² = 13² => 25 + b² = 169 => b² = 169 - 25 => b² = 144 => b = 12。' },

  // 函數及其圖形 (Functions and their Graphs)
  { id: 'func1', topic: '函數及其圖形', questionType: 'calculation', text: '函數 f(x) = 2x - 1，則 f(3) = ?', answer: '5', explanation: '將 x=3 代入函數表達式：f(3) = 2*(3) - 1 = 6 - 1 = 5。' },
  { id: 'func2', topic: '函數及其圖形', questionType: 'calculation', text: '一次函數 y = 3x + 2 的圖形在 y 軸上的截距是多少？', answer: '2', explanation: '一次函數 y = mx + c 的圖形在 y 軸上的截距是 c。在此題中 c=2。' },
  { id: 'func3', topic: '函數及其圖形', questionType: 'single-choice', text: '一次函數 y = -2x + 4 的圖形不通過第幾象限？', options: ['第一象限', '第二象限', '第三象限', '第四象限'], answer: '第三象限', correctOptionIndex: 2, explanation: '當 x=0, y=4 (y軸截距)。當 y=0, -2x+4=0, 2x=4, x=2 (x軸截距)。此線通過 (0,4) 和 (2,0)，斜率為負，因此圖形通過第一、二、四象限，不通過第三象限。' },

  // 幾何 (Geometry)
  { id: 'geo1', topic: '幾何圖形', questionType: 'calculation', text: '一個正方形的邊長是 6 公分，它的周長是多少公分？', answer: '24', explanation: '正方形的周長等於邊長乘以 4。所以周長 = 6 * 4 = 24 公分。' },
  { id: 'geo2', topic: '幾何圖形', questionType: 'calculation', text: '一個圓的半徑是 5 公分，它的面積是多少平方公分？(圓周率用π表示，格式：數字π)', answer: '25π', explanation: '圓的面積公式是 A = πr²。半徑 r=5，所以面積 = π * 5² = 25π 平方公分。' },
  { id: 'geo3', topic: '幾何圖形', questionType: 'calculation', text: '三角形內角和是多少度？', answer: '180', explanation: '任何三角形的內角總和都是 180 度。' },
  { id: 'geo4', topic: '幾何圖形', questionType: 'calculation', text: '一個長方體的長、寬、高分別是 2、3、4 公分，它的體積是多少立方公分？', answer: '24', explanation: '長方體的體積等於長乘以寬乘以高。所以體積 = 2 * 3 * 4 = 24 立方公分。' },
  { id: 'geo5', topic: '幾何圖形', questionType: 'single-choice', text: '下列哪個圖形一定是線對稱圖形但不是點對稱圖形？', options: ['圓形', '正方形', '等腰梯形', '平行四邊形'], answer: '等腰梯形', correctOptionIndex: 2, explanation: '圓形和正方形既是線對稱也是點對稱；平行四邊形是點對稱但不一定是線對稱；等腰梯形是線對稱（對稱軸是兩底中點的連線），但通常不是點對稱。' },
  {
    id: 'wp_geo1',
    topic: '幾何圖形',
    questionType: 'calculation',
    text: '一個三角形的底是 10 公分，高是 6 公分。如果將底增加 2 公分，高減少 1 公分，新的三角形面積會是多少平方公分？',
    answer: '30',
    explanation: '1. 計算原始三角形面積：(底 × 高) / 2 = (10 × 6) / 2 = 60 / 2 = 30 平方公分。\n2. 計算新的底和高：新底 = 10 + 2 = 12 公分；新高 = 6 - 1 = 5 公分。\n3. 計算新的三角形面積：(新底 × 新高) / 2 = (12 × 5) / 2 = 60 / 2 = 30 平方公分。\n所以，新的三角形面積仍然是 30 平方公分。'
  },

  // 統計與機率 (Statistics and Probability)
  { id: 'stat1', topic: '統計與機率', questionType: 'calculation', text: '數據 2, 3, 3, 4, 8 的平均數是多少？', answer: '4', explanation: '平均數等於所有數據之和除以數據個數。(2+3+3+4+8) / 5 = 20 / 5 = 4。' },
  { id: 'stat2', topic: '統計與機率', questionType: 'calculation', text: '數據 1, 2, 2, 3, 5 的中位數是多少？', answer: '2', explanation: '首先將數據排序（已排序）：1, 2, 2, 3, 5。中位數是位於中間位置的數。由於有 5 個數據，中間位置是第 (5+1)/2 = 3 個數，即 2。' },
  { id: 'prob1', topic: '統計與機率', questionType: 'calculation', text: '擲一顆公正的骰子，出現點數 6 的機率是多少？(格式：a/b)', answer: '1/6', explanation: '公正的骰子有 6 個面，每個面出現的機率相等。出現點數 6 的情況只有一種，所以機率是 1/6。' },
  { id: 'stat3', topic: '統計與機率', questionType: 'single-choice', text: '投擲一枚硬幣兩次，恰好出現一次正面的機率是多少？', options: ['1/4', '1/3', '1/2', '3/4'], answer: '1/2', correctOptionIndex: 2, explanation: '投擲兩次硬幣的可能結果有 (正,正), (正,反), (反,正), (反,反)，共4種。恰好出現一次正面的情況有 (正,反) 和 (反,正)，共2種。所以機率是 2/4 = 1/2。' },
];

// Function to get a random question for Quick Quiz, ensuring not to repeat within a session if needed
export function getRandomQuestion(answeredQuestionIds: string[] = []): QuizQuestion | null {
  const availableQuestions = masterQuestionBank.filter(q => !answeredQuestionIds.includes(q.id));
  if (availableQuestions.length === 0) {
    if (masterQuestionBank.length === 0) return null;
    // If all questions answered, allow repeats from the full bank for continuous play
    const randomIndex = Math.floor(Math.random() * masterQuestionBank.length);
    return masterQuestionBank[randomIndex];
  }
  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  return availableQuestions[randomIndex];
}

export const TOTAL_QUICK_QUIZ_QUESTIONS = 10;
export const TIME_PER_QUICK_QUIZ_QUESTION = 30;

// Function to get questions for a themed quiz
export function getThemedQuizQuestions(topic: string, count: number = 5): QuizQuestion[] {
  const questionsOfTopic = masterQuestionBank.filter(q => q.topic === topic);
  // Shuffle and pick 'count' questions
  const shuffled = questionsOfTopic.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function getAvailableTopics(): string[] {
  const topics = new Set(masterQuestionBank.map(q => q.topic));
  return Array.from(topics);
}
