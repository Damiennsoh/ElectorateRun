import React, { useState } from 'react';
import { Toggle } from '../../components/common/Toggle';
import { Button } from '../../components/common/Button';

export const EmailSettings: React.FC = () => {
  const [enableEmail, setEnableEmail] = useState(true);
  const [autoLogin, setAutoLogin] = useState(true);
  const [fromName, setFromName] = useState('The EC of International Students Committee');
  const [subject, setSubject] = useState('You are invited to vote in the election: (PHASE_3) MMDU INTERNATIONAL STUDENTS LEADERSHIP ELECTION-2024');
  const [body, setBody] = useState('Hi %name%, please vote in this election...');

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        Email Settings
      </h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <Toggle
          label="Enable Email"
          description="Enabling this option will allow you to add an email addresses for your each of your voters."
          enabled={enableEmail}
          onChange={setEnableEmail}
        />

        <Toggle
          label="Enable Automatic Voter Login"
          description="When this setting is enabled, then voters will be automatically logged in to vote in your election upon clicking the link in the email they receive. If it is disabled, then voters will be required to enter their Voter Key manually."
          enabled={autoLogin}
          onChange={setAutoLogin}
        />

        <Button variant="success" className="mt-4">Save</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          Voting Invite Template
        </h3>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            This is the email that is sent out to voters when the election starts.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              From Name
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="px-4 py-3 bg-gray-100 rounded-lg text-gray-600">
                Default: Marharishi Markandeshwar University
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Body
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-600 mt-2">
              You can add the token %name% to the email body and it will automatically be replaced by the voter's name.
            </p>
          </div>

          <Button variant="success">Save</Button>
        </div>
      </div>
    </div>
  );
};