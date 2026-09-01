export type PredictionSource = 'schedule' | 'live-gps' | 'predicted'

export interface BusPrediction {
  source: PredictionSource
  scheduledTime: string
  estimatedTime?: string
  delayMinutes?: number
  vehicleId?: string
  updatedAt?: string
}

export interface StationTimetable {
  nameZh: string
  nameEn: string
  times: string[]
  expressTimes: string[]
}

export interface RouteTimetable {
  nameZh: string
  nameEn: string
  stations: Record<string, StationTimetable>
  remarks: string[]
}

export interface TimetableData {
  effectiveDate: string
  timezone: 'Asia/Hong_Kong'
  routes: Record<string, RouteTimetable>
}

export interface ScheduledDeparture extends BusPrediction {
  epochMs: number
  isExpress: boolean
  isNextCalendarDay: boolean
}

export interface PredictionProvider {
  getDepartures(
    station: StationTimetable,
    now?: Date,
  ): Promise<ScheduledDeparture[]>
}
