'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface BriefAnalysis {
  score: number
  summary: string
  missing: string[]
  suggestions: string[]
  strengths: string[]
  design_hints: string[]
}

interface BriefAIPanelProps {
  score: number | null
  suggestions: BriefAnalysis | null
  requestId: string
}

export default function BriefAIPanel({ score, suggestions, requestId }: BriefAIPanelProps) {
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<BriefAnalysis | null>(suggestions)
  const [currentScore, setCurrentScore] = useState<number | null>(score)
  const [feedback, setFeedback] = useState<-1 | 1 | null>(null)

  const runAnalysis = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/analyze-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Analiz başarısız')
      }
      const result = await res.json()
      setAnalysis(result)
      setCurrentScore(result.score)
      toast.success('Brief analizi tamamlandı')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'AI analizi başarısız')
    } finally {
      setLoading(false)
    }
  }

  const submitFeedback = async (value: -1 | 1) => {
    setFeedback(value)
    toast.success(value === 1 ? 'Teşekkürler! Geri bildiriminiz kaydedildi.' : 'Anladık, iyileştireceğiz.')
  }

  const scoreColor =
    currentScore === null ? '' :
    currentScore >= 70 ? 'text-green-600' :
    currentScore >= 40 ? 'text-yellow-600' : 'text-red-600'

  const scoreLabel =
    currentScore === null ? '' :
    currentScore >= 70 ? 'İyi' :
    currentScore >= 40 ? 'Geliştirilmeli' : 'Yetersiz'

  return (
    <Card className="gap-0">
      <CardHeader className="pt-4 pb-3 px-4">
        <CardTitle className="text-sm flex items-center justify-center gap-2 text-center">
          🤖 AI Brief Analizi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4">
        {/* Skor */}
        {currentScore !== null && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Brief Kalitesi</span>
              <span className={cn('text-sm font-bold text-center', scoreColor)}>
                {Math.round(currentScore)}/100 — {scoreLabel}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  currentScore >= 70 ? 'bg-green-500' :
                  currentScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                )}
                style={{ width: `${currentScore}%` }}
              />
            </div>
          </div>
        )}

        {/* Özet */}
        {analysis?.summary && (
          <p className="text-xs text-muted-foreground text-center">{analysis.summary}</p>
        )}

        {/* Eksikler */}
        {analysis?.missing && analysis.missing.length > 0 && (
          <div>
            <p className="text-xs font-medium text-orange-600 mb-1">⚠ Eksik Bilgiler</p>
            <ul className="space-y-1">
              {analysis.missing.map((m, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-1">
                  <span className="shrink-0">•</span>
                  {m}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Güçlü Yönler */}
        {analysis?.strengths && analysis.strengths.length > 0 && (
          <div>
            <p className="text-xs font-medium text-green-600 mb-1">✓ Güçlü Yönler</p>
            <ul className="space-y-1">
              {analysis.strengths.map((s, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-1">
                  <span className="shrink-0">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Öneriler */}
        {analysis?.suggestions && analysis.suggestions.length > 0 && (
          <div>
            <p className="text-xs font-medium mb-1">💡 Öneriler</p>
            <ul className="space-y-1">
              {analysis.suggestions.map((s, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-1">
                  <span className="shrink-0">{i + 1}.</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Yeniden Analiz + Feedback */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={runAnalysis}
            disabled={loading}
          >
            {loading ? 'Analiz ediliyor...' : analysis ? 'Yeniden Analiz Et' : 'AI Analizi Başlat'}
          </Button>

          {analysis && (
            <div className="flex gap-1">
              <button
                onClick={() => submitFeedback(1)}
                className={cn(
                  'text-sm hover:scale-110 transition-transform',
                  feedback === 1 && 'opacity-50'
                )}
                title="Yararlı"
              >👍</button>
              <button
                onClick={() => submitFeedback(-1)}
                className={cn(
                  'text-sm hover:scale-110 transition-transform',
                  feedback === -1 && 'opacity-50'
                )}
                title="Yararsız"
              >👎</button>
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  )
}
