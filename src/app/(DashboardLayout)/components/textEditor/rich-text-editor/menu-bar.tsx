import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Strikethrough,
} from "lucide-react";
import { Toggle } from "../ui/toggle";
import { Editor } from "@tiptap/react";

export default function MenuBar({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return null;
  }

  // Hàm kiểm tra xem có văn bản được chọn hay không
  const hasSelection = () => {
    return !editor.state.selection.empty;
  };

  // Hàm xử lý heading chỉ cho phần văn bản được chọn
  const handleHeading = (level: 1 | 2 | 3) => {
    if (!hasSelection()) {
      // Nếu không có văn bản được chọn, áp dụng cho toàn bộ đoạn văn (hành vi mặc định)
      editor.chain().focus().toggleHeading({ level }).run();
      return;
    }

    // Lấy thông tin về selection
    const { from, to } = editor.state.selection;
    
    // Lưu trữ nội dung được chọn
    const selectedText = editor.state.doc.textBetween(from, to);
    
    // Xóa nội dung được chọn
    editor.chain().focus().deleteSelection().run();
    
    // Chèn một đoạn văn mới với định dạng heading tại vị trí con trỏ
    editor.chain().focus().insertContent({
      type: 'heading',
      attrs: { level },
      content: [{ type: 'text', text: selectedText }]
    }).run();
  };

  const Options = [
    {
      icon: <Heading1 className="size-4" />,
      onClick: () => handleHeading(1),
      preesed: editor.isActive("heading", { level: 1 }),
    },
    {
      icon: <Heading2 className="size-4" />,
      onClick: () => handleHeading(2),
      preesed: editor.isActive("heading", { level: 2 }),
    },
    {
      icon: <Heading3 className="size-4" />,
      onClick: () => handleHeading(3),
      preesed: editor.isActive("heading", { level: 3 }),
    },
    // Các options khác giữ nguyên
    {
      icon: <Bold className="size-4" />,
      onClick: () => editor.chain().focus().toggleBold().run(),
      preesed: editor.isActive("bold"),
    },
    {
      icon: <Italic className="size-4" />,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      preesed: editor.isActive("italic"),
    },
    {
      icon: <Strikethrough className="size-4" />,
      onClick: () => editor.chain().focus().toggleStrike().run(),
      preesed: editor.isActive("strike"),
    },
    {
      icon: <AlignLeft className="size-4" />,
      onClick: () => editor.chain().focus().setTextAlign("left").run(),
      preesed: editor.isActive({ textAlign: "left" }),
    },
    {
      icon: <AlignCenter className="size-4" />,
      onClick: () => editor.chain().focus().setTextAlign("center").run(),
      preesed: editor.isActive({ textAlign: "center" }),
    },
    {
      icon: <AlignRight className="size-4" />,
      onClick: () => editor.chain().focus().setTextAlign("right").run(),
      preesed: editor.isActive({ textAlign: "right" }),
    },
    {
      icon: <List className="size-4" />,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      preesed: editor.isActive("bulletList"),
    },
    {
      icon: <ListOrdered className="size-4" />,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      preesed: editor.isActive("orderedList"),
    },
    {
      icon: <Highlighter className="size-4" />,
      onClick: () => editor.chain().focus().toggleHighlight().run(),
      preesed: editor.isActive("highlight"),
    },
  ];

  return (
    <div className="border rounded-md p-1 mb-1 bg-slate-50 space-x-2 z-50">
      {Options.map((option, index) => (
        <Toggle
          key={index}
          pressed={option.preesed}
          onPressedChange={option.onClick}
        >
          {option.icon}
        </Toggle>
      ))}
    </div>
  );
}
