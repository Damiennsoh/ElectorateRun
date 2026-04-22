import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { FiUploadCloud, FiCheckCircle, FiFileText, FiAlertCircle, FiCopy } from 'react-icons/fi';
import { api } from '../../utils/api';
import Papa from 'papaparse';

interface ImportVotersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => Promise<void>;
}

export const ImportVotersModal: React.FC<ImportVotersModalProps> = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [previousElections, setPreviousElections] = useState<any[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchPreviousElections();
    }
  }, [isOpen]);

  const fetchPreviousElections = async () => {
    try {
      const data = await api.getElectionsWithVoterCounts();
      setPreviousElections(data);
    } catch (err) {
      console.error('Error fetching elections:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError('Please upload a CSV file.');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setSelectedElectionId(''); // Clear selection if file is chosen
    }
  };

  const handleCopyVoters = async () => {
    if (!selectedElectionId) return;

    setLoading(true);
    setError(null);

    try {
      const votersToCopy = await api.getVoters(selectedElectionId);
      
      if (!votersToCopy || votersToCopy.length === 0) {
        throw new Error('Selected election has no voters to copy.');
      }

      // Prepare voters for insertion (remove IDs and cast status)
      const sanitizedVoters = votersToCopy.map((v: any) => ({
        name: v.name,
        voter_identifier: v.voter_identifier,
        voter_key: v.voter_key,
        email: v.email,
        vote_weight: v.vote_weight || 1,
        has_voted: false,
        voted_at: null
      }));

      await onImport(sanitizedVoters);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setSelectedElectionId('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to copy voters.');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rawData = results.data;
          
          // Header normalization
          const normalizedData = rawData.map((row: any) => {
            const newRow: any = {};
            Object.keys(row).forEach(key => {
              const lowerKey = key.toLowerCase().trim();
              if (lowerKey.includes('name')) newRow.name = row[key];
              else if (lowerKey.includes('voter id') || lowerKey.includes('identifier')) newRow.voter_identifier = row[key];
              else if (lowerKey.includes('key')) newRow.voter_key = row[key];
              else if (lowerKey.includes('email')) newRow.email = row[key];
              else if (lowerKey.includes('weight')) newRow.vote_weight = parseFloat(row[key]) || 1;
            });
            return newRow;
          });

          // Basic validation
          const validData = normalizedData.filter(v => v.voter_identifier);
          
          if (validData.length === 0) {
            throw new Error('No valid voters found. Ensure your CSV has a "Voter ID" or "Identifier" column.');
          }

          await onImport(validData);
          setSuccess(true);
          setTimeout(() => {
            onClose();
            setSuccess(false);
            setFile(null);
          }, 2000);
        } catch (err: any) {
          setError(err.message || 'Failed to process CSV file.');
        } finally {
          setLoading(false);
        }
      },
      error: (err) => {
        setError('Error parsing CSV: ' + err.message);
        setLoading(false);
      }
    });
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Name,Voter ID,Voter Key,Email,Weight\nJohn Doe,1001,SECRET1,john@example.com,1\nJane Smith,1002,SECRET2,jane@example.com,1";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "voters_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Voters" maxWidth="max-w-xl">
      <div className="space-y-6">
        {!success ? (
          <>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#00AEEF] text-white flex items-center justify-center text-xs font-bold">1</div>
                <h4 className="font-bold text-gray-700">Read import instructions</h4>
              </div>
              <p className="text-sm text-gray-500 pl-8">
                To get started, <button className="text-[#00AEEF] hover:underline font-bold">click here</button> to read the instructions on how to import voters.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#00AEEF] text-white flex items-center justify-center text-xs font-bold">2</div>
                <h4 className="font-bold text-gray-700">Download the import template</h4>
              </div>
              <p className="text-sm text-gray-500 pl-8 leading-relaxed">
                <button onClick={downloadTemplate} className="text-[#00AEEF] hover:underline font-bold">Click here</button> to download the voter import template and add one voter per row. <span className="text-orange-500">The columns in your spreadsheet must exactly match the import</span>
              </p>
            </div>

            {/* CSV Upload Area */}
            <div 
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
                file ? 'border-[#00D02D] bg-green-50' : 'border-gray-200 hover:border-[#00AEEF] bg-gray-50'
              }`}
            >
              {file ? (
                <div className="space-y-2">
                  <FiFileText className="text-5xl text-[#00D02D] mx-auto" />
                  <p className="font-bold text-gray-700">{file.name}</p>
                  <button onClick={() => setFile(null)} className="text-xs text-red-500 font-bold uppercase tracking-wider">Remove File</button>
                </div>
              ) : (
                <label className="cursor-pointer space-y-4 block">
                  <FiUploadCloud className="text-5xl text-gray-300 mx-auto" />
                  <div>
                    <p className="text-lg font-bold text-gray-700">Choose a CSV file</p>
                    <p className="text-sm text-gray-400 mt-1">Click to browse or drag and drop</p>
                  </div>
                  <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                </label>
              )}
            </div>

            {/* OR Section */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm font-bold text-gray-400">OR</span>
              </div>
            </div>

            {/* Copy from Previous Election Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <FiCopy className="text-gray-400" />
                <h4 className="font-bold text-gray-700">Copy voters from previous election</h4>
              </div>
              <div className="pl-6 space-y-3">
                <select
                  value={selectedElectionId}
                  onChange={(e) => {
                    setSelectedElectionId(e.target.value);
                    setFile(null); // Clear file if election is selected
                  }}
                  className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-[#00AEEF] text-sm"
                >
                  <option value="">Select an election...</option>
                  {previousElections.filter(e => e.voterCount > 0).map(e => (
                    <option key={e.id} value={e.id}>
                      {e.title} - ({e.voterCount} Voters)
                    </option>
                  ))}
                </select>
                <button 
                  onClick={handleCopyVoters}
                  disabled={!selectedElectionId || loading}
                  className="px-4 py-2 bg-[#00D02D] text-white rounded font-bold text-sm shadow-sm hover:bg-[#00B026] disabled:opacity-50 transition-all"
                >
                  {loading && !file ? 'Copying...' : 'Copy Voters'}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 p-3 rounded flex items-center gap-2 text-red-600 text-sm">
                <FiAlertCircle /> {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                onClick={onClose}
                className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              {file && (
                <button 
                  onClick={handleImport}
                  disabled={loading}
                  className="px-8 py-2 bg-[#00D02D] text-white rounded font-bold shadow-sm hover:bg-[#00B026] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? 'Processing...' : 'Start Import'}
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="py-12 text-center space-y-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <FiCheckCircle className="text-5xl text-[#00D02D]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Success!</h3>
            <p className="text-gray-500 text-lg italic">Voters have been imported successfully.</p>
          </div>
        )}
      </div>
    </Modal>
  );
};
