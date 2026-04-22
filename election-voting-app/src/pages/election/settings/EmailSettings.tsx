import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiMail, FiCheckCircle, FiInfo, FiHelpCircle } from 'react-icons/fi';
import { api } from '../../../utils/api';
import { supabase } from '../../../utils/supabase';
import { Toggle } from '../../../components/common/Toggle';

export const EmailSettings: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [enableEmail, setEnableEmail] = useState(true);
  const [autoLogin, setAutoLogin] = useState(true);
  const [ballotReceipt, setBallotReceipt] = useState(false);
  const [fromName, setFromName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('Hi %name%, please vote in this election...');
  const [reminderSubject, setReminderSubject] = useState('');
  const [reminderBody, setReminderBody] = useState('Hi %name%, this is a reminder that you have not voted...');
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewType, setPreviewType] = useState<'invite' | 'reminder'>('invite');

  useEffect(() => {
    const fetchUserEmail = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };
    fetchUserEmail();
  }, []);

  useEffect(() => {
    const fetchElection = async () => {
      if (!id) return;
      try {
        const election = await api.getElectionById(id);
        if (election) {
          const settings = (election.settings as any) || {};
          setEnableEmail(settings.enable_email !== false);
          setAutoLogin(settings.auto_login !== false);
          setBallotReceipt(settings.ballot_receipt || false);
          setFromName(settings.from_name || election.title || '');
          setSubject(settings.email_subject || `You are invited to vote in the election: ${election.title}`);
          setBody(settings.email_body || 'Hi %name%, please vote in this election...');
          setReminderSubject(settings.reminder_subject || `Reminder to vote in the election: ${election.title}`);
          setReminderBody(settings.reminder_body || 'Hi %name%, this is a reminder that you have not voted...');
        }
      } catch (err) {
        console.error("Error fetching election:", err);
      }
    };
    fetchElection();
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const election = await api.getElectionById(id);
      const currentSettings = (election.settings as any) || {};
      
      const newSettings = {
        ...currentSettings,
        enable_email: enableEmail,
        auto_login: autoLogin,
        ballot_receipt: ballotReceipt,
        from_name: fromName,
        email_subject: subject,
        email_body: body,
        reminder_subject: reminderSubject,
        reminder_body: reminderBody,
      };

      await api.updateElection(id, { settings: newSettings });
      alert('Email settings saved successfully!');
    } catch (err) {
      console.error("Error saving email settings:", err);
      alert('Failed to save email settings.');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = (type: 'invite' | 'reminder') => {
    setPreviewType(type);
    setPreviewModalOpen(true);
  };

  const handleSendPreview = () => {
    alert('Preview email sent to ' + userEmail);
    setPreviewModalOpen(false);
  };

  return (
    <div className="bg-white space-y-8">
      <div className="bg-white border border-gray-200 rounded-sm">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-[15px] font-bold text-[#333] flex items-center gap-2">
            <FiMail className="text-gray-500" />
            Email Settings
          </h3>
        </div>

        <div className="p-6 space-y-0">
          <div className="py-5 border-b border-gray-100">
            <Toggle
                label={
                  <span className="flex items-center gap-1 font-bold text-[13px] text-gray-800">
                    Enable Email <FiHelpCircle className="text-[#00AEEF] w-3 h-3" />
                  </span>
                }
                description="Enabling this option will allow you to add email addresses and send invitations to each of your voters."
                enabled={enableEmail}
                onChange={setEnableEmail}
            />
          </div>

          <div className="py-5 border-b border-gray-100">
            <Toggle
                label={
                  <span className="flex items-center gap-1 font-bold text-[13px] text-gray-800">
                    Enable Automatic Voter Login <FiHelpCircle className="text-[#00AEEF] w-3 h-3" />
                  </span>
                }
                description="When this setting is enabled, voters will be automatically logged in to vote upon clicking the link in the email they receive. If disabled, they will be required to enter their Voter Key manually."
                enabled={autoLogin}
                onChange={setAutoLogin}
            />
          </div>

          <div className="py-5">
            <Toggle
                label={
                  <span className="flex items-center gap-1 font-bold text-[13px] text-gray-800">
                    Ballot Receipt <FiHelpCircle className="text-[#00AEEF] w-3 h-3" />
                  </span>
                }
                description="Enabling this option will allow voters to download a receipt that confirms their ballot has been received."
                enabled={ballotReceipt}
                onChange={setBallotReceipt}
            />
          </div>
          
          <div className="pt-8 border-t border-gray-100">
            <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-2 bg-[#00D02D] text-white rounded font-bold text-[14px] hover:bg-[#00B026] transition-colors shadow-sm disabled:opacity-50"
            >
                {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-[15px] font-bold text-[#333]">
            Voting Invite Template
          </h3>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-2">
              From Name
            </label>
            <input
              type="text"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              className="w-full px-3 py-2 text-[14px] text-gray-700 border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-[#00AEEF] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 text-[14px] text-gray-700 border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-[#00AEEF] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-2">
              Body
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 text-[14px] text-gray-700 border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-[#00AEEF] transition-colors resize-y font-mono"
            />
            <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
              <FiInfo className="text-[#00AEEF]" />
              You can add the token <span className="font-bold text-gray-700">%name%</span> to the body and it will be replaced by the voter's name.
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-[#00D02D] text-white rounded font-bold text-[14px] hover:bg-[#00B026] transition-colors shadow-sm disabled:opacity-50"
            >
              Save Template
            </button>
            <button
              onClick={() => handlePreview('invite')}
              className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded font-bold text-[14px] hover:bg-gray-50 transition-colors shadow-sm"
            >
              Preview
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-[15px] font-bold text-[#333]">
            Email Reminder Template
          </h3>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={reminderSubject}
              onChange={(e) => setReminderSubject(e.target.value)}
              className="w-full px-3 py-2 text-[14px] text-gray-700 border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-[#00AEEF] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-2">
              Body
            </label>
            <textarea
              value={reminderBody}
              onChange={(e) => setReminderBody(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 text-[14px] text-gray-700 border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:border-[#00AEEF] transition-colors resize-y font-mono"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-[#00D02D] text-white rounded font-bold text-[14px] hover:bg-[#00B026] transition-colors shadow-sm disabled:opacity-50"
            >
              Save Template
            </button>
            <button
              onClick={() => handlePreview('reminder')}
              className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded font-bold text-[14px] hover:bg-gray-50 transition-colors shadow-sm"
            >
              Preview
            </button>
          </div>
        </div>
      </div>

      {previewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Send Preview Email</h2>
              
              <p className="text-gray-600 mb-6 text-[15px] leading-relaxed">
                Press "Send Email" to send a preview of the voting <span className="font-bold text-gray-800">{previewType === 'invite' ? 'invite' : 'reminder'}</span> email to: <span className="text-[#00AEEF] font-medium">{userEmail}</span>.
              </p>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
                <div className="flex items-center gap-2 mb-2">
                   <FiInfo className="text-yellow-600" />
                   <p className="font-bold text-yellow-800 text-sm">Please Note:</p>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-sm text-yellow-700">
                  <li>Voter information will be randomized.</li>
                  <li>The Voter ID and Voter Key will not work.</li>
                  <li>The link to the election will only work after launch.</li>
                </ul>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setPreviewModalOpen(false)}
                  className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendPreview}
                  className="px-6 py-2 bg-[#00D02D] text-white rounded font-bold hover:bg-[#00B026] transition-colors flex items-center gap-2"
                >
                  <FiMail /> Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
