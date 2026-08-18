import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import type { Extensions } from "@tiptap/react";

export function getTiptapExtensions(placeholder = "Write your post…"): Extensions {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    Underline,
    Link.configure({ openOnClick: false }),
    Image,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Highlight,
    Placeholder.configure({ placeholder }),
  ];
}
