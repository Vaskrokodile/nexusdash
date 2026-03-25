import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Zap, TrendingUp, DollarSign, FolderKanban, Activity, CheckCircle, Clock, FileText, BarChart3, Lock } from 'lucide-react'
import { GlassCard } from '../components/GlassCard'
import { GlassButton } from '../components/GlassButton'
import { LineChart, Line, AreaChart, Area, PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from '../components/Charts'
import { formatValue, getInitials } from '../utils/helpers'
import styles from './PublicDashboard.module.css'

export default function PublicDashboard() {
  const { id } = useParams()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const token = localStorage.getItem('nexus_token')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const res = await fetch(`/api/dashboard/${id}`, { headers })
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Dashboard not found')
          }
          throw new Error('Failed to load dashboard')
        }
        const data = await res.json()
        setDashboard(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [id])

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.navbar}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <Zap size={18} color="white" />
            </div>
            <span className={styles.brandName}>NexusDash</span>
          </div>
        </div>
        <main className={styles.main}>
          <div className={styles.loading}>Loading dashboard...</div>
        </main>
      </div>
    )
  }

  if (error || !dashboard) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.navbar}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <Zap size={18} color="white" />
            </div>
            <span className={styles.brandName}>NexusDash</span>
          </div>
        </div>
        <main className={styles.main}>
          <div className={styles.loading}>
            {error || 'Dashboard not found'}
          </div>
        </main>
      </div>
    )
  }

  const { client, widgets, requiresAuth } = dashboard
  const revenueWidget = widgets.find(w => w.id === 'revenue-chart')
  const completionWidget = widgets.find(w => w.id === 'project-completion')
  const statsWidget = widgets.find(w => w.id === 'stats-grid')
  const activityWidget = widgets.find(w => w.id === 'activity-feed')
  const projectsWidget = widgets.find(w => w.id === 'recent-projects')

  const getActivityIcon = (type) => {
    switch (type) {
      case 'project': return <FolderKanban size={14} />
      case 'invoice': return <FileText size={14} />
      case 'task': return <CheckCircle size={14} />
      case 'milestone': return <TrendingUp size={14} />
      default: return <Activity size={14} />
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case 'project': return 'var(--accent-blue)'
      case 'invoice': return 'var(--success)'
      case 'task': return 'var(--accent-cyan)'
      case 'milestone': return 'var(--warning)'
      default: return 'var(--text-muted)'
    }
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.navbar}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Zap size={18} color="white" />
          </div>
          <span className={styles.brandName}>NexusDash</span>
        </div>
        <div className={styles.clientBadge}>
          <div 
            className={styles.clientAvatar}
            style={{ background: `linear-gradient(135deg, ${client.accentColor} 0%, ${client.accentColor}88 100%)` }}
          >
            {getInitials(client.name)}
          </div>
          <span className={styles.clientName}>{client.name}</span>
        </div>
      </div>

      <main className={styles.main}>
        <div className={styles.welcomeSection}>
          <h1 className={styles.welcomeTitle}>Welcome back, {client.name.split(' ')[0]}</h1>
          <p className={styles.welcomeSubtitle}>Here's what's happening with {client.company} today</p>
        </div>

        {requiresAuth && (
          <div className={styles.authOverlay}>
            <GlassCard className={styles.lockCard} glow>
              <Lock size={48} color="var(--primary)" />
              <h2>Authentication Required</h2>
              <p>Please log in with your client credentials to view this dashboard.</p>
              <GlassButton onClick={() => window.location.href = '/login'}>
                Go to Login
              </GlassButton>
            </GlassCard>
          </div>
        )}

        <div className={styles.widgetsGrid}>
          {revenueWidget && (
            <GlassCard className={`${styles.widget} ${styles.widgetLarge}`} interactive={false}>
              <div className={styles.widgetCard}>
                <div className={styles.widgetHeader}>
                  <div className={styles.widgetTitleGroup}>
                    <div className={styles.widgetIcon} style={{ background: `${client.accentColor}20`, color: client.accentColor }}>
                      <TrendingUp size={18} />
                    </div>
                    <span className={styles.widgetTitle}>{revenueWidget.title}</span>
                  </div>
                </div>
                <div className={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={revenueWidget.data}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={client.accentColor} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={client.accentColor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                        tickFormatter={(v) => `$${v/1000}k`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'rgba(15, 25, 45, 0.9)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                        formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={client.accentColor} 
                        strokeWidth={2}
                        fill="url(#revenueGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </GlassCard>
          )}

          {completionWidget && (
            <GlassCard className={styles.widget} interactive={false}>
              <div className={styles.widgetCard}>
                <div className={styles.widgetHeader}>
                  <div className={styles.widgetTitleGroup}>
                    <div className={styles.widgetIcon} style={{ background: `${client.accentColor}20`, color: client.accentColor }}>
                      <BarChart3 size={18} />
                    </div>
                    <span className={styles.widgetTitle}>{completionWidget.title}</span>
                  </div>
                </div>
                <div className={styles.chartContainer} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Tooltip 
                        contentStyle={{ 
                          background: 'rgba(15, 25, 45, 0.9)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                      <Pie
                        innerRadius={50}
                        outerRadius={70}
                        dataKey="value"
                        strokeWidth={12}
                        data={completionWidget.data}
                      >
                        {completionWidget.data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ textAlign: 'center', marginTop: '8px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {completionWidget.metric}%
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Completion Rate</div>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {statsWidget && (
            <GlassCard className={`${styles.widget} ${styles.widgetFull}`} interactive={false}>
              <div className={styles.widgetCard}>
                <div className={styles.widgetHeader}>
                  <div className={styles.widgetTitleGroup}>
                    <div className={styles.widgetIcon} style={{ background: `${client.accentColor}20`, color: client.accentColor }}>
                      <DollarSign size={18} />
                    </div>
                    <span className={styles.widgetTitle}>{statsWidget.title}</span>
                  </div>
                </div>
                <div className={styles.statsGrid}>
                  {statsWidget.stats.map((stat, i) => (
                    <div key={i} className={styles.statItem}>
                      <div className={styles.statValue}>
                        {formatValue(stat.value, stat.format)}
                      </div>
                      <div className={styles.statLabel}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          )}

          {activityWidget && (
            <GlassCard className={`${styles.widget} ${styles.widgetLarge}`} interactive={false}>
              <div className={styles.widgetCard}>
                <div className={styles.widgetHeader}>
                  <div className={styles.widgetTitleGroup}>
                    <div className={styles.widgetIcon} style={{ background: `${client.accentColor}20`, color: client.accentColor }}>
                      <Activity size={18} />
                    </div>
                    <span className={styles.widgetTitle}>{activityWidget.title}</span>
                  </div>
                </div>
                <div className={styles.activityList}>
                  {activityWidget.activities.map((activity, i) => (
                    <div key={activity.id} className={styles.activityItem}>
                      <div 
                        className={styles.activityIcon}
                        style={{ background: `${getActivityColor(activity.type)}20`, color: getActivityColor(activity.type) }}
                      >
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className={styles.activityContent}>
                        <p className={styles.activityText}>{activity.text}</p>
                        <p className={styles.activityTime}>{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          )}

          {projectsWidget && (
            <GlassCard className={styles.widget} interactive={false}>
              <div className={styles.widgetCard}>
                <div className={styles.widgetHeader}>
                  <div className={styles.widgetTitleGroup}>
                    <div className={styles.widgetIcon} style={{ background: `${client.accentColor}20`, color: client.accentColor }}>
                      <FolderKanban size={18} />
                    </div>
                    <span className={styles.widgetTitle}>{projectsWidget.title}</span>
                  </div>
                </div>
                <div className={styles.projectList}>
                  {projectsWidget.projects.map((project) => (
                    <div key={project.id} className={styles.projectItem}>
                      <div className={styles.projectHeader}>
                        <span className={styles.projectName}>{project.name}</span>
                        <span className={`${styles.projectStatus} ${styles[project.status.replace('-', '')]}`}>
                          {project.status.replace('-', ' ')}
                        </span>
                      </div>
                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progressFill}
                          style={{ width: `${project.progress}%`, background: client.accentColor }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      </main>
    </div>
  )
}
