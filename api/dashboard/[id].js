import jwt from 'jsonwebtoken';
import { supabase } from '../../supabase.js';

const JWT_SECRET = process.env.JWT_SECRET || 'nexus-dash-secret-key-change-in-production';

function generateWidgets(client, authorized) {
  const revenueData = [
    { month: 'Jul', value: 0 },
    { month: 'Aug', value: 0 },
    { month: 'Sep', value: 0 },
    { month: 'Oct', value: 0 },
    { month: 'Nov', value: 0 },
    { month: 'Dec', value: 0 }
  ];

  const projectData = [
    { name: 'Completed', value: client.metrics?.completion || 0, color: client.accent_color || '#3b82f6' },
    { name: 'In Progress', value: 100 - (client.metrics?.completion || 0), color: 'rgba(255,255,255,0.2)' }
  ];

  const widgets = [
    {
      id: 'revenue-chart',
      type: 'line-chart',
      title: 'Revenue Overview',
      data: revenueData,
      metric: client.metrics?.revenue || 0,
      format: 'currency'
    },
    {
      id: 'project-completion',
      type: 'donut-chart',
      title: 'Project Completion',
      data: projectData,
      metric: client.metrics?.completion || 0,
      format: 'percent'
    },
    {
      id: 'stats-grid',
      type: 'stats-grid',
      title: 'Key Metrics',
      stats: [
        { label: 'Total Revenue', value: client.metrics?.revenue || 0, format: 'currency' },
        { label: 'Active Projects', value: client.metrics?.projects || 0, format: 'number' },
        { label: 'Tasks Tracked', value: client.metrics?.tasks || 0, format: 'number' },
        { label: 'Completion Rate', value: client.metrics?.completion || 0, format: 'percent' }
      ]
    },
    {
      id: 'activity-feed',
      type: 'activity-feed',
      title: 'Recent Activity',
      activities: []
    },
    {
      id: 'recent-projects',
      type: 'project-list',
      title: 'Projects',
      projects: []
    }
  ];

  if (!authorized) {
    return widgets.map(w => ({ ...w, data: [], activities: [], projects: [], stats: w.stats ? w.stats.map(s => ({ ...s, value: 0 })) : [] }));
  }

  return widgets;
}

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Dashboard ID required' });
  }

  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !client) {
    return res.status(404).json({ error: 'Dashboard not found' });
  }

  let authorized = false;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.userId)
        .single();

      if (user && user.client_id === id) {
        authorized = true;
      }
    } catch (err) {
    }
  }

  const widgets = generateWidgets(client, authorized);

  return res.json({
    client,
    widgets,
    authorized,
    requiresAuth: !authorized
  });
}