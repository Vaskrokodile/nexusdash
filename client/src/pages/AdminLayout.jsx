import { Outlet } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Sidebar } from '../components/Sidebar'
import { GlassInput } from '../components/GlassInput'
import styles from './AdminLayout.module.css'

export default function AdminLayout() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
