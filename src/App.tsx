import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { ProjectsPage } from './pages/Projects';
import { ProjectDetailsPage } from './pages/ProjectDetails';
import { ResourcesPage } from './pages/Resources';
import { ReportsPage } from './pages/Reports';
import { ProfilePage } from './pages/Profile';
import { UsersPage } from './pages/Users';
import { NotFoundPage } from './pages/NotFound';
import { SettingsPage } from './pages/Settings';
import { NewProjectPage } from './pages/NewProject';
import { ProjectTypesPage } from './pages/ProjectTypes';
import { NewProjectTypePage } from './pages/NewProjectType';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rotas protegidas — exigem autenticação */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/new" element={<NewProjectPage />} />
            <Route path="projects/:id" element={<ProjectDetailsPage />} />
            <Route path="resources" element={<ResourcesPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="project-types" element={<ProjectTypesPage />} />
            <Route path="project-types/new" element={<NewProjectTypePage />} />
            <Route path="project-types/:id" element={<NewProjectTypePage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Raiz redireciona para login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
