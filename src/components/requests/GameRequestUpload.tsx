import React, { useState } from 'react';
import { gameRequestService, type CreateGameRequestData } from '../../services/gameRequestService';

interface GameRequestUploadProps {
  onRequestCreated?: () => void;
}

export const GameRequestUpload: React.FC<GameRequestUploadProps> = ({ onRequestCreated }) => {
  const [formData, setFormData] = useState<Omit<CreateGameRequestData, 'file'>>({
    title: '',
    description: '',
    category: 'Arcade',
  });
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type (only zip files)
      if (!selectedFile.name.toLowerCase().endsWith('.zip')) {
        setError('Hanya file ZIP yang diperbolehkan');
        return;
      }
      
      // Validate file size (max 100MB)
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError('Ukuran file maksimal 100MB');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Silakan pilih file ZIP game');
      return;
    }

    if (!formData.title.trim()) {
      setError('Judul game harus diisi');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      await gameRequestService.createRequest({
        ...formData,
        file,
      });
      
      setSuccess(true);
      setFormData({ title: '', description: '', category: 'Arcade' });
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('game-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      onRequestCreated?.();
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengirim request');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6">Upload Game Baru</h2>
      
      {success && (
        <div className="mb-4 p-4 bg-green-900/50 border border-green-500 text-green-300 rounded-lg backdrop-blur-sm">
          Request game berhasil dikirim! Admin akan meninjau game Anda.
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-500 text-red-300 rounded-lg backdrop-blur-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
            Judul Game *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Masukkan judul game"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
            Kategori
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Arcade">Arcade</option>
            <option value="Strategi">Strategi</option>
            <option value="Aksi">Aksi</option>
            <option value="Horor">Horor</option>
            <option value="Puzzle">Puzzle</option>
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
            Deskripsi
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Deskripsikan game Anda (opsional)"
          />
        </div>

        <div>
          <label htmlFor="game-file" className="block text-sm font-medium text-gray-300 mb-2">
            File Game (ZIP) *
          </label>
          <input
            type="file"
            id="game-file"
            accept=".zip"
            onChange={handleFileChange}
            required
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-400 mt-1">
            Upload file ZIP yang berisi game Anda (maksimal 100MB)
          </p>
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-md hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
        >
          {isUploading ? 'Mengirim...' : 'Kirim Request'}
        </button>
      </form>
    </div>
  );
};
