import { useEffect, useState, useMemo } from 'react'
import { Search, Plus, Users } from 'lucide-react'
import { useDashboard } from '../context/DashboardContext'
import { ClientCard } from '../components/ClientCard'
import { GlassButton } from '../components/GlassButton'
import { GlassInput } from '../components/GlassInput'
import { Modal } from '../components/Modal'
import { ClientForm } from '../components/ClientForm'
import styles from './ClientsPage.module.css'

export default function ClientsPage() {
  const { clients, loading, fetchClients, createClient, updateClient, deleteClient } = useDashboard()
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients
    const query = searchQuery.toLowerCase()
    return clients.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.company.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query)
    )
  }, [clients, searchQuery])

  const handleNewClient = () => {
    setEditingClient(null)
    setShowModal(true)
  }

  const handleEditClient = (client) => {
    setEditingClient(client)
    setShowModal(true)
  }

  const handleDeleteClient = (client) => {
    setDeleteConfirm(client)
  }

  const confirmDelete = async () => {
    if (deleteConfirm) {
      await deleteClient(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }

  const handleSubmit = async (data) => {
    try {
      if (editingClient) {
        await updateClient(editingClient.id, data)
      } else {
        await createClient(data)
      }
      setShowModal(false)
    } catch (err) {
      throw err
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Clients</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <GlassInput
            placeholder="Search clients..."
            icon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <GlassButton onClick={handleNewClient}>
            <Plus size={18} />
            New Client
          </GlassButton>
        </div>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.emptyState}>
            <p>Loading clients...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Users size={32} />
            </div>
            <h3 className={styles.emptyTitle}>
              {searchQuery ? 'No clients found' : 'No clients yet'}
            </h3>
            <p className={styles.emptyText}>
              {searchQuery 
                ? `No clients match "${searchQuery}"`
                : 'Create your first client to start building beautiful dashboards'
              }
            </p>
            {!searchQuery && (
              <GlassButton onClick={handleNewClient}>
                <Plus size={16} />
                Create First Client
              </GlassButton>
            )}
          </div>
        ) : (
          <div className={styles.clientsGrid}>
            {filteredClients.map((client, i) => (
              <ClientCard
                key={client.id}
                client={client}
                onEdit={handleEditClient}
                onDelete={handleDeleteClient}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingClient ? 'Edit Client' : 'Create New Client'}
        footer={
          <>
            <GlassButton variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" form="client-form">
              {editingClient ? 'Update' : 'Create'}
            </GlassButton>
          </>
        }
      >
        <ClientForm
          initialData={editingClient}
          onSubmit={handleSubmit}
        />
      </Modal>

      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Client"
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
