import { useNavigate } from 'react-router-dom'
import { Eye, Edit2, Trash2 } from 'lucide-react'
import { GlassCard } from './GlassCard'
import { formatValue, getInitials } from '../utils/helpers'
import styles from './ClientCard.module.css'

export function ClientCard({ client, onEdit, onDelete }) {
  const navigate = useNavigate()

  const handleView = (e) => {
    e.stopPropagation()
    navigate(`/admin/clients/${client.id}`)
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    onEdit(client)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    onDelete(client)
  }

  const handleCardClick = () => {
    navigate(`/admin/clients/${client.id}`)
  }

  return (
    <GlassCard 
      interactive 
      onClick={handleCardClick}
      className={styles.clientCard}
    >
      <div className={`${styles.statusBadge} ${styles[client.status]}`} />
      
      <div className={styles.header}>
        <div 
          className={styles.avatar}
          style={{ background: `linear-gradient(135deg, ${client.accentColor} 0%, ${client.accentColor}88 100%)` }}
        >
          {getInitials(client.name)}
        </div>
        <div className={styles.info}>
          <div className={styles.name}>{client.name}</div>
          <div className={styles.company}>{client.company}</div>
        </div>
      </div>

      <div className={styles.metric}>
        <div className={styles.metricValue}>
          {formatValue(client.metrics.revenue, 'currency')}
        </div>
        <div className={styles.metricLabel}>Total Revenue</div>
      </div>

      <div className={styles.actions}>
        <button 
          className={styles.actionBtn} 
          onClick={handleView}
          title="View Dashboard"
        >
          <Eye size={14} />
          View
        </button>
        <button 
          className={styles.actionBtn} 
          onClick={handleEdit}
          title="Edit Client"
        >
          <Edit2 size={14} />
          Edit
        </button>
        <button 
          className={`${styles.actionBtn} ${styles.danger}`} 
          onClick={handleDelete}
          title="Delete Client"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </GlassCard>
  )
}
