const TIME_ZONE = 'Asia/Jakarta'

function getDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    hourCycle: 'h23',
  }).formatToParts(date)

  return Object.fromEntries(parts.map((part) => [part.type, part.value]))
}

export function jakartaNow() {
  const parts = getDateParts()
  return {
    tanggal: `${parts.year}-${parts.month}-${parts.day}`,
    waktu: `${parts.hour}:${parts.minute}`,
  }
}

export function jakartaToday() {
  return jakartaNow().tanggal
}

export function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function jakartaPeriodRange(periode, dari, sampai) {
  const today = jakartaToday()
  const [year, month] = today.split('-')

  if (periode === 'hari') {
    return { startDate: today, endDate: today }
  }

  if (periode === 'minggu') {
    const day = new Date(`${today}T00:00:00.000Z`).getUTCDay()
    return {
      startDate: addDays(today, -day),
      endDate: addDays(today, 6 - day),
    }
  }

  if (periode === 'bulan') {
    return { startDate: `${year}-${month}-01`, endDate: today }
  }

  if (periode === 'tahun') {
    return { startDate: `${year}-01-01`, endDate: today }
  }

  return { startDate: dari, endDate: sampai }
}
