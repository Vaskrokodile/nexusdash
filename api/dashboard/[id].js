import jwt from 'jsonwebtoken';
import { connectDB } from '../db.js';
import Client from '../models/Client.js';
import User from '../models/User.js';
import { JWT_SECRET } from '../authMiddleware.js';

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
    { name: 'Completed', value: client.metrics.completion, color: client.accentColor },
    { name: 'In Progress', value: 100 - client.metrics.completion, color: 'rgba(255,255,255,0.2)' }
  ];

  const widgets = [
    {
      id: 'revenue-chart',
      type: 'line-chart',
      title: 'Revenue Overview',
      data: revenueData,
      metric: client.metrics.revenue,
      format: 'currency'
    },
    {
      id: 'project-completion',
      type: 'donut-chart',
      title: 'Project Completion',
      data: projectData,
      metric: client.metrics.completion,
      format: 'percent'
    },
    {
      id: 'stats-grid',
      type: 'stats-grid',
      title: 'Key Metrics',
      stats: [
        { label: 'Total Revenue', value: client.metrics.revenue, format: 'currency' },
        { label: 'Active Projects', value: client.metrics.projects, format: 'number' },
        { label: 'Tasks Tracked', value: client.metrics.tasks, format: 'number' },
        { label: 'Completion Rate', value: client.metrics.completion, format: 'percent' }
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
  await connectDB();

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Dashboard ID required' });
  }

  try {
    const client = await Client.findById(id);
    
    if (!client) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    let authorized = false;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (user && user.clientId && user.clientId.toString() === id) {
          authorized = true;
        }
      } catch (err) {
      }
    }

    const widgets = generateWidgets(client, authorized);
    
    return res.json({ 
      client: client.toObject(), 
      widgets,
      authorized,
      requiresAuth: !authorized
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}