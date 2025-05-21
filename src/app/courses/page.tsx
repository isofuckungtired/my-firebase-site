
import type { Metadata } from 'next';
import Image from 'next/image';
import { SidebarInset } from '@/components/ui/sidebar';
import { AppFooter } from '@/components/layout/app-footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Library, ListChecks, Video, Edit3, Brain, PercentSquare, Sigma, Shapes, Film, Image as ImageIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: '課程學習區 - 公子請讀書',
  description: '依據國中數學課綱，系統化學習各章節重點。',
};

const courseCategories = [
  {
    id: 'numbers-expressions',
    title: '數與式',
    icon: Brain,
    content: [
      { title: '簡明重點整理', icon: ListChecks, details: '涵蓋數系、因數與倍數、分數與小數運算、近似值、科學記號、代數式運算等核心概念。' },
      { title: '範例解說影片', icon: Video, details: '由專業老師講解經典例題，逐步解析。（影片即將上線）' },
      { title: '選擇題 + 計算題練習', icon: Edit3, details: '大量練習題庫，鞏固學習成果。（練習題即將上線）' },
    ],
    localImageExample: true,
    aiHint: "algebra numbers"
  },
  {
    id: 'linear-functions',
    title: '一次函數及其圖形',
    icon: PercentSquare,
    content: [
      { title: '簡明重點整理', icon: ListChecks, details: '介紹函數概念、一次函數的定義、圖形特性、斜率與截距等。' },
      { title: '範例解說影片', icon: Video, details: '深入探討一次函數應用問題解法。（影片即將上線）' },
      { title: '選擇題 + 計算題練習', icon: Edit3, details: '包含圖形判讀與方程式求解練習。（練習題即將上線）' },
    ],
    youtubeEmbedExample: true,
    aiHint: "linear function graph"
  },
  {
    id: 'geometry',
    title: '幾何圖形',
    icon: Shapes,
    content: [
      { title: '簡明重點整理', icon: ListChecks, details: '包括平面圖形（點線面、角、三角形、四邊形、圓形）與立體圖形的基本性質、面積與體積計算。' },
      { title: '範例解說影片', icon: Video, details: '視覺化呈現幾何定理與圖形變換。（影片即將上線）' },
      { title: '選擇題 + 計算題練習', icon: Edit3, details: '多樣化的幾何證明與計算題型。（練習題即將上線）' },
    ],
    aiHint: "geometric shapes"
  },
  {
    id: 'probability-statistics',
    title: '機率與統計',
    icon: Sigma,
    content: [
      { title: '簡明重點整理', icon: ListChecks, details: '資料整理與圖表呈現（長條圖、折線圖、圓餅圖）、統計量（平均數、中位數、眾數）、機率基本概念與計算。' },
      { title: '範例解說影片', icon: Video, details: '結合生活實例講解統計應用與機率問題。（影片即將上線）' },
      { title: '選擇題 + 計算題練習', icon: Edit3, details: '包含資料分析與機率應用練習。（練習題即將上線）' },
    ],
    aiHint: "probability statistics"
  },
];

