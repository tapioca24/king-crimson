import { EventEmitter } from "events";
import { Interval } from "luxon";

import Queue from "./utils/Queue";

class Fetcher<T> extends EventEmitter {
  protected periodQueue: Queue<Interval>;
  protected fetchFn: Fetcher.FetchFn<T>;
  protected cancelFn: Fetcher.CancenFn | null = null;

  constructor(fetchFn: Fetcher.FetchFn<T>) {
    super();
    this.fetchFn = fetchFn;
    this.periodQueue = new Queue<Interval>();
  }

  /**
   * データの取得を行う
   * @param periods 要求する区間の配列
   */
  async fetch(periods: Interval[]) {
    // まず要求区間をキューに追加
    for (const period of periods) {
      this.periodQueue.enqueue(period);
    }

    // キューから要求区間を1つずつ取り出してデータ取得を実行
    while (this.periodQueue.size > 0) {
      const period = this.periodQueue.dequeue();
      if (!period) {
        continue;
      }
      try {
        const { cancel, promise } = this.fetchFn(period);
        this.cancelFn = cancel;
        const items = await promise;
        this.cancelFn = null;
        const payload: Fetcher.UpdatePayload<T> = { items, period };
        this.emit("update", payload);
      } catch (err) {
        // キャンセルの場合もここに入る
        console.warn(err);
        throw err
      }
    }
  }

  cancel() {
    // 投げているリクエストがあればキャンセルする
    if (this.cancelFn) {
      this.cancelFn();
      this.cancelFn = null;
    }
    // キューを空にする
    this.periodQueue.clear();
  }
}

namespace Fetcher {
  // キャンセル関数
  export interface CancenFn {
    (): void;
  }

  export interface FetchFnReturn<T> {
    cancel: CancenFn;
    promise: Promise<T[]>;
  }

  export interface FetchFn<T> {
    (period: Interval): FetchFnReturn<T>;
  }

  export interface UpdatePayload<T> {
    items: T[];
    period: Interval;
  }
}

export default Fetcher;
