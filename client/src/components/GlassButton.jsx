import styles from './GlassButton.module.css'
import { classNames } from '../utils/helpers'

export function GlassButton({ 
  children, 
  variant = 'primary',
  size = 'medium',
  iconOnly = false,
  fullWidth = false,
  shimmer = false,
  className,
  loading,
  disabled,
  ...props 
}) {
  const classes = classNames(
    styles.button,
    styles[variant],
    size === 'small' && styles.small,
    size === 'large' && styles.large,
    iconOnly && styles.iconOnly,
    fullWidth && styles.fullWidth,
    shimmer && styles.shimmer,
    className
  )

  return (
    <button 
      className={classes} 
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={styles.spinner} />
          {children}
        </span>
      ) : children}
    </button>
  )
}

export function IconButton({ children, className, ...props }) {
  return (
    <GlassButton 
      iconOnly 
      className={className}
      {...props}
    >
      {children}
    </GlassButton>
  )
}
