'use client';

import { Loader2, Sparkles } from 'lucide-react';
import { type ReactElement, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { analyzeNoteContent } from '@/lib/ai/analyzers/note-analyzer';
import { useAIStore } from '@/store/aiStore';
import { Note } from '@/types/note';

interface NoteAnalysisProps {
  note: Note;
}

export function NoteAnalysis({ note }: NoteAnalysisProps): ReactElement {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    summary: string;
    keyPoints: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
  } | null>(null);
  const { getActiveProvider } = useAIStore();

  const handleAnalyze = async (): Promise<void> => {
    try {
      setIsAnalyzing(true);
      const provider = getActiveProvider();
      if (!provider.isEnabled) {
        toast.error('AI機能が無効です');
        return;
      }

      const result = await analyzeNoteContent(note.title, note.content, provider);
      setAnalysis({
        summary: result.summary,
        keyPoints: result.keyPoints,
        sentiment: result.sentiment,
      });
    } catch (error) {
      console.error('Failed to analyze note:', error);
      toast.error('メモの分析に失敗しました');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>AI分析</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            分析する
          </Button>
        </CardTitle>
        <CardDescription>
          AIを使用してメモの内容を分析します
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {analysis ? (
          <>
            <div>
              <h4 className="mb-2 font-medium">要約</h4>
              <p className="text-sm text-muted-foreground">{analysis.summary}</p>
            </div>

            <div>
              <h4 className="mb-2 font-medium">重要ポイント</h4>
              <ul className="list-inside list-disc space-y-1">
                {analysis.keyPoints.map((point, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-2 font-medium">感情分析</h4>
              <span
                className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                  analysis.sentiment === 'positive'
                    ? 'bg-emerald-500/20 text-emerald-500'
                    : analysis.sentiment === 'negative'
                      ? 'bg-rose-500/20 text-rose-500'
                      : 'bg-zinc-500/20 text-zinc-500'
                }`}
              >
                {analysis.sentiment === 'positive'
                  ? 'ポジティブ'
                  : analysis.sentiment === 'negative'
                    ? 'ネガティブ'
                    : 'ニュートラル'}
              </span>
            </div>
          </>
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            {isAnalyzing
              ? '分析中...'
              : '「分析する」ボタンをクリックしてメモを分析します'}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 