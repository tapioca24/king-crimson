import { DateTime, Duration, Interval } from "luxon";

/**
 * 中心時刻を基準として Interval を返す
 * @param center 中心時刻
 * @param duration Interval の長さ
 */
export const getIntervalFromCenter = (center: DateTime, duration: Duration) => {
  const halfDuration = Duration.fromMillis(duration.valueOf() / 2);
  const start = center.minus(halfDuration);
  return Interval.after(start, duration);
};

/**
 * Interval の中心の時刻を返す
 * @param interval Interval
 */
export const getIntervalCenter = (interval: Interval) => {
  const timestamp = (interval.start.valueOf() + interval.end.valueOf()) / 2;
  return DateTime.fromMillis(timestamp);
};
