import type { ScheduledDeparture, StationTimetable } from './types'

const HK_TIMEZONE = 'Asia/Hong_Kong'
const SERVICE_DAY_CUTOFF_HOUR = 4

export interface HongKongDateParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
  weekday: string
}

export function getHongKongDateParts(date = new Date()): HongKongDateParts {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: HK_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
  const values = Object.fromEntries(
    formatter.formatToParts(date).map(({ type, value }) => [type, value]),
  )

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
    weekday: values.weekday,
  }
}

function shiftDate(
  date: Pick<HongKongDateParts, 'year' | 'month' | 'day'>,
  days: number,
) {
  const shifted = new Date(Date.UTC(date.year, date.month - 1, date.day + days, 12))
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  }
}

function timetableEpochMs(
  serviceDate: Pick<HongKongDateParts, 'year' | 'month' | 'day'>,
  time: string,
) {
  const [hour, minute] = time.split(':').map(Number)
  const calendarOffset = hour < SERVICE_DAY_CUTOFF_HOUR ? 1 : 0
  return Date.UTC(
    serviceDate.year,
    serviceDate.month - 1,
    serviceDate.day + calendarOffset,
    hour - 8,
    minute,
  )
}

function hkCalendarKey(date: Date) {
  const parts = getHongKongDateParts(date)
  return `${parts.year}-${parts.month}-${parts.day}`
}

export function getScheduledDepartures(
  station: StationTimetable,
  now = new Date(),
): ScheduledDeparture[] {
  const hkNow = getHongKongDateParts(now)
  const currentCalendarDate = {
    year: hkNow.year,
    month: hkNow.month,
    day: hkNow.day,
  }
  const serviceDate = shiftDate(
    currentCalendarDate,
    hkNow.hour < SERVICE_DAY_CUTOFF_HOUR ? -1 : 0,
  )
  const expressTimes = new Set(station.expressTimes)
  const currentCalendarKey = hkCalendarKey(now)
  const departures: ScheduledDeparture[] = []

  for (let serviceOffset = 0; serviceOffset < 3; serviceOffset += 1) {
    const candidateServiceDate = shiftDate(serviceDate, serviceOffset)
    for (const scheduledTime of station.times) {
      const epochMs = timetableEpochMs(candidateServiceDate, scheduledTime)
      if (epochMs < now.getTime()) continue

      departures.push({
        source: 'schedule',
        scheduledTime,
        epochMs,
        isExpress: expressTimes.has(scheduledTime),
        isNextCalendarDay:
          hkCalendarKey(new Date(epochMs)) !== currentCalendarKey,
      })
    }
  }

  return departures.sort((left, right) => left.epochMs - right.epochMs)
}

export function minutesUntil(epochMs: number, now = new Date()) {
  return Math.max(0, Math.ceil((epochMs - now.getTime()) / 60_000))
}

export function formatHongKongClock(date = new Date()) {
  const parts = getHongKongDateParts(date)
  return {
    time: [parts.hour, parts.minute, parts.second]
      .map((value) => String(value).padStart(2, '0'))
      .join(':'),
    date: `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`,
    weekday: parts.weekday,
  }
}
