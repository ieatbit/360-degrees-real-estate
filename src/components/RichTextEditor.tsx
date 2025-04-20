'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="h-64 border rounded-md animate-pulse bg-gray-100"></div>
});

// Import Quill styles in a client component
const QuillStyles = () => {
  useEffect(() => {
    import('react-quill/dist/quill.snow.css');
  }, []);
  return null;
};

interface RichTextEditorProps {
  initialValue?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    ['link', 'image'],
    ['clean'],
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image',
];

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialValue = '',
  onChange,
  placeholder = 'Write something...',
  readOnly = false,
  className = '',
}) => {
  const [value, setValue] = useState(initialValue);
  
  // Update local state when initialValue changes
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = (content: string) => {
    setValue(content);
    onChange(content);
  };

  return (
    <div className={`rich-text-editor ${className}`}>
      <QuillStyles />
      <ReactQuill
        theme="snow"
        value={value}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
        className="min-h-64"
      />
    </div>
  );
};

export default RichTextEditor; 