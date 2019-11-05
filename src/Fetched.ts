import { Duration, Interval } from "luxon";

/**
 * fetch 済みの区間を管理するクラス
 */
class Fetched {
  private data: Interval[] = [];

  get periods() {
    return this.data;
  }

  clear() {
    this.data = [];
  }

  insert(periods: Interval | Interval[]) {
    this.data = Interval.merge(this.data.concat(periods));
  }

  getUnfetchedPeriods(requestPeriod: Interval, durationLimit?: Duration) {
    const periods = requestPeriod.difference(...this.data);

    if (!durationLimit) {
      return periods;
    }

    let unfetched: Interval[] = [];
    for (const period of periods) {
      // 長さが `durationLimit` より大きければ小さくなるように等分する
      const limit = durationLimit.valueOf();
      const duration = period.toDuration().valueOf();
      const num = Math.ceil(duration / limit);
      unfetched = unfetched.concat(period.divideEqually(num));
    }
    return unfetched;
  }

  private divideInterval(interval: Interval, num: number) {}
}

export default Fetched;
