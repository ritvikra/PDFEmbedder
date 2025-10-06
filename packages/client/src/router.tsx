import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import JobsPage from './pages/JobsPage';
import JobDetailsPage from './pages/JobDetailsPage';
import CreateJobPage from './pages/CreateJobPage';
import DocumentGroupsPage from './pages/DocumentGroupsPage';

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<JobsPage />} />
          <Route path="jobs/create" element={<CreateJobPage />} />
          <Route path="jobs/:jobId" element={<JobDetailsPage />} />
          <Route path="document-groups" element={<DocumentGroupsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
} 