import { DateTime, Duration, Interval } from "luxon";

// 複数の連続した区間を作成する
export const createPeriods = (
  start: DateTime,
  duration: Duration,
  num: number
) => {
  const periods: Interval[] = [];
  let s = start;
  for (let i = 0; i < num; i++) {
    const p = Interval.after(s, duration);
    periods.push(p);
    s = s.plus(duration);
  }
  return periods;
};
