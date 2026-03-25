import { useEffect, useState, useMemo } from 'react'
import { Search, Plus, UserCog, Trash2, Edit2, Key, Shield } from 'lucide-react'
import { useDashboard } from '../context/DashboardContext'
import { GlassButton } from '../components/GlassButton'
import { GlassInput } from '../components/GlassInput'
import { Modal } from '../components/Modal'
import { GlassCard } from '../components/GlassCard'
import styles from './UsersPage.module.css'

export default function UsersPage() {
  const { users, clients, loading, fetchUsers, fetchClients, createUser, updateUser, deleteUser } = useDashboard()
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({ email: '', password: '', name: '', clientId: '' })
  const [formError, setFormError] = useState('')

  useEffect(() => {
    fetchUsers()
    fetchClients()
  }, [fetchUsers, fetchClients])

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users
    const query = searchQuery.toLowerCase()
    return users.filter(u => 
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
    )
  }, [users, searchQuery])

  const getClientName = (clientId) => {
    if (!clientId) return 'No client assigned'
    const client = clients.find(c => c.id === clientId)
    return client ? client.name : 'Unknown client'
  }

  const handleNewUser = () => {
    setEditingUser(null)
    setFormData({ email: '', password: '', name: '', clientId: '' })
    setFormError('')
    setShowModal(true)
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setFormData({ 
      email: user.email, 
      password: '', 
      name: user.name, 
      clientId: user.client_id || '' 
    })
    setFormError('')
    setShowModal(true)
  }

  const handleDeleteUser = (user) => {
    setDeleteConfirm(user)
  }

  const confirmDelete = async () => {
    if (deleteConfirm) {
      await deleteUser(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!formData.email || !formData.name || (!editingUser && !formData.password)) {
      setFormError('Email, name, and password are required')
      return
    }

    try {
      const submitData = { ...formData }
      if (!submitData.password) delete submitData.password
      if (!submitData.clientId) submitData.clientId = null

      if (editingUser) {
        await updateUser(editingUser.id, submitData)
      } else {
        await createUser(submitData)
      }
      setShowModal(false)
    } catch (err) {
      setFormError(err.message)
    }
  }

  const handleCopyCredentials = (user) => {
    const credentials = `Email: ${user.email}\nPassword: (use forgot password or ask admin to reset)`
    navigator.clipboard.writeText(credentials)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>User Management</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <GlassInput
            placeholder="Search users..."
            icon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <GlassButton onClick={handleNewUser}>
            <Plus size={18} />
            New User
          </GlassButton>
        </div>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.emptyState}>
            <p>Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <UserCog size={32} />
            </div>
            <h3 className={styles.emptyTitle}>
              {searchQuery ? 'No users found' : 'No users yet'}
            </h3>
            <p className={styles.emptyText}>
              {searchQuery 
                ? `No users match "${searchQuery}"`
                : 'Create client credentials for your customers to access their dashboards'
              }
            </p>
            {!searchQuery && (
              <GlassButton onClick={handleNewUser}>
                <Plus size={16} />
                Create First User
              </GlassButton>
            )}
          </div>
        ) : (
          <div className={styles.usersGrid}>
            {filteredUsers.map((user) => (
              <GlassCard key={user.id} className={styles.userCard}>
                <div className={styles.userHeader}>
                  <div className={styles.avatar}>
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className={styles.userInfo}>
                    <h3 className={styles.userName}>{user.name}</h3>
                    <p className={styles.userEmail}>{user.email}</p>
                  </div>
                  <div className={styles.actions}>
                    <GlassButton 
                      size="small" 
                      variant="ghost"
                      onClick={() => handleCopyCredentials(user)}
                      title="Copy credentials"
                    >
                      <Key size={14} />
                    </GlassButton>
                    <GlassButton 
                      size="small" 
                      variant="ghost"
                      onClick={() => handleEditUser(user)}
                      title="Edit user"
                    >
                      <Edit2 size={14} />
                    </GlassButton>
                    <GlassButton 
                      size="small" 
                      variant="ghost"
                      onClick={() => handleDeleteUser(user)}
                      title="Delete user"
                    >
                      <Trash2 size={14} />
                    </GlassButton>
                  </div>
                </div>
                <div className={styles.userMeta}>
                  <div className={styles.metaItem}>
                    <Shield size={14} />
                    <span>{user.role}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.clientBadge}>{getClientName(user.client_id)}</span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? 'Edit User' : 'Create New User'}
        footer={
          <>
            <GlassButton variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </GlassButton>
            <GlassButton onClick={handleSubmit}>
              {editingUser ? 'Update' : 'Create'}
            </GlassButton>
          </>
        }
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          {formError && <div className={styles.formError}>{formError}</div>}
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Name</label>
            <GlassInput
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <GlassInput
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Password {editingUser && <span className={styles.optional}>(leave blank to keep current)</span>}
            </label>
            <GlassInput
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={editingUser ? '••••••••' : 'Enter password'}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Assign to Client</label>
            <select 
              className={styles.select}
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
            >
              <option value="">No client assigned</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.company})
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete User"
        footer={
          <>
            <GlassButton variant="ghost" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </GlassButton>
            <GlassButton variant="danger" onClick={confirmDelete}>
              Delete
            </GlassButton>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)' }}>
          Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{deleteConfirm?.name}</strong>? 
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}