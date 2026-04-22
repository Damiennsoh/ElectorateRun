import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder,
  maxLength = 5000,
}) => {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link'],
      [{ color: [] }, { background: [] }],
      ['clean'],
    ],
  };

  return (
    <div>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder}
        className="bg-white"
      />
      <div className="text-right text-sm text-gray-500 mt-2">
        Max Length: {maxLength.toLocaleString()} characters. ({' '}
        {maxLength - value.length} remaining)
      </div>
    </div>
  );
};