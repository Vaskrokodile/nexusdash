import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, DollarSign, FolderKanban, TrendingUp, Plus, Briefcase } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useDashboard } from '../context/DashboardContext'
import { MetricCard } from '../components/MetricCard'
import { ClientCard } from '../components/ClientCard'
import { GlassButton } from '../components/GlassButton'
import { Modal } from '../components/Modal'
import { ClientForm } from '../components/ClientForm'
import styles from './AdminDashboard.module.css'

export default function AdminDashboard() {
  const { user } = useAuth()
  const { clients, loading, fetchClients, createClient, updateClient, deleteClient } = useDashboard()
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const stats = {
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === 'active').length,
    totalRevenue: clients.reduce((sum, c) => sum + c.metrics.revenue, 0),
    avgCompletion: clients.length > 0 
      ? Math.round(clients.reduce((sum, c) => sum + c.metrics.completion, 0) / clients.length)
      : 0
  }

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

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.greeting}>{getGreeting()}, {user?.name?.split(' ')[0]}</p>
        </div>
        <GlassButton onClick={handleNewClient}>
          <Plus size={18} />
          New Client
        </GlassButton>
      </div>

      <div className={styles.statsGrid}>
        <MetricCard
          icon={Users}
          value={stats.totalClients}
          format="number"
          label="Total Clients"
        />
        <MetricCard
          icon={DollarSign}
          value={stats.totalRevenue}
          format="currency"
          label="Total Revenue"
        />
        <MetricCard
          icon={FolderKanban}
          value={clients.reduce((sum, c) => sum + c.metrics.projects, 0)}
          format="number"
          label="Active Projects"
        />
        <MetricCard
          icon={TrendingUp}
          value={stats.avgCompletion}
          format="percent"
          label="Avg. Completion"
        />
      </div>

      <section className={styles.clientsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Clients</h2>
        </div>

        <div className={styles.clientsGrid}>
          {loading ? (
            <div className={styles.emptyState}>
              <p>Loading clients...</p>
            </div>
          ) : clients.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <Briefcase size={28} />
              </div>
              <h3 className={styles.emptyTitle}>No clients yet</h3>
              <p className={styles.emptyText}>
                Create your first client to start building beautiful dashboards
              </p>
              <GlassButton onClick={handleNewClient}>
                <Plus size={16} />
                Create First Client
              </GlassButton>
            </div>
          ) : (
            clients.slice(0, 6).map((client, i) => (
              <ClientCard
                key={client.id}
                client={client}
                onEdit={handleEditClient}
                onDelete={handleDeleteClient}
              />
            ))
          )}
        </div>
      </section>

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
