import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

import MainLayout from './layouts/MainLayout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage/LoginPage';
import SignUpPage from './pages/SignUpPage/SignUpPage';
import FrontPage from './pages/FrontPage/FrontPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import AboutPage from './pages/AboutPage/AboutPage';
import AllProposalsPage from './pages/AllProposalsPage/AllProposalsPage';
import ProposalDetailPage from './pages/ProposalDetailPage/ProposalDetailPage';
import CreateProposalPage from './pages/CreateProposalPage/CreateProposalPage';
import EditProposalPage from './pages/EditProposalPage/EditProposalPage';
import AllNoticesPage from './pages/AllNoticesPage/AllNoticesPage';
import NoticeDetailPage from './pages/NoticeDetailPage/NoticeDetailPage'
import AllSuggestionsPage from './pages/AllSuggestionsPage/AllSuggestionsPage';
import SuggestionDetailPage from './pages/SuggestionDetailPage/SuggestionDetailPage';
import CreateSuggestionPage from './pages/CreateSuggestionPage/CreateSuggestionPage';
import EditSuggestionPage from './pages/EditSuggestionPage/EditSuggestionPage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import AllUsersPage from './pages/AllUsersPage/AllUsersPage';
import UserDetailPage from './pages/UserDetailPage/UserDetailPage';

import './index.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout><Outlet /></MainLayout>}>

        <Route index element={<FrontPage />} />
        <Route path="proposals" element={<AllProposalsPage />} />
        <Route path="proposals/:proposalId" element={<ProposalDetailPage />} />
        <Route path="notices" element={<AllNoticesPage />} />
        <Route path="notices/:noticeId" element={<NoticeDetailPage />} />
        <Route path="suggestions" element={<AllSuggestionsPage />} />
        <Route path="suggestions/:suggestionId" element={<SuggestionDetailPage />} />
        <Route path="about" element={<AboutPage />} />

        <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="dashboard/settings" element={<SettingsPage />} />
          <Route path="create-suggestion" element={<CreateSuggestionPage />} />
          <Route path="suggestions/edit/:suggestionId" element={<EditSuggestionPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['Moderator']}><Outlet /></ProtectedRoute>}>
          <Route path="create-proposal" element={<CreateProposalPage />} />
          <Route path="proposals/edit/:proposalId" element={<EditProposalPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['Admin']}><Outlet /></ProtectedRoute>}>
          <Route path="dashboard/users" element={<AllUsersPage />} />
          <Route path="dashboard/users/:userId" element={<UserDetailPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />

      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

    </Routes>
  );
}

export default App;