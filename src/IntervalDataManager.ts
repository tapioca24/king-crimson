import { DateTime, Duration, Interval } from "luxon";
import { FetchFn, UpdatePayload } from "@/Fetcher";
import KingCrimson, { KingCrimsonOptions } from "./KingCrimson";

interface IntervalDataManagerOptions extends KingCrimsonOptions {
  dataDurationLimit?: Duration;
}
type IntervalDataManagerConfig = Required<
  Omit<IntervalDataManagerOptions, keyof KingCrimsonOptions>
>;

class IntervalDataManager<
  T extends KingCrimson.IntervalData
> extends KingCrimson<T> {
  constructor(fetchFn: FetchFn<T>, options: IntervalDataManagerOptions = {}) {
    super(fetchFn, options);
    const defautls: IntervalDataManagerConfig = {
      dataDurationLimit: Duration.fromObject({ minute: 1 })
    };
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

      this.storage.insert(items.filter(item => item.duration > 0));
      this.fetched.insert(period);
    });
  }

  search(datetime: DateTime) {}
}

export default IntervalDataManager;
