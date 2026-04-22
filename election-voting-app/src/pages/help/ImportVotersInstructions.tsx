import React from 'react';
import { FiSearch, FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export const ImportVotersInstructions: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f4f7f6] font-sans">
      {/* Header */}
      <header className="bg-[#2c3e50] text-white py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Help & Support</h1>
        <p className="text-lg text-gray-300 mb-8">
          Resources that will teach you everything you need to know about using Election Runner
        </p>
        <div className="max-w-2xl mx-auto flex gap-2 px-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search Election Runner Help..."
              className="w-full pl-4 pr-10 py-3 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
            />
            <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button className="bg-[#00D02D] hover:bg-[#00B026] text-white px-6 py-3 rounded font-bold transition-colors whitespace-nowrap">
            + New Support Ticket
          </button>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-2 text-sm text-[#00AEEF]">
        <Link to="/help" className="hover:underline">Support Center</Link>
        <span className="text-gray-400">/</span>
        <Link to="/help/voters" className="hover:underline">Voters</Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-500">How to Import Voters Into an Election</span>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 bg-white p-8 rounded shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
            <FiSearch className="text-2xl text-gray-400" />
            <h2 className="text-3xl font-bold text-[#333]">How to Import Voters Into an Election</h2>
          </div>

          <div className="prose max-w-none text-gray-600 text-[15px] leading-relaxed">
            <p className="mb-6">
              Election Runner provides election administrators with the option to import a list of voters from a spreadsheet (.CSV file).
            </p>

            <h3 className="text-xl font-bold text-[#333] mt-8 mb-4">Import Template</h3>
            <p className="mb-4">
              The quickest and easiest way to get started with the voter import process is to download the voter import template by clicking here: <a href="/ElectionRunnerImportTemplate.csv" className="text-[#00AEEF] hover:underline">https://electionrunner.com/voters/import_template</a>. This template file is in the CSV (Comma Separated Values) format which can be opened by all popular spreadsheet applications (Excel, Numbers, Google Spreadsheets, etc.). Starting from or using the template file is not required, but Election Runner will only accept valid CSV files with the first row containing the following columns:
            </p>

            <ul className="list-disc pl-8 mb-6 space-y-1 text-[#333]">
              <li>name</li>
              <li>voter_identifier</li>
              <li>voter_key</li>
              <li>email</li>
              <li>vote_weight</li>
            </ul>

            <p className="mb-8">
              If the first row does not have the above listed columns in the exact order and spelling, then the import will fail.
            </p>

            <h3 className="text-xl font-bold text-[#333] mt-8 mb-4">Column Info / Fields</h3>
            
            <div className="overflow-x-auto mb-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-y border-gray-200 text-left">
                    <th className="py-3 px-4 font-bold text-[#333] w-1/4">Field</th>
                    <th className="py-3 px-4 font-bold text-[#333] w-1/4">Column</th>
                    <th className="py-3 px-4 font-bold text-[#333] w-1/2">Description</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-4 align-top text-[#333]">Name</td>
                    <td className="py-4 px-4 align-top text-[#333] font-mono bg-gray-50">name</td>
                    <td className="py-4 px-4 align-top">
                      The name field allows you to associate a name with a Voter Identifier. This is for your records and will only be seen by the voter if you choose to add an email address for the voter. This field is not required.
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-4 align-top text-[#333]">Voter Identifier</td>
                    <td className="py-4 px-4 align-top text-[#333] font-mono bg-gray-50">voter_identifier</td>
                    <td className="py-4 px-4 align-top">
                      The Voter Identifier (Voter ID) is what can be considered as the Voter's "username". The voter will use this field when logging in to vote for your election. This field is not required, and if left blank a random value will be generated. A voter's Voter ID <strong className="text-[#333]">must be unique</strong> in an election.
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-4 align-top text-[#333]">Voter Key</td>
                    <td className="py-4 px-4 align-top text-[#333] font-mono bg-gray-50">voter_key</td>
                    <td className="py-4 px-4 align-top">
                      The Voter Key is what can be considered as the Voter's "password". The voter will use this field when logging in to vote for your election. This field is not required, and if left blank a random value will be generated.
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-4 align-top text-[#333]">Email</td>
                    <td className="py-4 px-4 align-top text-[#333] font-mono bg-gray-50">email</td>
                    <td className="py-4 px-4 align-top">
                      The Email field will be used as a way to notify your voter when the election launches. If provided, the voter will receive an email with voting instructions as soon as your election starts. This field is not required and to be used must be enabled in the election's settings. If the import process detects that the import file includes valid email addresses, <strong className="text-[#333]">then the email setting will automatically be enabled in the election's settings</strong> (see: <a href="#" className="text-[#00AEEF] hover:underline">Using a Voter's Email Address</a>)
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-4 align-top text-[#333]">Vote Weight</td>
                    <td className="py-4 px-4 align-top text-[#333] font-mono bg-gray-50">vote_weight</td>
                    <td className="py-4 px-4 align-top">
                      The Vote Weight field allows you to assign a weight to the voter's ballot. If you do not have weighted voting enabled for your election, you can leave this column empty. By default, each voter's vote weight is 1 (see: <a href="#" className="text-[#00AEEF] hover:underline">Weighted Voting</a>)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-bold text-[#333] mt-8 mb-4">How to Import</h3>
            <p className="mb-4">To import a list of voters on a correctly formatted CSV file to an election, follow the steps below:</p>
            
            <ol className="list-decimal pl-8 mb-6 space-y-2 text-[#333]">
              <li>Click on "Voters" on the election sidebar.</li>
              <li>Click on the "Import" button</li>
              <div className="my-4 border border-gray-200 p-2 bg-gray-50 rounded">
                <div className="bg-gray-300 w-full h-48 flex items-center justify-center text-gray-500">
                  [Image Placeholder: Import Button Location]
                </div>
              </div>
              <li>The "Import Voters" modal will open and provide instructions for importing a spreadsheet</li>
              <li>Click "Choose File" and select the import file from the device</li>
            </ol>

            <p className="mb-8">The import process will display any errors with the import file.</p>

            <h3 className="text-xl font-bold text-[#333] mt-8 mb-4">Additional Notes</h3>
            <ul className="list-disc pl-8 mb-6 space-y-2 text-[#333]">
              <li>Importing a list of voters will <strong className="text-[#333]">append the list to the existing list of voters in the election</strong>. For example, importing the same list of voters twice will result in each voter being duplicated.</li>
              <li>The import file <strong className="text-[#333]">must</strong> be a valid CSV (comma separated values) file.</li>
              <li>The default import limit is 15,000 voters. If your election has more than 15,000 eligible voters, please <a href="#" className="text-[#00AEEF] hover:underline">contact support</a>.</li>
              <li>If the import process detects that the import file includes valid email addresses, then the email setting will <strong className="text-[#333]">automatically be enabled</strong> in the election's settings</li>
            </ul>

            <div className="mt-12 p-6 bg-gray-50 rounded border border-gray-200 text-center">
              Still need help? No problem! <a href="#" className="text-[#00AEEF] hover:underline">Click here to create a new support ticket.</a>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-[#333] mb-4">Categories</h3>
            <ul className="space-y-2">
              {[
                'Account',
                'Ballot',
                'Billing',
                'Election',
                'Election Settings',
                'Results',
                'Voters'
              ].map(category => (
                <li key={category}>
                  <a href="#" className="flex items-center gap-2 text-[#00AEEF] hover:underline text-sm font-medium">
                    <FiChevronRight className="text-gray-400" />
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-[#333] mb-4">Contact Us</h3>
            <p className="text-sm text-gray-600 mb-4">
              We are available Monday - Friday, 9am to 4pm CST.
            </p>
            <div className="mb-4">
              <strong className="text-sm text-[#333] block">Email:</strong>
              <a href="mailto:support@electionrunner.com" className="text-sm text-[#00AEEF] hover:underline">support@electionrunner.com</a>
            </div>
            <button className="w-full bg-[#00D02D] hover:bg-[#00B026] text-white px-4 py-2 rounded font-bold transition-colors text-sm">
              + New Support Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
