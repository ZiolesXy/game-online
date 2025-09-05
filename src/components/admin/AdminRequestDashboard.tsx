import React, { useState, useEffect } from 'react';
import { gameRequestService, type GameRequest, type UpdateRequestStatusData } from '../../services/gameRequestService';

export const AdminRequestDashboard: React.FC = () => {
  const [requests, setRequests] = useState<GameRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<GameRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await gameRequestService.getAllRequests();
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat request');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleStatusUpdate = async (requestId: string, status: 'accepted' | 'declined') => {
    try {
      setProcessingId(requestId);
      const updateData: UpdateRequestStatusData = {
        status,
        admin_notes: adminNotes.trim() || undefined,
      };
      
      await gameRequestService.updateRequestStatus(requestId, updateData);
      await loadRequests();
      setSelectedRequest(null);
      setAdminNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengupdate status');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDownloadFile = async (request: GameRequest) => {
    try {
      const url = await gameRequestService.getRequestFileUrl(request.file_path);
      window.open(url, '_blank');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengunduh file');
    }
  };

  const handleDeleteFile = async (requestId: string) => {
    try {
      setProcessingId(requestId);
      await gameRequestService.deleteRequestFile(requestId);
      // Optional: give feedback
      await loadRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus file');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'Menunggu Review';
      case 'accepted':
        return 'Diterima';
      case 'declined':
        return 'Ditolak';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredRequests = requests.filter(request => {
    if (filterStatus === 'all') return true;
    return request.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-gray-700">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard - Game Requests</h1>
          <button
            onClick={loadRequests}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-500 text-red-300 rounded-lg backdrop-blur-sm">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-300 hover:text-red-100"
            >
              ×
            </button>
          </div>
        )}

        {/* Filter */}
        <div className="mb-6">
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-300 mb-2">
            Filter berdasarkan status:
          </label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Status</option>
            <option value="waiting">Menunggu Review</option>
            <option value="accepted">Diterima</option>
            <option value="declined">Ditolak</option>
          </select>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-900/30 border border-blue-600/50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-300">Total</h3>
            <p className="text-2xl font-bold text-blue-200">{requests.length}</p>
          </div>
          <div className="bg-yellow-900/30 border border-yellow-600/50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-300">Menunggu</h3>
            <p className="text-2xl font-bold text-yellow-200">
              {requests.filter(r => r.status === 'waiting').length}
            </p>
          </div>
          <div className="bg-green-900/30 border border-green-600/50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-300">Diterima</h3>
            <p className="text-2xl font-bold text-green-200">
              {requests.filter(r => r.status === 'accepted').length}
            </p>
          </div>
          <div className="bg-red-900/30 border border-red-600/50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-red-300">Ditolak</h3>
            <p className="text-2xl font-bold text-red-200">
              {requests.filter(r => r.status === 'declined').length}
            </p>
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>Tidak ada request dengan filter yang dipilih.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request.id} className="border border-gray-600 rounded-lg p-6 bg-gray-800/30">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{request.title}</h3>
                    <p className="text-gray-300">
                      Oleh: {request.user?.username} ({request.user?.email})
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                    {getStatusText(request.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-gray-300">
                  <div>
                    <p><span className="font-medium text-gray-200">Kategori:</span> {request.category}</p>
                    <p><span className="font-medium text-gray-200">Dikirim:</span> {formatDate(request.created_at)}</p>
                    {request.reviewed_at && (
                      <p><span className="font-medium text-gray-200">Direview:</span> {formatDate(request.reviewed_at)}</p>
                    )}
                  </div>
                  <div>
                    {request.description && (
                      <p><span className="font-medium text-gray-200">Deskripsi:</span> {request.description}</p>
                    )}
                  </div>
                </div>

                {request.admin_notes && (
                  <div className="mb-4 p-3 bg-gray-700/50 rounded">
                    <p className="font-medium text-gray-200">Catatan Admin:</p>
                    <p className="text-gray-300">{request.admin_notes}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {request.status === 'waiting' && (
                    <button
                      onClick={() => handleDownloadFile(request)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Download File
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteFile(request.id)}
                    disabled={processingId === request.id}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {processingId === request.id ? 'Menghapus...' : 'Hapus File'}
                  </button>

                  {request.status === 'waiting' && (
                    <>
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Review
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-600">
            <h3 className="text-lg font-semibold mb-4 text-white">
              Review Request: {selectedRequest.title}
            </h3>
            
            <div className="mb-4">
              <label htmlFor="admin-notes" className="block text-sm font-medium text-gray-300 mb-2">
                Catatan Admin (opsional):
              </label>
              <textarea
                id="admin-notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tambahkan catatan untuk user..."
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleStatusUpdate(selectedRequest.id, 'accepted')}
                disabled={processingId === selectedRequest.id}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {processingId === selectedRequest.id ? 'Processing...' : 'Terima'}
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedRequest.id, 'declined')}
                disabled={processingId === selectedRequest.id}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {processingId === selectedRequest.id ? 'Processing...' : 'Tolak'}
              </button>
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setAdminNotes('');
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
