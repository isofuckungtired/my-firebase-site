
// src/lib/flashcard-data.ts
import type { FlashcardSet } from '@/types';

export const sampleFlashcardSets: FlashcardSet[] = [
  {
    id: 'algebra-formulas',
    title: '常用代數公式',
    description: '國中階段常見的代數乘法與因式分解公式。',
    cards: [
      {
        id: 'alg-1',
        term: '和的平方公式',
        definition: '(a+b)² = a² + 2ab + b²',
        details: '口訣：頭平方，尾平方，頭尾相乘兩倍強。',
      },
      {
        id: 'alg-2',
        term: '差的平方公式',
        definition: '(a-b)² = a² - 2ab + b²',
        details: '口訣：頭平方，尾平方，頭尾相乘變號兩倍強。',
      },
      {
        id: 'alg-3',
        term: '平方差公式',
        definition: 'a² - b² = (a+b)(a-b)',
        details: '常用於因式分解或簡化計算。結構：兩數平方之差，等於兩數和乘以兩數差。',
      },
      {
        id: 'alg-4',
        term: '立方和公式',
        definition: 'a³ + b³ = (a+b)(a² - ab + b²)',
        details: '高中範圍，但有時會在國中進階題目中出現。口訣：和立方，先相加，平方相減再平方。',
      },
      {
        id: 'alg-5',
        term: '立方差公式',
        definition: 'a³ - b³ = (a-b)(a² + ab + b²)',
        details: '高中範圍，但有時會在國中進階題目中出現。口訣：差立方，先相減，平方相加再平方。',
      },
    ],
  },
  {
    id: 'plane-geometry-area',
    title: '平面圖形面積公式',
    description: '國中常見平面幾何圖形的面積計算公式。',
    cards: [
      {
        id: 'geo-area-1',
        term: '正方形面積',
        definition: '邊長 × 邊長 (a²)',
        details: '若邊長為 a，則面積為 a²。',
      },
      {
        id: 'geo-area-2',
        term: '長方形面積',
        definition: '長 × 寬 (l × w)',
        details: '若長為 l，寬為 w，則面積為 lw。',
      },
      {
        id: 'geo-area-3',
        term: '三角形面積',
        definition: '(底 × 高) / 2',
        details: '適用於所有三角形。高是從頂點到底邊的垂直距離。',
      },
      {
        id: 'geo-area-4',
        term: '平行四邊形面積',
        definition: '底 × 高',
        details: '高是兩平行底邊之間的垂直距離。',
      },
      {
        id: 'geo-area-5',
        term: '梯形面積',
        definition: '((上底 + 下底) × 高) / 2',
        details: '上底和下底是互相平行的兩邊。',
      },
      {
        id: 'geo-area-6',
        term: '圓形面積',
        definition: 'π × 半徑² (πr²)',
        details: 'π 約等於 3.14159。r 是圓的半徑。',
      },
      {
        id: 'geo-area-7',
        term: '菱形面積',
        definition: '(對角線1 × 對角線2) / 2',
        details: '適用於菱形，也適用於箏形。',
      },
    ],
  },
  {
    id: 'pythagorean-theorem',
    title: '畢氏定理 (勾股定理)',
    description: '直角三角形邊長關係的重要定理。',
    cards: [
      {
        id: 'pyth-1',
        term: '畢氏定理',
        definition: 'a² + b² = c²',
        details: '在直角三角形中，兩股長的平方和等於斜邊長的平方。a、b 為兩股長，c 為斜邊長。',
      },
      {
        id: 'pyth-2',
        term: '常見畢氏數組 (3, 4, 5)',
        definition: '3² + 4² = 5² (9 + 16 = 25)',
        details: '這是最常見的整數畢氏數組。其倍數也是畢氏數組，如 (6, 8, 10)。',
      },
      {
        id: 'pyth-3',
        term: '常見畢氏數組 (5, 12, 13)',
        definition: '5² + 12² = 13² (25 + 144 = 169)',
        details: '另一個常見的整數畢氏數組。',
      },
    ],
  },
];
