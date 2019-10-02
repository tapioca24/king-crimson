import { DateTime, Duration, Interval } from "luxon";
import { FetchFn, UpdatePayload } from "@/Fetcher";
import KingCrimson, { KingCrimsonOptions } from "./KingCrimson";

interface IntervalDataManagerOptions extends KingCrimsonOptions {}
type IntervalDataManagerConfig = Required<
  Omit<IntervalDataManagerOptions, keyof KingCrimsonOptions>
>;

class IntervalDataManager<
  T extends KingCrimson.IntervalData
> extends KingCrimson<T> {
  // 取得したデータで最も大きい duration を保持しておくための変数
  private maxDuration: Duration = Duration.fromObject({ millisecond: 0 });

  constructor(fetchFn: FetchFn<T>, options: IntervalDataManagerOptions = {}) {
    super(fetchFn, options);
    const defautls: IntervalDataManagerConfig = {};
    this.config = Object.assign({}, defautls, this.config);
  }

  protected setupFetcherEventHanlder() {
    this.fetcher.on("update", (payload: UpdatePayload<T>) => {
      if (payload.items.length === 0) {
        this.fetched.insert(payload.period);
        return;
      }

      // items の最後のデータの `duration` が 0 か確認し、0 ならば `period.end` を書き換える
      const items = payload.items;
      const last = items[items.length - 1];
      let period = payload.period;
      if (last.duration === 0) {
        // `period.end` を書き換える
        const end = DateTime.fromMillis(last.timestamp - 1);
        period = Interval.fromDateTimes(period.start, end);
      }

      // maxDuration を更新する
      for (const item of items) {
        if (item.duration > this.maxDuration.valueOf()) {
          this.maxDuration = Duration.fromMillis(item.duration);
        }
      }

      // データを追加する
      this.storage.insert(items.filter(item => item.duration > 0));
      this.fetched.insert(period);
    });
  }

  search(datetime: DateTime) {
    if (this.storage.size === 0) {
      return null;
    }

    // 候補のデータを絞り込む
    const period = Interval.before(datetime, this.maxDuration);
    const items = this.storage.search(period);

    // 得られた候補から `datetime` が含まれるデータを探索する
    const item = items.find(item => {
      const start = DateTime.fromMillis(item.timestamp);
      const duration = Duration.fromMillis(item.duration);
      const period = Interval.after(start, duration);
      return period.contains(datetime);
    });

    // 見つかったデータを返す（見つからなければ `null` を返す）
    return item || null;
  }
}

export default IntervalDataManager;
