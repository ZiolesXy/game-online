import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { AdminRequestDashboard } from "../components/admin/AdminRequestDashboard";
import { UserManagement } from "../components/admin/UserManagement";

export default function AdminPage() {
  const location = useLocation();
  const isUsers = location.pathname.endsWith('/users');
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-100 mb-4">Admin</h1>
          <p className="text-gray-400">Kelola permintaan game dan pengguna</p>
          <div className="mt-4 flex gap-2">
            <Link
              to="/admin/requests"
              className={`px-4 py-2 rounded-lg ${!isUsers ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-200 hover:bg-white/20'}`}
            >
              Requests
            </Link>
            <Link
              to="/admin/users"
              className={`px-4 py-2 rounded-lg ${isUsers ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-200 hover:bg-white/20'}`}
            >
              Users
            </Link>
          </div>
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

