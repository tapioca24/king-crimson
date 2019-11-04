import Base from "./Base";

class DateTimeDataManager<T> extends Base<T> {
  protected _config: DateTimeDataManager.Config<T>;
  protected _options: Required<DateTimeDataManager.Options<T>>;

  constructor(
    config: DateTimeDataManager.Config<T>,
    options: DateTimeDataManager.Options<T> = {}
  ) {
    super(config, options);
    this._config = this.config;
    const defaults: DateTimeDataManager.Defaults<T> = {};
    this._options = { ...defaults, ...this.options };
  }

  protected get config() {
    return this._config;
  }

  protected get options() {
    return this._options;
  }
}

namespace DateTimeDataManager {
  export interface Config<T> extends Base.Config<T> {}
  export interface Options<T> extends Base.Options<T> {}
  export type Defaults<T> = Required<
    Omit<DateTimeDataManager.Options<T>, keyof Base.Options<T>>
  >;
}

export default DateTimeDataManager;
