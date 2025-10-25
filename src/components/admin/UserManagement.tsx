import { useEffect, useState } from 'react'
import { AdminService } from '../../services/adminService'
import type { User } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

type ListedUser = User & { banned?: boolean }

export function UserManagement() {
  const { userProfile } = useAuth()
  const [users, setUsers] = useState<ListedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  const debouncedSearch = useDebounce(search, 300)

  const load = async () => {
    setLoading(true)
    setError('')
    const { users, error } = await AdminService.listUsers({ search: debouncedSearch, limit: 50, offset: 0 })
    if (error) setError(error)
    setUsers((users as ListedUser[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const handleBanToggle = async (u: ListedUser) => {
    setBusyId(u.id)
    // const fn = u.role === 'admin' ? null : undefined // Prevent banning admins here
    try {
      if (u.role === 'admin') {
        setError('Tidak bisa ban admin')
        return
      }
      const reason = window.prompt('Alasan banned (opsional):') || null
      // Expect a server flag to mark banned status; using RPCs here
      const { error } = await AdminService.banUser(u.id, reason || undefined)
      if (error) setError(error)
      await load()
    } finally {
      setBusyId(null)
    }
  }

  const handleUnban = async (u: ListedUser) => {
    setBusyId(u.id)
    try {
      const { error } = await AdminService.unbanUser(u.id)
      if (error) setError(error)
      await load()
    } finally {
      setBusyId(null)
    }
  }

  const handleRoleChange = async (u: ListedUser, role: 'admin' | 'user') => {
    setBusyId(u.id)
    try {
      const { error } = await AdminService.setUserRole(u.id, role)
      if (error) setError(error)
      await load()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-100">User Management</h2>
        <div className="flex items-center space-x-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari username / email / nama"
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400"
          />
          <button
            onClick={load}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-gray-400">
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-white/10">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        {(u.username || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-gray-100 font-medium">{u.full_name || u.username}</div>
                        <div className="text-gray-400 text-sm">@{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{u.email}</td>
                  <td className="px-4 py-3 space-x-2 align-middle">
                    <span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-purple-600/30 text-purple-200' : 'bg-white/10 text-gray-300'}`}>
                      {u.role}
                    </span>
                    {u.banned && (
                      <span className="px-2 py-1 rounded text-xs bg-red-600/30 text-red-200">banned</span>
                    )}
                    <div className="inline-flex ml-2 bg-white/10 border border-white/20 rounded overflow-hidden">
                      <button
                        onClick={() => handleRoleChange(u, 'user')}
                        disabled={!!busyId || u.id === userProfile?.id || u.role === 'user'}
                        className={`px-3 py-1 text-xs ${u.role === 'user' ? 'bg-blue-600 text-white' : 'text-gray-100 hover:bg-white/10'} disabled:opacity-50`}
                      >
                        user
                      </button>
                      <button
                        onClick={() => handleRoleChange(u, 'admin')}
                        disabled={!!busyId || u.id === userProfile?.id || u.role === 'admin'}
                        className={`px-3 py-1 text-xs border-l border-white/20 ${u.role === 'admin' ? 'bg-blue-600 text-white' : 'text-gray-100 hover:bg-white/10'} disabled:opacity-50`}
                      >
                        admin
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => handleBanToggle(u)}
                      disabled={!!busyId || u.role === 'admin' || !!u.banned || u.id === userProfile?.id}
                      className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                    >
                      Ban
                    </button>
                    <button
                      onClick={() => handleUnban(u)}
                      disabled={!!busyId || !u.banned || u.id === userProfile?.id}
                      className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                    >
                      Unban
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}
