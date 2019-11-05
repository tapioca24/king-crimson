import { DateTime, Duration, Interval } from "luxon";
import Base from "./Base";
import Fetcher from "./Fetcher";

class IntervalDataManager<T> extends Base<T> {
  protected _config: IntervalDataManager.Config<T>;
  protected _options: Required<IntervalDataManager.Options<T>>;
  private maxDuration = Duration.fromObject({ millisecond: 0 });

  constructor(
    config: IntervalDataManager.Config<T>,
    options: IntervalDataManager.Options<T>
  ) {
    super(config, options);
    this._config = this.config;
    const defaults: IntervalDataManager.Defaults<T> = {};
    this._options = { ...defaults, ...this.options };
  }

  protected get config() {
    return this._config;
  }

  protected get options() {
    return this._options;
  }

  protected onFetcherUpdate(payload: Fetcher.UpdatePayload<T>) {
    super.onFetcherUpdate(payload);

    // `maxDuration` を更新する
    for (const item of payload.items) {
      const duration = this.config.itemDuration(item);
      if (duration > this.maxDuration.valueOf()) {
        this.maxDuration = Duration.fromMillis(duration);
      }
    }
  }

  /**
   * 指定した `datetime` を包括するデータを取得する
   * @param datetime 時刻
   */
  searchOn(datetime: DateTime) {
    const period = Interval.before(datetime, this.maxDuration);
    const item = this.storage.search(period).find(item => {
      const start = DateTime.fromMillis(this.config.itemTimestamp(item));
      const duration = Duration.fromMillis(this.config.itemDuration(item));
      const period = Interval.after(start, duration);
      return period.contains(datetime);
    });

    // 見つかったデータを返す（見つからなければ `null` を返す）
    return item || null;
  }
}

namespace IntervalDataManager {
  export interface Config<T> extends Base.Config<T> {
    /**
     * アイテムが持つ timestamp をミリ秒単位の Unix 時間で返すメソッド
     * @param item アイテム
     */
    itemTimestamp(item: T): number;
    /**
     * アイテムが持つ duration をミリ秒単位で返すメソッド
     * @param item アイテム
     */
    itemDuration(item: T): number;
  }
  export interface Options<T> extends Base.Options<T> {}
  export type Defaults<T> = Required<
    Omit<IntervalDataManager.Options<T>, keyof Base.Options<T>>
  >;
  export type UpdatePayload<T> = Base.UpdatePayload<T>;
}

export default IntervalDataManager;
