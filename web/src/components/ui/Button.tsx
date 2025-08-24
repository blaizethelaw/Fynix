import { ButtonHTMLAttributes } from 'react'

export function Button({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={'btn ' + className} />
}
export function ButtonMuted({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={'btn-muted ' + className} />
}
