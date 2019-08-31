import Fetched from "../src/Fetched"
import { DateTime, Duration, Interval } from 'luxon'

// 複数の連続して区間を作成する
const createPeriods = (start: DateTime, durationPerPeriod: Duration, num: number) => {
  const periods: Interval[] = []
  let s = start
  for (let i = 0; i < num; i++) {
    const p = Interval.after(s, durationPerPeriod)
    periods.push(p)
    s = s.plus(durationPerPeriod)
  }
  return periods
}

describe('Fetched', () => {

  const ps = createPeriods(
    DateTime.fromISO('2019-01-01T00:00:00Z'),
    Duration.fromObject({ hours: 1 }),
    5
  )

  describe('add', () => {

    it('連続しない区間を追加', () => {
      const f = new Fetched()
      f.add([ps[0], ps[2], ps[4]])
      expect(f.periods.length).toBe(3)

      expect(f.periods[0].equals(ps[0])).toBeTruthy()
      expect(f.periods[1].equals(ps[2])).toBeTruthy()
      expect(f.periods[2].equals(ps[4])).toBeTruthy()
    })

    it('連続する区間を追加', () => {
      const f = new Fetched()
      f.add([ps[0], ps[1], ps[4]])
      expect(f.periods.length).toBe(2)
      const e = Interval.fromDateTimes(ps[0].start, ps[1].end)
      expect(f.periods[0].equals(e)).toBeTruthy()
      expect(f.periods[1].equals(ps[4])).toBeTruthy()
    })
  })

  describe('clear', () => {
    it('全データを削除', () => {
      const f = new Fetched()
      f.add([ ps[0], ps[1], ps[4] ])
      f.clear()
      expect(f.periods.length).toBe(0)
    })
  })
})
