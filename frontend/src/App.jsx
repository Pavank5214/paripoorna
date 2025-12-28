import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import UserLayout from "./components/layouts/UserLayout";
import Home from "./components/pages/Home";
import Projects from "./components/pages/Projects"
import Materials from "./components/pages/Materials";
import Costs from "./components/pages/Costs";
import Tasks from "./components/pages/Tasks";
import Documents from "./components/pages/Documents"
import ProjectDetails from "./components/ProjectDetails/ProjectDetails"
import Profile from "./components/pages/Profile"
import Register from "./components/pages/Register"
import Login from "./components/pages/Login"
import AdminDashboard from "./components/pages/AdminDashboard";
import UserManagement from "./components/pages/UserManagement";
import AdminAuditLogs from "./components/pages/AdminAuditLogs";
import Unauthorized from "./components/pages/Unauthorized";
import ProtectedRoute from "./components/common/ProtectedRoute";
import ProjectMap from "./components/pages/ProjectMap";
import LandingPage from "./components/pages/LandingPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        {/* Registration Disabled: <Route path="/register" element={<Register />} /> */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Main Application Layout (Authenticated) */}
        {/* Main Application Layout (Authenticated) */}
        <Route element={<UserLayout />}>
          <Route path="dashboard" element={<ProtectedRoute><Home /></ProtectedRoute>} />

          {/* Projects (Root Level) */}
          <Route path="projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="projects/map" element={<ProtectedRoute><ProjectMap /></ProtectedRoute>} />
          <Route path="projects/:id" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />

          {/* Other User Routes (Root Level) */}
          <Route path="materials" element={<ProtectedRoute><Materials /></ProtectedRoute>} />
          <Route path="costs" element={<ProtectedRoute><Costs /></ProtectedRoute>} />
          <Route path="tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
          <Route path="documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="admin" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <Navigate to="/admin/dashboard" replace />
            </ProtectedRoute>
          } />

          <Route path="admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="admin/users" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="admin/audit-logs" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdminAuditLogs />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
