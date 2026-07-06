import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFetch = vi.fn()
global.fetch = mockFetch

beforeEach(() => {
  mockFetch.mockReset()
  localStorage.clear()
})

describe('api-client', () => {
  it('extractList devuelve array vacío para null', async () => {
    const { extractList } = await import('@/lib/api-client')
    expect(extractList(null)).toEqual([])
  })

  it('extractList devuelve el array si el payload es un array', async () => {
    const { extractList } = await import('@/lib/api-client')
    const data = [{ id: 1 }]
    expect(extractList(data)).toEqual(data)
  })

  it('extractList extrae data.data si existe', async () => {
    const { extractList } = await import('@/lib/api-client')
    const payload = { data: [{ id: 1 }] }
    expect(extractList(payload)).toEqual([{ id: 1 }])
  })
})
