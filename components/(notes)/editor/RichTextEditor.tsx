'use client';

import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { X } from 'lucide-react';
import { type ReactElement, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/styles';

import { EditorToolbar } from './EditorToolbar';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'メモを入力...',
  className,
  readOnly = false,
}: RichTextEditorProps): ReactElement {
  const [showHelp, setShowHelp] = useState(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Highlight,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className={cn('flex gap-4', className)}>
      <div className="flex-1 flex flex-col gap-2">
        {!readOnly && editor && (
          <EditorToolbar 
            editor={editor} 
            onHelpClick={() => setShowHelp(!showHelp)} 
          />
        )}
        <EditorContent
          editor={editor}
          className={cn(
            'prose prose-sm max-w-none dark:prose-invert',
            'min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2',
            'focus-visible:outline-none',
            readOnly && 'border-none px-0'
          )}
        />
      </div>

      {showHelp && (
        <div 
          className="fixed right-4 top-4 w-72 shrink-0 rounded-md border bg-card p-4 text-sm space-y-4 shadow-lg z-50"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-medium">エディタの使い方</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setShowHelp(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <h4 className="font-medium mb-2">ショートカットキー</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li><kbd className="px-1 rounded bg-muted">Cmd</kbd> + <kbd className="px-1 rounded bg-muted">B</kbd> - 太字</li>
              <li><kbd className="px-1 rounded bg-muted">Cmd</kbd> + <kbd className="px-1 rounded bg-muted">I</kbd> - 斜体</li>
              <li><kbd className="px-1 rounded bg-muted">Cmd</kbd> + <kbd className="px-1 rounded bg-muted">Shift</kbd> + <kbd className="px-1 rounded bg-muted">X</kbd> - 取り消し線</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">リストの使い方</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• リストの中でEnterを2回押すと終了</li>
              <li>• タブキーでインデントを追加</li>
              <li>• Shift + タブでインデントを減らす</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">タスクリスト</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• チェックボックスをクリックで完了/未完了</li>
              <li>• タブキーで子タスクを作成</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">リンク</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• テキストを選択してリンクボタンをクリック</li>
              <li>• または、URLを入力後にテキストを選択</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 