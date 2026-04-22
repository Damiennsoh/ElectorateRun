import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './utils/supabase';
import { Dashboard } from './pages/Dashboard';
import { Overview } from './pages/Overview';
import { Results } from './pages/Results';
import { Settings } from './pages/settings/Settings';
import { GeneralSettings } from './pages/settings/GeneralSettings';
import { EmailSettings } from './pages/settings/EmailSettings';
import { Auth } from './pages/Auth';
import { AccountSettingsLayout } from './pages/settings/account/AccountSettingsLayout';
import { ProfileSettings } from './pages/settings/account/ProfileSettings';
import { OrganizationSettings } from './pages/settings/account/OrganizationSettings';
import { AppearanceSettings } from './pages/settings/account/AppearanceSettings';
import { MobileAppSettings } from './pages/settings/account/MobileAppSettings';
import { BillingSettings } from './pages/settings/account/BillingSettings';
import { SecuritySettings } from './pages/settings/account/SecuritySettings';
import { CreateElection } from './pages/election/CreateElection';
import { ElectionOverview } from './pages/election/ElectionOverview';
import { Ballot } from './pages/election/Ballot';
import { HelpAndSupport } from './pages/help/HelpAndSupport';
import { ImportVotersInstructions } from './pages/help/ImportVotersInstructions';
import { RankedChoiceQuestion } from './pages/election/RankedChoiceQuestion';
import { LaunchElection } from './pages/election/LaunchElection';
import { AddOns } from './pages/election/AddOns';
import { Preview } from './pages/election/Preview';
import { Voters } from './pages/election/Voters';
import { ElectionSidebarLayout } from './components/layout/ElectionSidebarLayout';
import { ElectionSettingsLayout } from './pages/election/settings/ElectionSettingsLayout';
import { GeneralSettings as ElectionGeneralSettings } from './pages/election/settings/GeneralSettings';
import { DatesSettings as ElectionDatesSettings } from './pages/election/settings/DatesSettings';
import { VotersSettings as ElectionVotersSettings } from './pages/election/settings/VotersSettings';
import { MessagesSettings as ElectionMessagesSettings } from './pages/election/settings/MessagesSettings';
import { EmailSettings as ElectionEmailSettings } from './pages/election/settings/EmailSettings';
import { ResultsSettings as ElectionResultsSettings } from './pages/election/settings/ResultsSettings';
import { DuplicateElection as ElectionDuplicateElection } from './pages/election/settings/DuplicateElection';
import { DeleteElection as ElectionDeleteElection } from './pages/election/settings/DeleteElection';

import { VoteLogin } from './pages/voting/VoteLogin';
import { VoteBallot } from './pages/voting/VoteBallot';

// Placeholder components for other routes
const FraudAnalysis = () => <ElectionSidebarLayout><div className="p-8 text-2xl font-bold">Fraud Analysis</div></ElectionSidebarLayout>;

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!session) {
      return <Navigate to="/auth" replace />;
    }
    return <>{children}</>;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/dashboard" replace />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/create-election" element={<ProtectedRoute><CreateElection /></ProtectedRoute>} />
        
        {/* Election Specific Routes */}
        <Route path="/election/:id/overview" element={<ProtectedRoute><ElectionOverview /></ProtectedRoute>} />
        <Route path="/election/:id/ballot" element={<ProtectedRoute><Ballot /></ProtectedRoute>} />
        <Route path="/election/:id/ballot/ranked-choice/:questionId" element={<ProtectedRoute><RankedChoiceQuestion /></ProtectedRoute>} />
        <Route path="/election/:id/voters" element={<ProtectedRoute><Voters /></ProtectedRoute>} />
        <Route path="/election/:id/preview" element={<ProtectedRoute><Preview /></ProtectedRoute>} />
        <Route path="/election/:id/addons" element={<ProtectedRoute><AddOns /></ProtectedRoute>} />
        <Route path="/election/:id/fraud-analysis" element={<ProtectedRoute><FraudAnalysis /></ProtectedRoute>} />
        <Route path="/election/:id/launch" element={<ProtectedRoute><LaunchElection /></ProtectedRoute>} />
        <Route path="/election/:id/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
        
        {/* Public Voting Routes */}
        <Route path="/vote/:id" element={<VoteLogin />} />
        <Route path="/vote/:id/ballot" element={<VoteBallot />} />
        
        <Route path="/election/:id/settings" element={<ProtectedRoute><ElectionSettingsLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="general" replace />} />
          <Route path="general" element={<ElectionGeneralSettings />} />
          <Route path="dates" element={<ElectionDatesSettings />} />
          <Route path="voters" element={<ElectionVotersSettings />} />
          <Route path="messages" element={<ElectionMessagesSettings />} />
          <Route path="email" element={<ElectionEmailSettings />} />
          <Route path="results" element={<ElectionResultsSettings />} />
          <Route path="duplicate" element={<ElectionDuplicateElection />} />
          <Route path="delete" element={<ElectionDeleteElection />} />
        </Route>

        <Route path="/overview" element={<ProtectedRoute><Overview /></ProtectedRoute>} />
        <Route path="/overview/:id" element={<ProtectedRoute><Overview /></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
        <Route path="/fraud-analysis" element={<ProtectedRoute><FraudAnalysis /></ProtectedRoute>} />
        <Route path="/voters" element={<ProtectedRoute><Voters /></ProtectedRoute>} />
        <Route path="/ballot" element={<ProtectedRoute><Ballot /></ProtectedRoute>} />
        <Route path="/add-ons" element={<ProtectedRoute><AddOns /></ProtectedRoute>} />
        <Route path="/preview" element={<ProtectedRoute><Preview /></ProtectedRoute>} />
        <Route path="/help" element={<ProtectedRoute><HelpAndSupport /></ProtectedRoute>} />
        <Route path="/help/import-voters" element={<ProtectedRoute><ImportVotersInstructions /></ProtectedRoute>} />
        
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>}>
          <Route index element={<Navigate to="general" replace />} />
          <Route path="general" element={<GeneralSettings />} />
          <Route path="dates" element={<DatesSettings />} />
          <Route path="voters" element={<VotersSettings />} />
          <Route path="messages" element={<MessagesSettings />} />
          <Route path="email" element={<EmailSettings />} />
          <Route path="results" element={<ResultsSettings />} />
          <Route path="duplicate" element={<DuplicateElection />} />
          <Route path="archive" element={<ArchiveElection />} />
          <Route path="delete" element={<DeleteElection />} />
        </Route>

        <Route path="/settings/account" element={<ProtectedRoute><AccountSettingsLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<ProfileSettings />} />
          <Route path="organization" element={<OrganizationSettings />} />
          <Route path="appearance" element={<AppearanceSettings />} />
          <Route path="mobile-app" element={<MobileAppSettings />} />
          <Route path="billing" element={<BillingSettings />} />
          <Route path="security" element={<SecuritySettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
