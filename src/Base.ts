import { EventEmitter } from "events";
import { Duration, DateTime, Interval } from "luxon";

import Storage from "./utils/Storage";
import Fetched from "./Fetched";
import Fetcher from "./Fetcher";
import * as luxonHelper from "./utils/luxonHelper";

class Base<T> extends EventEmitter {
  protected _config: Base.Config<T>;
  protected _options: Required<Base.Options<T>>;
  protected storage = new Storage<T>();
  protected fetched = new Fetched();
  protected fetcher: Fetcher<T>;

  constructor(config: Base.Config<T>, options: Base.Options<T> = {}) {
    super();
    this._config = config;
    const defaults: Required<Base.Options<T>> = {
      fetchDuration: Duration.fromObject({ hour: 24 }),
      requestDurationLimit: Duration.fromObject({ minute: 180 }),
      updateInterceptor: null
    };
    this._options = { ...defaults, ...options };

    this.fetcher = new Fetcher(this.config.fetchFn);
    this.fetcher.on("update", this.onFetcherUpdate.bind(this));
  }

  protected get config() {
    return this._config;
  }

  protected get options() {
    return this._options;
  }

  /**
   * Fetcher の update イベントハンドラ
   * @param payload ペイロード
   */
  protected onFetcherUpdate(payload: Fetcher.UpdatePayload<T>) {
    if (this.options.updateInterceptor) {
      payload = this.options.updateInterceptor(payload);
    }

    // item を storage に保存する
    const data: { key: any; item: T }[] = [];
    for (const item of payload.items) {
      data.push({
        key: this.config.itemKey(item),
        item
      });
    }
    this.storage.insert(data);

    // period を fetched に保存する
    this.fetched.insert(payload.period);

    // イベントをトリガーする
    this.emit('update', payload)
  }

  async fetch(datetime: DateTime) {
    const request = luxonHelper.getIntervalFromCenter(
      datetime,
      this.options.fetchDuration
    );
    const unfetchedPeriods = this.fetched
      .getUnfetchedPeriods(request, this.options.requestDurationLimit)
      // 取得した `unfetchedPeriods` を `datetime` に近い順番にソートする
      .sort((a, b) => {
        const diffA = datetime.diff(luxonHelper.getIntervalCenter(a)).valueOf();
        const diffB = datetime.diff(luxonHelper.getIntervalCenter(b)).valueOf();
        return diffA - diffB;
      });
    // リクエストを投げてもらう
    await this.fetcher.fetch(unfetchedPeriods);
  }

  cancel() {
    this.fetcher.cancel();
  }

  /**
   * 指定した `period` に含まれるデータを全て取得する
   * @param period 取得する区間
   */
  searchBetween(period: Interval) {
    return this.storage.search(period);
  }
}

namespace Base {
  export interface Config<T> {
    fetchFn: Fetcher.FetchFn<T>;
    itemKey(item: any): any;
  }

  export interface Options<T> {
    fetchDuration?: Duration;
    requestDurationLimit?: Duration;
    updateInterceptor?:
      | ((payload: Fetcher.UpdatePayload<T>) => Fetcher.UpdatePayload<T>)
      | null;
  }
  export type UpdatePayload<T> = Fetcher.UpdatePayload<T>;
}

export default Base;
