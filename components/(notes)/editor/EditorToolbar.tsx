'use client';

import { type Editor } from '@tiptap/react';
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  HelpCircle,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  CheckSquare,
} from 'lucide-react';
import { type ReactElement } from 'react';

import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils/styles';

interface EditorToolbarProps {
  editor: Editor;
  onHelpClick: () => void;
}

export function EditorToolbar({ editor, onHelpClick }: EditorToolbarProps): ReactElement {
  if (!editor) {
    return <div />;
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-md border bg-background p-1">
      <ToggleGroup type="multiple" className="flex flex-wrap gap-1">
        <ToolbarButton
          active={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          icon={Heading1}
          tooltip="見出し1"
        />
        <ToolbarButton
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          icon={Heading2}
          tooltip="見出し2"
        />
        <ToolbarButton
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          icon={Heading3}
          tooltip="見出し3"
        />
        <ToolbarButton
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          icon={Bold}
          tooltip="太字"
        />
        <ToolbarButton
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          icon={Italic}
          tooltip="斜体"
        />
        <ToolbarButton
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          icon={Strikethrough}
          tooltip="取り消し線"
        />
        <ToolbarButton
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          icon={List}
          tooltip="箇条書き"
        />
        <ToolbarButton
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          icon={ListOrdered}
          tooltip="番号付きリスト"
        />
        <ToolbarButton
          active={editor.isActive('taskList')}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          icon={CheckSquare}
          tooltip="タスクリスト"
        />
        <ToolbarButton
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          icon={Quote}
          tooltip="引用"
        />
        <ToolbarButton
          active={editor.isActive('link')}
          onClick={() => {
            const url = window.prompt('URLを入力してください:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          icon={Link}
          tooltip="リンク"
        />
      </ToggleGroup>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onHelpClick}
      >
        <HelpCircle className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface ToolbarButtonProps {
  active?: boolean;
  disabled?: boolean;
  icon: typeof Bold;
  onClick: () => void;
  tooltip: string;
}

function ToolbarButton({
  active,
  disabled,
  icon: Icon,
  onClick,
  tooltip,
}: ToolbarButtonProps): ReactElement {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          size="sm"
          pressed={active}
          disabled={disabled}
          onClick={onClick}
          className={cn(
            'h-8 w-8 p-0',
            active && 'bg-accent text-accent-foreground'
          )}
        >
          <Icon className="h-4 w-4" />
        </Toggle>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
} 