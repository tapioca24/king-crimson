import { EventEmitter } from "events";
import { Interval } from "luxon";
import Queue from "@/Queue";

export interface FetchFn<T> {
  (period: Interval): Promise<T[]>;
}
export interface UpdatePayload<T> {
  items: T[];
  period: Interval;
}

class Fetcher<T extends KingCrimson.DateTimeData> extends EventEmitter {
  protected periodQueue: Queue<Interval>;

  constructor(private fetchFn: FetchFn<T>) {
    super();
    this.periodQueue = new Queue<Interval>();
  }

  async fetch(periods: Interval[]) {
    // まずキューに追加
    for (const period of periods) {
      this.periodQueue.enqueue(period);
    }

    // キューから1つずつ取り出してフェッチを実行
    while (this.periodQueue.size > 0) {
      const period = this.periodQueue.dequeue();
      if (!period) {
        continue;
      }
      try {
        const items = await this.fetchFn(period);
        const payload: UpdatePayload<T> = { items, period };
        this.emit("update", payload);
      } catch (err) {
        console.warn(err);
      }
    }
  }

  cancel() {
    // キューを空にする
    this.periodQueue.clear();
  }
}

export default Fetcher;
