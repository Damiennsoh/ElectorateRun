import React from 'react';
import { FiSearch, FiMail, FiPhone } from 'react-icons/fi';
import { MainLayout } from '../../components/layout/MainLayout';

export const HelpAndSupport: React.FC = () => {
  return (
    <MainLayout>
      <div className="bg-gray-100 min-h-screen">
        {/* Header */}
        <header className="bg-slate-900 text-white py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Help & Support</h1>
            <p className="text-lg mb-6">
              Find answers to common questions, troubleshoot issues, and get assistance.
            </p>
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                placeholder="Search for help articles..."
                className="w-full py-3 pl-12 pr-4 rounded-full bg-slate-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Article Content */}
            <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-md">
              <nav className="text-sm text-gray-500 mb-6">
                <a href="#" className="hover:underline">Home</a> &gt; <a href="#" className="hover:underline">Ballot</a> &gt; <span className="text-gray-700">How to Import the Ballot From a Spreadsheet</span>
              </nav>

              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                How to Import the Ballot From a Spreadsheet
              </h2>

              <div className="prose prose-blue max-w-none">
                <p>
                  If you have many ballot questions or options, you can save time by importing them from a spreadsheet. This article explains how to prepare your spreadsheet and import your ballot questions or options.
                </p>

                <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Importing Questions</h3>
                <p className="text-gray-700 mb-4">
                  To import questions:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-6">
                  <li>Select <span className="font-bold">Questions</span> in the import modal.</li>
                  <li>Download the <a href="#" className="text-[#00AEEF] hover:underline">Questions import template</a>.</li>
                  <li>Prepare your spreadsheet using the following guidelines:</li>
                </ol>

                <div className="overflow-x-auto mb-6">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Name</th>
                        <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Value</th>
                        <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">id</td>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">unique text</td>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">A unique identifier for the question.</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="py-2 px-4 border-b text-sm text-gray-700">title</td>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">text</td>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">The question title.</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">description</td>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">multiline text</td>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">The question description. Supports HTML.</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="py-2 px-4 border-b text-sm text-gray-700">type</td>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">multiple_choice, yes_no, ranked_choice</td>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">The type of question.</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">min_selections</td>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">number</td>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">Minimum number of options a voter must select.</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="py-2 px-4 border-b text-sm text-gray-700">max_selections</td>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">number</td>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">Maximum number of options a voter can select.</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">randomize_options</td>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">true/false</td>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">Whether to randomize the order of options.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Importing Options</h3>
                <p className="text-gray-700 mb-4">
                  To import options:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-6">
                  <li>Select <span className="font-bold">Options</span> in the import modal.</li>
                  <li>Download the <a href="#" className="text-[#00AEEF] hover:underline">Options import template</a>.</li>
                  <li>Prepare your spreadsheet using the following guidelines:</li>
                </ol>

                <div className="overflow-x-auto mb-6">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Name</th>
                        <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Value</th>
                        <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">question_id</td>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">unique text</td>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">The ID of the question this option belongs to.</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="py-2 px-4 border-b text-sm text-gray-700">id</td>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">unique text</td>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">A unique identifier for the option.</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">title</td>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">text</td>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">The option title.</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="py-2 px-4 border-b text-sm text-gray-700">short_description</td>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">text</td>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">A short description for the option.</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">description</td>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">multiline text</td>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">The option description. Supports HTML.</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="py-2 px-4 border-b text-sm text-gray-700">photo_url</td>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">URL</td>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">URL to an image for the option.</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">type</td>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">standard, write_in</td>
                        <td className="py-2 px-4 border-b text-sm text-gray-700">The type of option.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Additional Notes</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                  <li>All date/time values should be in ISO 8601 format (e.g., 2023-01-01T12:00:00Z).</li>
                </ul>

                <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Troubleshooting</h3>
                <p className="text-gray-700 mb-4">
                  If you encounter issues during import, please check the following:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                  <li>Ensure your spreadsheet headers match the template exactly.</li>
                  <li>Verify all required fields are present and correctly formatted.</li>
                  <li>Check for any special characters that might be causing parsing errors.</li>
                </ul>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-blue-700">
                  <p className="font-bold">Still need help?</p>
                  <p>Contact our support team for further assistance.</p>
                </div>
              </div>
            </div>

            {/* Right Column - Categories and Contact */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Categories</h3>
                <ul className="space-y-2 text-gray-700">
                  <li><a href="#" className="hover:underline">General</a></li>
                  <li><a href="#" className="hover:underline">Ballot</a></li>
                  <li><a href="#" className="hover:underline">Voters</a></li>
                  <li><a href="#" className="hover:underline">Settings</a></li>
                  <li><a href="#" className="hover:underline">Overview</a></li>
                  <li><a href="#" className="hover:underline">Results</a></li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Contact Us</h3>
                <p className="text-gray-700 mb-2 flex items-center gap-2">
                  <FiMail className="text-gray-500" /> support@electoraterun.com
                </p>
                <p className="text-gray-700 flex items-center gap-2">
                  <FiPhone className="text-gray-500" /> +1 (555) 123-4567
                </p>
                <button className="mt-6 w-full bg-[#00D02D] text-white py-3 rounded-lg font-bold hover:bg-[#00B026] transition-colors">
                  Submit a Ticket
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
};
