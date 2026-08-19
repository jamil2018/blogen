"use client";

import type { Editor } from "@tiptap/react";
import {
  TextB,
  TextItalic,
  TextStrikethrough,
  TextUnderline,
  ListBullets,
  ListNumbers,
  Quotes,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  TextAlignLeft,
  TextAlignCenter,
  TextAlignRight,
  Highlighter,
  TextHOne,
  TextHTwo,
  TextHThree,
} from "@phosphor-icons/react";
import { Button, Toolbar } from "@heroui/react";
import { cn } from "../../lib/cn";

type EditorToolbarProps = {
  editor: Editor;
  className?: string;
};

function ToolbarButton({
  active,
  onPress,
  label,
  children,
}: {
  active?: boolean;
  onPress: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      isIconOnly
      size="sm"
      variant={active ? "secondary" : "ghost"}
      aria-label={label}
      aria-pressed={active}
      onPress={onPress}
    >
      {children}
    </Button>
  );
}

function ToolbarGroup({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("flex items-center gap-0.5", className)}
    >
      {children}
    </div>
  );
}

function ToolbarDivider() {
  return <div className="mx-1 h-6 w-px bg-border" aria-hidden />;
}

export default function EditorToolbar({ editor, className }: EditorToolbarProps) {
  const setLink = () => {
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("URL", prev);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt("Image URL");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <Toolbar
      className={cn(
        "flex-wrap gap-y-2 border-b border-border bg-zinc-50/80 p-2 dark:bg-zinc-900/40",
        className
      )}
    >
      <ToolbarGroup label="Text formatting">
        <ToolbarButton
          label="Bold"
          active={editor.isActive("bold")}
          onPress={() => editor.chain().focus().toggleBold().run()}
        >
          <TextB className="size-4" weight="bold" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor.isActive("italic")}
          onPress={() => editor.chain().focus().toggleItalic().run()}
        >
          <TextItalic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Underline"
          active={editor.isActive("underline")}
          onPress={() => editor.chain().focus().toggleUnderline().run()}
        >
          <TextUnderline className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Strike"
          active={editor.isActive("strike")}
          onPress={() => editor.chain().focus().toggleStrike().run()}
        >
          <TextStrikethrough className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Highlight"
          active={editor.isActive("highlight")}
          onPress={() => editor.chain().focus().toggleHighlight().run()}
        >
          <Highlighter className="size-4" />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      <ToolbarGroup label="Headings">
        <ToolbarButton
          label="Heading 1"
          active={editor.isActive("heading", { level: 1 })}
          onPress={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <TextHOne className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onPress={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <TextHTwo className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onPress={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <TextHThree className="size-4" />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      <ToolbarGroup label="Lists and blocks">
        <ToolbarButton
          label="Bullet list"
          active={editor.isActive("bulletList")}
          onPress={() => editor.chain().focus().toggleBulletList().run()}
        >
          <ListBullets className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Ordered list"
          active={editor.isActive("orderedList")}
          onPress={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListNumbers className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Blockquote"
          active={editor.isActive("blockquote")}
          onPress={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quotes className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Code block"
          active={editor.isActive("codeBlock")}
          onPress={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code className="size-4" />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      <ToolbarGroup label="Media and links">
        <ToolbarButton
          label="Link"
          active={editor.isActive("link")}
          onPress={setLink}
        >
          <LinkIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Image" onPress={addImage}>
          <ImageIcon className="size-4" />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      <ToolbarGroup label="Alignment">
        <ToolbarButton
          label="Align left"
          active={editor.isActive({ textAlign: "left" })}
          onPress={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <TextAlignLeft className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Align center"
          active={editor.isActive({ textAlign: "center" })}
          onPress={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <TextAlignCenter className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Align right"
          active={editor.isActive({ textAlign: "right" })}
          onPress={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <TextAlignRight className="size-4" />
        </ToolbarButton>
      </ToolbarGroup>
    </Toolbar>
  );
}