export default function CoursesPage() {
  const sampleYouTubeVideoId = "SlDvp8mHve4"; 

  return (
    <SidebarInset className="bg-background">
       <div className="flex flex-col flex-1 min-h-[calc(100vh-4rem)]">
        <div className="flex-1 container mx-auto p-4 md:p-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Library className="h-7 w-7 text-primary" />
                課程學習區
              </CardTitle>
              <CardDescription>
                依據國中數學課綱，系統化學習各章節重點。點選下方主題展開學習資源。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Accordion type="multiple" className="w-full space-y-4">
                {courseCategories.map(category => (
                  <AccordionItem value={category.id} key={category.id} className="border rounded-lg shadow-sm overflow-hidden">
                    <AccordionTrigger className="text-lg font-semibold px-6 py-4 hover:bg-muted/50 data-[state=open]:bg-primary/10">
                      <div className="flex items-center gap-3">
                        <category.icon className="h-6 w-6 text-primary" />
                        {category.title}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4 pt-2 space-y-3 bg-card">
                      {category.content.map(item => (
                        <div key={item.title} className="flex items-start gap-3 p-3 rounded-md border hover:border-primary/50 hover:bg-primary/5 transition-all">
                          <item.icon className="h-5 w-5 text-primary mt-1 shrink-0" />
                          <div>
                            <h4 className="font-medium text-base">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">{item.details}</p>
                          </div>
                        </div>
                      ))}
                       <div className="text-center pt-6 space-y-6">
                        {category.localImageExample && (
                          <div>
                            <h4 className="text-md font-semibold mb-2 flex items-center justify-center gap-2"><ImageIcon className="h-5 w-5 text-primary"/>圖片</h4>
                            {category.id === 'numbers-expressions' ? (
                              <>
                                <p className="text-xs text-muted-foreground mb-2">
                                  心智圖
                                </p>
                                <div className="relative aspect-[16/9] w-full max-w-md mx-auto rounded-md shadow-md overflow-hidden border bg-muted">
                                  <Image
                                    src="/images/123.jpg"
                                    alt="數與式 數字系統心智圖"
                                    data-ai-hint="number systems mind map"
                                    layout="fill"
                                    objectFit="contain"
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">「數與式」的數字系統</p>
                              </>
                            ) : (
                              <>
                                <p className="text-xs text-muted-foreground mb-2">
                                  請確保您已在 `public/images/` 資料夾中放置名為 `sample-course-image.png` 的圖片。
                                </p>
                                <div className="relative aspect-[16/9] w-full max-w-md mx-auto rounded-md shadow-md overflow-hidden border bg-muted">
                                  <Image
                                    src="/images/1.jpg"
                                    alt={`${category.title} 本地示意圖`}
                                    data-ai-hint={category.aiHint}
                                    layout="fill"
                                    objectFit="contain"
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">（這是一張本地圖片，使用 Next.js Image 元件進行優化）</p>
                              </>
                            )}
                          </div>
                        )}

                        {category.youtubeEmbedExample && (
                          <div>
                             <h4 className="text-md font-semibold mb-2 flex items-center justify-center gap-2"><Film className="h-5 w-5 text-primary"/>YouTube 影片</h4>
                            <div className="aspect-video w-full max-w-xl mx-auto rounded-md shadow-md overflow-hidden border">
                              <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${sampleYouTubeVideoId}`}
                                title="YouTube 影片播放器 - 課程範例"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                              ></iframe>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">教學範例</p>
                          </div>
                        )}

                        {!category.localImageExample && !category.youtubeEmbedExample && (
                          <div>
                             <h4 className="text-md font-semibold mb-2 flex items-center justify-center gap-2"><ImageIcon className="h-5 w-5 text-primary"/>示意圖</h4>
                            {category.id === 'geometry' ? (
                                <Image
                                    src="/images/1.jpg"
                                    alt={`${category.title} 示意圖`}
                                    data-ai-hint={category.aiHint}
                                    width={600}
                                    height={400}
                                    className="mx-auto rounded-md shadow-md border bg-muted"
                                    objectFit="contain"
                                />
                            ) : ( 
                                <Image
                                    src="/images/cover.jpg"
                                    alt={`${category.title} 示意圖 ${category.id === 'probability-statistics' ? '(預留位置)' : ''}`}
                                    data-ai-hint={category.aiHint || "math concept"}
                                    width={600}
                                    height={400}
                                    className="mx-auto rounded-md shadow-md border bg-muted"
                                    objectFit="contain"
                                />
                            )}
                            <p className="text-xs text-muted-foreground mt-2">{category.title} 主題示意圖</p>
                          </div>
                        )}
                       </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
        <AppFooter />
      </div>
    </SidebarInset>
  );
}
