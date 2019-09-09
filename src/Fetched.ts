import { Interval } from "luxon";

class Fetched {
  private data: Interval[] = [];

  get periods() {
    return this.data;
  }

  // 取得済み区間を削除する
  clear() {
    this.data = [];
  }

  add(periods: Interval | Interval[]) {
    this.data = Interval.merge(this.data.concat(periods));
  }
}

export default Fetched;
