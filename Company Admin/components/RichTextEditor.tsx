"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect } from "react";
import StarterKit from "@tiptap/starter-kit";
import CharacterCount from "@tiptap/extension-character-count";

type Props = {
    value: string;
    onChange: (val: string) => void;
    limit?: number;
};

export default function RichTextEditor({ value, onChange, limit }: Props) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: {
                    keepMarks: true,
                    keepAttributes: true,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: true,
                },
            }),
            CharacterCount.configure({
                limit: limit,
            }),
        ],
        content: value,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class:
                    "prose dark:prose-invert prose-sm max-w-none focus:outline-none px-3 py-2 text-foreground min-h-full",
            },
        },
        onUpdate({ editor }) {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
    if (!editor) return;

    const current = editor.getHTML();

    if (current !== value) {
        editor.commands.setContent(value || "");
    }
}, [value, editor]);


    if (!editor) return null;

    return (
        <div className="border border-border bg-background flex flex-col text-foreground h-full overflow-hidden">
            {/* TOOLBAR */}
            <div className="flex items-center gap-1 border-b border-border bg-muted px-2 py-1 text-sm">
                <ToolbarButton
                    active={editor.isActive("bold")}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    label="B"
                    bold
                />
                <ToolbarButton
                    active={editor.isActive("italic")}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    label="I"
                    italic
                />
                <ToolbarButton
                    active={editor.isActive("bulletList")}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    label="• List"
                />
                <ToolbarButton
                    active={editor.isActive("orderedList")}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    label="1. List"
                />
            </div>

            {/* EDITOR */}
            <EditorContent
    editor={editor}
    className="flex-1 overflow-y-auto"
/>

            {/* CHARACTER COUNT */}
            {limit && (
                <div className="border-t border-border bg-muted px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex justify-end">
                    {editor.storage.characterCount.characters()} / {limit} characters
                </div>
            )}
        </div>
    );
}

/* ---------- Toolbar Button ---------- */
function ToolbarButton({
    onClick,
    label,
    active,
    bold,
    italic,
}: any) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-2 py-1 border border-border text-xs rounded-sm transition-colors
${active
                    ? "bg-orange-600 text-white"
                    : "bg-background text-foreground hover:bg-muted"
                }`}
            style={{
                fontWeight: bold ? "bold" : undefined,
                fontStyle: italic ? "italic" : undefined,
            }}
        >
            {label}
        </button>
    );
}
