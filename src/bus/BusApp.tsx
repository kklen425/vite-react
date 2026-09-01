import { useEffect, useState } from 'react'
import { BusFront, ChevronDown, Clock3, MapPin, Radio, WifiOff, Zap } from 'lucide-react'
import { schedulePredictionProvider } from './scheduleProvider'
import { formatHongKongClock, minutesUntil } from './time'
import type { RouteTimetable, ScheduledDeparture, TimetableData } from './types'
import './bus.css'

const DATA_URL = '/california-garden-bus-data.json'
const PREFERENCE_KEY = 'california-garden-bus-preferences'

interface Preferences {
  routeId: string
  stationByRoute: Record<string, string>
}

const DEFAULT_PREFERENCES: Preferences = {
  routeId: 'yuen-long',
  stationByRoute: {
    'yuen-long': 'palm-springs',
    'sheung-shui': 'palm-springs',
  },
}

function loadPreferences(): Preferences {
  try {
    const stored = localStorage.getItem(PREFERENCE_KEY)
    if (!stored) return DEFAULT_PREFERENCES
    const parsed = JSON.parse(stored) as Partial<Preferences>
    return {
      routeId: parsed.routeId ?? DEFAULT_PREFERENCES.routeId,
      stationByRoute: {
        ...DEFAULT_PREFERENCES.stationByRoute,
        ...parsed.stationByRoute,
      },
    }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

function updateBusDocumentMetadata() {
  document.documentElement.lang = 'zh-HK'
  document.title = '加州花園居民巴士時間表'

  const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    ?? document.head.appendChild(document.createElement('meta'))
  description.name = 'description'
  description.content = '加州花園及加州豪園居民巴士元朗線、上水線表定時間及香港時間倒數。'

  const manifest = document.querySelector<HTMLLinkElement>('link[rel="manifest"]')
  if (manifest) manifest.href = '/bus-manifest.webmanifest'

  const touchIcon = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]')
  if (touchIcon) touchIcon.href = '/bus-icon-180.png'

  const theme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (theme) theme.content = '#071f35'

  const title = document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-title"]')
  if (title) title.content = '居民巴士'
}

function RouteSelector({
  routes,
  selected,
  onSelect,
}: {
  routes: TimetableData['routes']
  selected: string
  onSelect: (routeId: string) => void
}) {
  return (
    <div className="bus-route-tabs" role="tablist" aria-label="選擇路線">
      {Object.entries(routes).map(([routeId, route]) => (
        <button
          className={selected === routeId ? 'is-active' : ''}
          key={routeId}
          onClick={() => onSelect(routeId)}
          role="tab"
          aria-selected={selected === routeId}
        >
          <span>{routeId === 'yuen-long' ? '元朗線' : route.nameZh}</span>
          <small>{route.nameEn}</small>
        </button>
      ))}
    </div>
  )
}

function StationSelector({
  route,
  selected,
  onSelect,
}: {
  route: RouteTimetable
  selected: string
  onSelect: (stationId: string) => void
}) {
  return (
    <div className="bus-station-grid" aria-label="選擇車站">
      {Object.entries(route.stations).map(([stationId, station]) => (
        <button
          className={selected === stationId ? 'is-active' : ''}
          key={stationId}
          onClick={() => onSelect(stationId)}
          aria-pressed={selected === stationId}
        >
          <MapPin aria-hidden="true" size={16} strokeWidth={2.4} />
          <span>
            <strong>{station.nameZh}</strong>
            <small>{station.nameEn}</small>
          </span>
        </button>
      ))}
    </div>
  )
}

export default function BusApp() {
  const [data, setData] = useState<TimetableData | null>(null)
  const [error, setError] = useState('')
  const [now, setNow] = useState(() => new Date())
  const [preferences, setPreferences] = useState(loadPreferences)
  const [online, setOnline] = useState(navigator.onLine)
  const [departures, setDepartures] = useState<ScheduledDeparture[]>([])

  useEffect(() => {
    updateBusDocumentMetadata()
    const timer = window.setInterval(() => setNow(new Date()), 1_000)
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.clearInterval(timer)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    let active = true
    fetch(DATA_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<TimetableData>
      })
      .then((timetable) => {
        if (!active) return
        setData(timetable)
        setError('')
      })
      .catch(() => {
        if (active) setError('未能載入時間表，請在有網絡時重新開啟一次。')
      })
    return () => { active = false }
  }, [])

  useEffect(() => {
    localStorage.setItem(PREFERENCE_KEY, JSON.stringify(preferences))
  }, [preferences])

  const route = data?.routes[preferences.routeId]
    ?? (data ? Object.values(data.routes)[0] : undefined)
  const stationId = route && route.stations[preferences.stationByRoute[preferences.routeId]]
    ? preferences.stationByRoute[preferences.routeId]
    : route ? Object.keys(route.stations)[0] : ''
  const station = route?.stations[stationId]
  useEffect(() => {
    let active = true
    if (!station) {
      setDepartures([])
      return () => { active = false }
    }
    schedulePredictionProvider.getDepartures(station, now)
      .then((nextDepartures) => {
        if (active) setDepartures(nextDepartures)
      })
    return () => { active = false }
  }, [station, now])

  const next = departures[0]
  const clock = formatHongKongClock(now)

  const selectRoute = (routeId: string) => {
    setPreferences((current) => ({ ...current, routeId }))
  }

  const selectStation = (nextStationId: string) => {
    setPreferences((current) => ({
      ...current,
      stationByRoute: {
        ...current.stationByRoute,
        [current.routeId]: nextStationId,
      },
    }))
  }

  if (error) {
    return (
      <main className="bus-app bus-centered-state">
        <BusFront size={42} aria-hidden="true" />
        <h1>時間表暫時未能載入</h1>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>重新載入</button>
      </main>
    )
  }

  if (!data || !route || !station) {
    return (
      <main className="bus-app bus-centered-state" aria-busy="true">
        <BusFront className="bus-loading-icon" size={46} aria-hidden="true" />
        <p>正在載入時間表…</p>
      </main>
    )
  }

  return (
    <div className="bus-app">
      <header className="bus-hero">
        <div className="bus-hero-inner">
          <div className="bus-brand-row">
            <div className="bus-mark" aria-hidden="true"><BusFront size={24} /></div>
            <div>
              <p className="bus-eyebrow">PALM SPRINGS · ROYAL PALMS</p>
              <h1>加州花園居民巴士</h1>
            </div>
          </div>
          <div className="bus-clock-row">
            <div>
              <time className="bus-clock" dateTime={`${clock.date}T${clock.time}+08:00`}>
                {clock.time}
              </time>
              <span>香港時間 HKT</span>
            </div>
            <div className="bus-date">{clock.date}<br />{clock.weekday}</div>
          </div>
        </div>
      </header>

      <main className="bus-content">
        <div className="bus-status-row">
          <span className="bus-schedule-status"><Radio size={14} /> 表定班次</span>
          {!online && <span className="bus-offline-status"><WifiOff size={14} /> 離線時間表</span>}
        </div>

        <section aria-labelledby="route-heading">
          <h2 id="route-heading" className="bus-section-label">選擇路線</h2>
          <RouteSelector routes={data.routes} selected={preferences.routeId} onSelect={selectRoute} />
        </section>

        <section aria-labelledby="station-heading">
          <h2 id="station-heading" className="bus-section-label">你而家喺邊個站？</h2>
          <StationSelector route={route} selected={stationId} onSelect={selectStation} />
        </section>

        <section className="bus-next-card" aria-labelledby="next-heading">
          <div className="bus-next-heading-row">
            <div>
              <p id="next-heading">下一班（表定）</p>
              <h2>{station.nameZh}<small>{station.nameEn}</small></h2>
            </div>
            {next?.isExpress && <span className="bus-express-badge"><Zap size={13} fill="currentColor" /> 西鐵快線</span>}
          </div>
          {next ? (
            <div className="bus-next-time-row">
              <time dateTime={next.scheduledTime}>{next.scheduledTime}</time>
              <div className="bus-countdown">
                <strong>{minutesUntil(next.epochMs, now) === 0 ? '即將開' : `${minutesUntil(next.epochMs, now)} 分鐘`}</strong>
                <span>{next.isNextCalendarDay && '明日 · '}距離表定開車</span>
              </div>
            </div>
          ) : <p className="bus-empty">暫時沒有班次資料</p>}
        </section>

        <aside className="bus-notice">
          <Clock3 size={20} aria-hidden="true" />
          <p><strong>目前並非即時 ETA。</strong> 實際班次可能受交通、上一程延誤或調車影響。</p>
        </aside>

        <section className="bus-card" aria-labelledby="upcoming-heading">
          <div className="bus-card-heading">
            <div>
              <p className="bus-kicker">UPCOMING</p>
              <h2 id="upcoming-heading">之後班次</h2>
            </div>
            <span>表定時間</span>
          </div>
          <ol className="bus-upcoming-list">
            {departures.slice(1, 6).map((departure) => (
              <li key={departure.epochMs}>
                <time dateTime={departure.scheduledTime}>{departure.scheduledTime}</time>
                <div>
                  {departure.isExpress && <span className="bus-express-pill"><Zap size={11} fill="currentColor" /> 快線</span>}
                  <span>{minutesUntil(departure.epochMs, now)} 分鐘後{departure.isNextCalendarDay && ' · 明日'}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <details className="bus-card bus-timetable">
          <summary>
            <span><span className="bus-kicker">FULL SCHEDULE</span><strong>全日時間表</strong></span>
            <ChevronDown size={22} aria-hidden="true" />
          </summary>
          <div className="bus-time-grid">
            {station.times.map((time) => {
              const express = station.expressTimes.includes(time)
              return <time className={express ? 'is-express' : ''} key={time} dateTime={time}>{time}{express && <Zap size={10} fill="currentColor" />}</time>
            })}
          </div>
          {route.remarks.map((remark) => <p className="bus-remark" key={remark}>• {remark}</p>)}
        </details>

        <footer className="bus-footer">
          <p>時間表版本：{data.effectiveDate} 生效</p>
          <p>本頁方便居民查閱，實際服務以現場及營辦方安排為準。</p>
          <p>iPhone：Safari 分享 →「加入主畫面」即可安裝。</p>
        </footer>
      </main>
    </div>
  )
}
