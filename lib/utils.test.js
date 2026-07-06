import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('combina clases correctamente', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
  })

  it('maneja clases condicionales', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
  })

  it('fusiona clases de Tailwind', () => {
    expect(cn('px-4', 'px-2')).toBe('px-2')
  })
})
