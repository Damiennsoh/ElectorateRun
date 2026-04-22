import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import Papa from 'papaparse';
import { FiUploadCloud, FiFileText, FiCheckCircle, FiLoader } from 'react-icons/fi';

interface ImportBallotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (type: 'questions' | 'options', data: any[]) => Promise<void>;
}

export const ImportBallotModal: React.FC<ImportBallotModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [importType, setImportType] = useState<'questions' | 'options'>('questions');
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (!selectedFile) return;

    setIsImporting(true);
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          // Normalize column names based on the image requirements
          const normalizedData = results.data.map((row: any) => {
            if (importType === 'questions') {
              return {
                title: row.title || '',
                description: row.description || '',
                min_selections: parseInt(row.validation_min) || 1,
                max_selections: parseInt(row.validation_max) || 1,
                randomize_options: row.randomize_options === '1' || row.randomize_options === 'true',
              };
            } else {
              return {
                question_title: row.question || '',
                title: row.title || '',
                short_description: row.short_description || '',
                description: row.description || '',
                photo_url: row.photo || '',
                order_index: parseInt(row.rank) || 0,
              };
            }
          });

          await onImport(importType, normalizedData);
          onClose();
          setSelectedFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error) {
          console.error('Import failed:', error);
          alert('Import failed. Please check your CSV format and try again.');
        } finally {
          setIsImporting(false);
        }
      },
      error: (error) => {
        console.error('CSV Parsing error:', error);
        alert('Failed to parse CSV file.');
        setIsImporting(false);
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Ballot"
      maxWidth="max-w-xl"
    >
      <div className="space-y-8 py-2">
        {/* Step 1 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#00AEEF] text-white flex items-center justify-center font-bold text-sm">
            1
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-gray-800">Read import instructions</h4>
            <p className="text-[15px] text-gray-600">
              To get started, <a href="#" onClick={(e) => e.preventDefault()} className="text-[#00AEEF] hover:underline">click here</a> to read the instructions for importing your ballot and to download the import templates.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#00AEEF] text-white flex items-center justify-center font-bold text-sm">
            2
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-gray-800">What are you importing?</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="importType"
                  disabled={isImporting}
                  checked={importType === 'questions'}
                  onChange={() => setImportType('questions')}
                  className="w-4 h-4 text-[#00AEEF] focus:ring-[#00AEEF] border-gray-300"
                />
                <span className="text-[15px] text-gray-700 group-hover:text-gray-900 transition-colors">Questions</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="importType"
                  disabled={isImporting}
                  checked={importType === 'options'}
                  onChange={() => setImportType('options')}
                  className="w-4 h-4 text-[#00AEEF] focus:ring-[#00AEEF] border-gray-300"
                />
                <span className="text-[15px] text-gray-700 group-hover:text-gray-900 transition-colors">Options</span>
              </label>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#00AEEF] text-white flex items-center justify-center font-bold text-sm">
            3
          </div>
          <div className="space-y-3 flex-1">
            <h4 className="font-bold text-gray-800 flex items-center gap-2">
              Select the <span className="bg-[#FF6600] text-white text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">{importType}</span> import file
            </h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded bg-gray-50 text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors shadow-sm disabled:opacity-50"
                >
                  <FiFileText className="text-lg text-gray-400" />
                  Choose File
                </button>
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv"
                  className="hidden"
                />
                <span className="text-sm text-gray-500 italic max-w-[200px] truncate">
                  {selectedFile ? selectedFile.name : 'No file chosen'}
                </span>
              </div>

              {selectedFile && !isImporting && (
                <button 
                  onClick={handleImport}
                  className="w-full flex items-center justify-center gap-2 bg-[#00D02D] hover:bg-[#00B026] text-white font-bold py-2.5 rounded transition-colors shadow-sm"
                >
                  <FiUploadCloud className="text-xl" />
                  Start {importType === 'questions' ? 'Questions' : 'Options'} Import
                </button>
              )}

              {isImporting && (
                <div className="w-full flex items-center justify-center gap-3 bg-gray-100 text-gray-500 font-bold py-2.5 rounded">
                  <FiLoader className="animate-spin text-xl" />
                  Processing Import...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
