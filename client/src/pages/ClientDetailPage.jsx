import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, ExternalLink, FolderKanban, FileText, Activity } from 'lucide-react'
import { useDashboard } from '../context/DashboardContext'
import { GlassButton } from '../components/GlassButton'
import { Modal } from '../components/Modal'
import { ClientForm } from '../components/ClientForm'
import { getInitials, formatValue } from '../utils/helpers'
import styles from './ClientDetailPage.module.css'

const tabItems = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'invoices', label: 'Invoices', icon: FileText },
]

export default function ClientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { clients, fetchClients, updateClient } = useDashboard()
  const [activeTab, setActiveTab] = useState('overview')
  const [showEditModal, setShowEditModal] = useState(false)

  const client = clients.find(c => c.id === id)

  useEffect(() => {
    if (clients.length === 0) {
      fetchClients()
    }
  }, [clients.length, fetchClients])

  useEffect(() => {
    if (client) {
      document.title = `${client.name} - NexusDash`
    }
    return () => {
      document.title = 'NexusDash'
    }
  }, [client])

  if (!client) {
    return (
      <div className={styles.page}>
        <div className={styles.backLink} onClick={() => navigate('/admin/clients')}>
          <ArrowLeft size={16} />
          Back to Clients
        </div>
        <p>Client not found</p>
      </div>
    )
  }

  const handleEdit = (data) => {
    updateClient(client.id, data)
    setShowEditModal(false)
  }

  const getProjectStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'var(--success)'
      case 'in-progress': return 'var(--accent-blue)'
      case 'review': return 'var(--warning)'
      default: return 'var(--text-muted)'
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.backLink} onClick={() => navigate('/admin/clients')}>
        <ArrowLeft size={16} />
        Back to Clients
      </div>

      <div className={styles.header}>
        <div 
          className={styles.avatar}
          style={{ background: `linear-gradient(135deg, ${client.accentColor} 0%, ${client.accentColor}88 100%)` }}
        >
          {getInitials(client.name)}
        </div>
        <div className={styles.info}>
          <h1 className={styles.name}>{client.name}</h1>
          <p className={styles.company}>{client.company}</p>
          <div className={`${styles.status} ${styles[client.status]}`}>
            <span className={styles.statusDot} />
            {client.status}
          </div>
        </div>
        <div className={styles.actions}>
          <GlassButton onClick={() => setShowEditModal(true)}>
            <Edit2 size={16} />
            Edit
          </GlassButton>
          <GlassButton 
            variant="secondary"
            onClick={() => window.open(`/dashboard/${client.id}`, '_blank')}
          >
            <ExternalLink size={16} />
            View Dashboard
          </GlassButton>
        </div>
      </div>

      <div className={styles.tabs}>
        {tabItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`${styles.tab} ${activeTab === id ? styles.active : ''}`}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'overview' && (
          <>
            <div className={styles.metricsGrid}>
              <div className={styles.metricItem}>
                <div className={styles.metricValue}>
                  {formatValue(client.metrics.revenue, 'currency')}
                </div>
                <div className={styles.metricLabel}>Total Revenue</div>
              </div>
              <div className={styles.metricItem}>
                <div className={styles.metricValue}>
                  {client.metrics.projects}
                </div>
                <div className={styles.metricLabel}>Projects</div>
              </div>
              <div className={styles.metricItem}>
                <div className={styles.metricValue}>
                  {client.metrics.tasks}
                </div>
                <div className={styles.metricLabel}>Tasks</div>
              </div>
              <div className={styles.metricItem}>
                <div className={styles.metricValue}>
                  {client.metrics.completion}%
                </div>
                <div className={styles.metricLabel}>Completion</div>
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Recent Activity</h3>
              <div className={styles.activityList}>
                <div className={styles.emptyMessage}>
                  No activity yet
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'projects' && (
          <div className={styles.projectsList}>
            <div className={styles.emptyMessage}>
              No projects yet
            </div>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div>
            <div className={styles.emptyMessage}>
              No invoices yet
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Client"
        footer={
          <>
            <GlassButton variant="ghost" onClick={() => setShowEditModal(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" form="client-form">
              Save Changes
            </GlassButton>
          </>
        }
      >
        <ClientForm
          initialData={client}
          onSubmit={handleEdit}
        />
      </Modal>
    </div>
  )
}
