import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { load, recordFocusSession, save, todayKey } from './storage'

beforeEach(() => localStorage.clear())
afterEach(() => vi.restoreAllMocks())

describe('load / save', () => {
  it('round-trips a value', () => {
    save('k', { a: 1, b: 'x' })
    expect(load('k', { a: 0, b: '' })).toEqual({ a: 1, b: 'x' })
  })

  it('returns the fallback when nothing is stored', () => {
    expect(load('missing', { a: 1 })).toEqual({ a: 1 })
  })

  it('fills in fields missing from older saved data', () => {
    localStorage.setItem('k', JSON.stringify({ a: 5 }))
    expect(load('k', { a: 1, b: true })).toEqual({ a: 5, b: true })
  })

  it('returns the fallback for corrupt data', () => {
    localStorage.setItem('k', '{not json')
    expect(load('k', { a: 1 })).toEqual({ a: 1 })
  })

  it('does not throw when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    expect(() => save('k', 1)).not.toThrow()
    expect(load('k', { a: 1 })).toEqual({ a: 1 })
  })
})

describe('todayKey', () => {
  afterEach(() => vi.useRealTimers())

  it('uses the local date as YYYY-MM-DD', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 8, 6, 23, 30))
    expect(todayKey()).toBe('2026-09-06')
  })
})

describe('recordFocusSession', () => {
  it('adds to today’s count', () => {
    expect(recordFocusSession({ date: todayKey(), focusSessions: 2 })).toEqual({ date: todayKey(), focusSessions: 3 })
  })

  it('starts a new count on a new day', () => {
    expect(recordFocusSession({ date: '2000-01-01', focusSessions: 7 })).toEqual({ date: todayKey(), focusSessions: 1 })
  })
})
