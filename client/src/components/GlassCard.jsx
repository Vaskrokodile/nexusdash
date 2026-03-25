import styles from './Glass.module.css'
import { classNames } from '../utils/helpers'

export function GlassCard({ 
  children, 
  className, 
  large, 
  small,
  interactive = true,
  glow,
  glowCyan,
  static: isStatic,
  style,
  onClick,
  ...props 
}) {
  const classes = classNames(
    styles.glass,
    large && styles.glassLarge,
    small && styles.glassSmall,
    interactive && !isStatic && styles.glassInteractive,
    isStatic && styles.glassStatic,
    glow && styles.glow,
    glowCyan && styles.glowCyan,
    className
  )

  return (
    <div 
      className={classes} 
      style={style}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}

export function GlassPanel({ children, className, style, ...props }) {
  return (
    <div 
      className={`${styles.glass} ${styles.glassStatic} ${className || ''}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  )
}
