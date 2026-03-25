import { TrendingUp, TrendingDown } from 'lucide-react'
import { GlassCard } from './GlassCard'
import { formatValue } from '../utils/helpers'
import styles from './MetricCard.module.css'

export function MetricCard({ 
  icon: Icon, 
  value, 
  format, 
  label, 
  trend, 
  trendDirection = 'up',
  onClick 
}) {
  return (
    <GlassCard interactive={!!onClick} onClick={onClick} className={styles.metricCard}>
      <div className={styles.glow} />
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <div className={styles.iconOuter} />
          <div className={styles.iconMiddle} />
          <div className={styles.iconInner}>
            <div className={styles.iconCore}>
              <Icon size={20} />
            </div>
          </div>
        </div>
        {trend && (
          <div className={`${styles.trend} ${trendDirection === 'up' ? styles.trendUp : styles.trendDown}`}>
            {trendDirection === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend}
          </div>
        )}
      </div>
      <div className={styles.content}>
        <div className={styles.value}>{formatValue(value, format)}</div>
        <div className={styles.label}>{label}</div>
      </div>
    </GlassCard>
  )
}
