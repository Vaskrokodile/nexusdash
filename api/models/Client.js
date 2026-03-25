import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String, required: true },
  email: { type: String, required: true },
  avatar: { type: String, default: null },
  accentColor: { type: String, default: '#3b82f6' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  metrics: {
    revenue: { type: Number, default: 0 },
    projects: { type: Number, default: 0 },
    tasks: { type: Number, default: 0 },
    completion: { type: Number, default: 0 }
  }
}, { timestamps: true });

export default mongoose.models.Client || mongoose.model('Client', clientSchema);