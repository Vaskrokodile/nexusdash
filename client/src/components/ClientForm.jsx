import { useState } from 'react'
import { User, Building2, Mail, Lock } from 'lucide-react'
import { GlassInput } from './GlassInput'
import { GlassSelect } from './GlassInput'
import styles from './ClientForm.module.css'

const colorOptions = [
  '#3b82f6', '#06b6d4', '#8b5cf6', '#10b981', 
  '#f59e0b', '#ec4899', '#ef4444', '#6366f1'
]

export function ClientForm({ initialData, onSubmit }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    company: initialData?.company || '',
    email: initialData?.email || '',
    password: '',
    accentColor: initialData?.accentColor || '#3b82f6',
    status: initialData?.status || 'active'
  })
  const [errors, setErrors] = useState({})

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.company.trim()) newErrors.company = 'Company is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }
    if (!initialData && !formData.password.trim()) {
      newErrors.password = 'Password is required'
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
  }

  return (
    <form id="client-form" className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <GlassInput
          label="Full Name"
          placeholder="Sarah Mitchell"
          icon={User}
          value={formData.name}
          onChange={handleChange('name')}
          error={errors.name}
        />
        <GlassInput
          label="Company"
          placeholder="Quantum Analytics"
          icon={Building2}
          value={formData.company}
          onChange={handleChange('company')}
          error={errors.company}
        />
      </div>

      <GlassInput
        label="Email Address"
        type="email"
        placeholder="sarah@company.com"
        icon={Mail}
        value={formData.email}
        onChange={handleChange('email')}
        error={errors.email}
      />

      <GlassInput
        label="Password"
        type="password"
        placeholder={initialData ? "(leave blank to keep current)" : "Create password for client login"}
        icon={Lock}
        value={formData.password}
        onChange={handleChange('password')}
        error={errors.password}
      />

      <GlassSelect
        label="Status"
        value={formData.status}
        onChange={handleChange('status')}
      >
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </GlassSelect>

      <div className={styles.colorPicker}>
        <span className={styles.colorLabel}>Accent Color</span>
        <div className={styles.colorOptions}>
          {colorOptions.map(color => (
            <button
              key={color}
              type="button"
              className={`${styles.colorOption} ${formData.accentColor === color ? styles.selected : ''}`}
              style={{ background: color }}
              onClick={() => setFormData(prev => ({ ...prev, accentColor: color }))}
            />
          ))}
        </div>
      </div>
    </form>
  )
}
