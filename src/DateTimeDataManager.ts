import { Interval } from "luxon";
import { FetchFn } from "@/Fetcher";
import KingCrimson, { KingCrimsonOptions } from "@/KingCrimson";

interface DateTimeDataManagerOptions extends KingCrimsonOptions {}
type DateTimeDataManagerConfig = Required<
  Omit<DateTimeDataManagerOptions, keyof KingCrimsonOptions>
>;

class DateTimeDataManager<
  T extends KingCrimson.DateTimeData
> extends KingCrimson<T> {
  constructor(fetchFn: FetchFn<T>, options: DateTimeDataManagerOptions = {}) {
    super(fetchFn, options);
    const defaults: DateTimeDataManagerConfig = {};
    this.config = Object.assign({}, defaults, this.config);
  }

  search(period: Interval) {
    return this.storage.search(period);
  }
}

export default DateTimeDataManager;
