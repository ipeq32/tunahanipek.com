'use client';

import 'react-quill-new/dist/quill.snow.css';

import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <div className="h-48 w-full animate-pulse rounded-xl border border-border/60 bg-muted/40" />
  ),
});

// Modül/format referanslarının kararlı olması, editörün her render'da yeniden
// başlatılmamasi için modül seviyesinde tanımlanır.
const MODULES = {
  toolbar: [
    [{ header: [2, 3, 4, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
  clipboard: { matchVisual: false },
};

const FORMATS = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'code-block',
  'list',
  'link',
];

type RichTextEditorProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
};

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  return (
    <div className="rich-editor">
      <ReactQuill
        theme="snow"
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        modules={MODULES}
        formats={FORMATS}
      />
    </div>
  );
}
