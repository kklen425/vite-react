import { getScheduledDepartures } from './time'
import type { PredictionProvider } from './types'

export const schedulePredictionProvider: PredictionProvider = {
  async getDepartures(station, now = new Date()) {
    return getScheduledDepartures(station, now)
  },
}
