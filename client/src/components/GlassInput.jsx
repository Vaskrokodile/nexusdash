import { forwardRef } from 'react'
import styles from './GlassInput.module.css'
import { classNames } from '../utils/helpers'

export const GlassInput = forwardRef(({ 
  label,
  error,
  icon: Icon,
  iconRight: IconRight,
  className,
  ...props 
}, ref) => {
  return (
    <div className={styles.inputWrapper}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.inputContainer}>
        {Icon && <Icon size={18} className={styles.icon} />}
        <input
          ref={ref}
          className={classNames(
            styles.input,
            error && styles.inputError,
            Icon && styles.hasIcon,
            IconRight && styles.hasIconRight,
            className
          )}
          {...props}
        />
        {IconRight && <IconRight size={18} className={styles.iconRight} />}
      </div>
      {error && (
        <span className={styles.errorMessage}>{error}</span>
      )}
    </div>
  )
})

GlassInput.displayName = 'GlassInput'

export const GlassTextarea = forwardRef(({ 
  label,
  error,
  className,
  ...props 
}, ref) => {
  return (
    <div className={styles.inputWrapper}>
      {label && <label className={styles.label}>{label}</label>}
      <textarea
        ref={ref}
        className={classNames(
          styles.input,
          styles.textarea,
          error && styles.inputError,
          className
        )}
        {...props}
      />
      {error && (
        <span className={styles.errorMessage}>{error}</span>
      )}
    </div>
  )
})

GlassTextarea.displayName = 'GlassTextarea'

export const GlassSelect = forwardRef(({ 
  label,
  error,
  children,
  className,
  ...props 
}, ref) => {
  return (
    <div className={styles.inputWrapper}>
      {label && <label className={styles.label}>{label}</label>}
      <select
        ref={ref}
        className={classNames(
          styles.input,
          error && styles.inputError,
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <span className={styles.errorMessage}>{error}</span>
      )}
    </div>
  )
})

GlassSelect.displayName = 'GlassSelect'
