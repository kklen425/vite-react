import { describe, expect, it } from 'vitest'
import { formatHongKongClock, getScheduledDepartures, minutesUntil } from './time'
import type { StationTimetable } from './types'

const fauTsoi: StationTimetable = {
  nameZh: '元朗阜財街',
  nameEn: 'Fau Tsoi Street',
  times: ['06:50', '23:50', '00:10'],
  expressTimes: [],
}

const sheungShui: StationTimetable = {
  nameZh: '上水',
  nameEn: 'Sheung Shui',
  times: ['06:50', '23:30', '00:00'],
  expressTimes: [],
}

describe('Hong Kong timetable clock', () => {
  it('formats Hong Kong time independently of the device timezone', () => {
    expect(formatHongKongClock(new Date('2026-01-02T16:05:09.000Z'))).toEqual({
      time: '00:05:09',
      date: '2026-01-03',
      weekday: 'Sat',
    })
  })

  it('treats 00:10 as the next departure after 23:59', () => {
    const now = new Date('2026-01-02T15:59:00.000Z') // 23:59 HKT
    const next = getScheduledDepartures(fauTsoi, now)[0]
    expect(next.scheduledTime).toBe('00:10')
    expect(next.isNextCalendarDay).toBe(true)
    expect(minutesUntil(next.epochMs, now)).toBe(11)
  })

  it('keeps the previous service day active shortly after midnight', () => {
    const now = new Date('2026-01-02T16:05:00.000Z') // 00:05 HKT
    const next = getScheduledDepartures(fauTsoi, now)[0]
    expect(next.scheduledTime).toBe('00:10')
    expect(next.isNextCalendarDay).toBe(false)
    expect(minutesUntil(next.epochMs, now)).toBe(5)
  })

  it('rolls to the morning timetable after the final midnight trip', () => {
    const now = new Date('2026-01-02T16:11:00.000Z') // 00:11 HKT
    const next = getScheduledDepartures(fauTsoi, now)[0]
    expect(next.scheduledTime).toBe('06:50')
    expect(minutesUntil(next.epochMs, now)).toBe(399)
  })

  it('supports a scheduled 00:00 departure', () => {
    const now = new Date('2026-01-02T15:59:30.000Z') // 23:59:30 HKT
    const next = getScheduledDepartures(sheungShui, now)[0]
    expect(next.scheduledTime).toBe('00:00')
    expect(minutesUntil(next.epochMs, now)).toBe(1)
  })

  it('preserves express metadata', () => {
    const station = { ...fauTsoi, expressTimes: ['23:50'] }
    const now = new Date('2026-01-02T15:49:00.000Z') // 23:49 HKT
    expect(getScheduledDepartures(station, now)[0].isExpress).toBe(true)
  })
})
