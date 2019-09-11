import { DateTime, Duration, Interval } from "luxon";

export const getIntervalFromCenter = (center: DateTime, duration: Duration) => {
  const halfDuration = Duration.fromMillis(duration.valueOf() / 2);
  const start = center.minus(halfDuration);
  return Interval.after(start, duration);
};

export const getIntervalCenter = (interval: Interval) => {
  const timestamp = (interval.start.valueOf() + interval.end.valueOf()) / 2;
  return DateTime.fromMillis(timestamp);
};
