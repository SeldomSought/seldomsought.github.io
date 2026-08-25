import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './Button.module.css'

type Variant = 'default' | 'primary' | 'ghost'

function variantClassName(variant: Variant): string {
  return variant === 'primary' ? styles.primary : variant === 'ghost' ? styles.ghost : ''
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

export function Button({ variant = 'default', className, type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={[styles.btn, variantClassName(variant), className].filter(Boolean).join(' ')} {...rest} />
}

interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant
}

/** Same visual language as Button, for cases that need a real link — an
 * in-page anchor jump, most often — rather than a click handler. */
export function LinkButton({ variant = 'default', className, ...rest }: LinkButtonProps) {
  return <a className={[styles.btn, variantClassName(variant), className].filter(Boolean).join(' ')} {...rest} />
}

export function ButtonRow({ children }: { children: ReactNode }) {
  return <div className={styles.row}>{children}</div>
}
