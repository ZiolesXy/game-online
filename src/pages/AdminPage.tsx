import { Routes, Route, Navigate } from "react-router-dom";
import { AdminRequestDashboard } from "../components/admin/AdminRequestDashboard";

export default function AdminPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-100 mb-4">Admin Dashboard</h1>
          <p className="text-gray-400">Kelola permintaan game dan pengguna</p>
        </div>
        
        <Routes>
          <Route index element={<Navigate to="requests" replace />} />
          <Route path="requests" element={<AdminRequestDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="*" element={<Navigate to="requests" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function UserManagement() {
  return (
    <div className="glass-card rounded-3xl p-8">
      <h2 className="text-2xl font-bold text-gray-100 mb-6">User Management</h2>
      <p className="text-gray-400">Fitur manajemen pengguna akan segera hadir...</p>
    </div>
  );
}
