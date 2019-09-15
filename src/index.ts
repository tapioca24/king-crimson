import { DateTime, Duration } from "luxon";
import Storage from "@/Storage";
import Fetched from "@/Fetched";
import Fetcher, { FetchFn, UpdatePayload } from "@/Fetcher";
import * as luxonHelper from "@/luxonHelper";

class KingCrimson<T extends KingCrimson.SequentialData> {
  private storage = new Storage<T>();
  private fetched = new Fetched();
  private fetcher: Fetcher<T>;

  config = {
    fetchDuration: Duration.fromObject({ hour: 24 }),
    requestDurationLimit: Duration.fromObject({ minute: 180 })
  };

  constructor(fetchFn: FetchFn<T>) {
    this.fetcher = new Fetcher(fetchFn);
    this.setupFetcherEventHanlder();
  }

  private setupFetcherEventHanlder() {
    this.fetcher.on("update", (payload: UpdatePayload<T>) => {
      // save items to storage
      this.storage.insert(payload.items);
      // save period to fetched
      this.fetched.insert(payload.period);
    });
  }

  fetch(datetime: DateTime) {
    const request = luxonHelper.getIntervalFromCenter(
      datetime,
      this.config.fetchDuration
    );
    const unfetchedPeriods = this.fetched
      .getUnfetchedPeriods(request, this.config.requestDurationLimit)
      // 取得した `unfetchedPeriods` を `datetime` に近い順番にソートする
      .sort((a, b) => {
        const diffA = datetime.diff(luxonHelper.getIntervalCenter(a)).valueOf();
        const diffB = datetime.diff(luxonHelper.getIntervalCenter(b)).valueOf();
        return diffA - diffB;
      });
    // 実際にリクエストを投げてもらう
    this.fetcher.fetch(unfetchedPeriods);
  }
}
