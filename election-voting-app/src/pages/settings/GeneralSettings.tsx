import React, { useState } from 'react';
import { Button } from '../../components/common/Button';
import { RichTextEditor } from '../../components/common/RichTextEditor';

export const GeneralSettings: React.FC = () => {
  const [title, setTitle] = useState(
    '(PHASE_3) MMDU INTERNATIONAL STUDENTS LEADERSHIP ELECTION-2024'
  );
  const [description, setDescription] = useState('');

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        General Settings
      </h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Description
          </label>
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="Enter election description..."
            maxLength={5000}
          />
        </div>

        <Button variant="success">Save</Button>
      </div>
    </div>
  );
};