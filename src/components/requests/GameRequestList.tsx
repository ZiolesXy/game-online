import React, { useState, useEffect } from 'react';
import { gameRequestService, type GameRequest } from '../../services/gameRequestService';

interface GameRequestListProps {
  refreshTrigger?: number;
}

export const GameRequestList: React.FC<GameRequestListProps> = ({ refreshTrigger }) => {
  const [requests, setRequests] = useState<GameRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await gameRequestService.getUserRequests();
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat request');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [refreshTrigger]);

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

  if (loading) {
    return (
      <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-gray-700">
        <div className="text-red-400 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6">Request Game Saya</h2>
      
      {requests.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>Belum ada request game yang dikirim.</p>
          <p className="text-sm mt-2">Kirim request pertama Anda menggunakan form di atas!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="border border-gray-600 rounded-lg p-4 bg-gray-800/30">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-white">{request.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                  {getStatusText(request.status)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
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
                  {request.admin_notes && (
                    <div className="mt-2">
                      <p className="font-medium text-gray-200">Catatan Admin:</p>
                      <p className="text-gray-300 bg-gray-700/50 p-2 rounded mt-1">{request.admin_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
