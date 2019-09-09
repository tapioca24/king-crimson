import { EventEmitter } from "events";
import { Interval } from "luxon";

export interface FetchFn<T> {
  (period: Interval): Promise<T[]>;
}
export interface UpdatePayload<T> {
  items: T[];
  period: Interval;
}

class Fetcher<T extends KingCrimson.SequentialData> extends EventEmitter {
  constructor(private fetchFn: FetchFn<T>) {
    super();
  }

  fetch(periods: Interval[]) {
    for (const period of periods) {
      this.fetchFn(period).then(items => {
        // emit update event
        const payload: UpdatePayload<T> = { items, period };
        this.emit("update", payload);
      });
    }
  }
}

export default Fetcher;
