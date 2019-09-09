import Storage from "@/Storage";
import Fetched from "@/Fetched";
import Fetcher, { FetchFn, UpdatePayload } from "@/Fetcher";

class KingCrimson<T extends KingCrimson.SequentialData> {
  private storage = new Storage<T>();
  private fetched = new Fetched();
  private fetcher: Fetcher<T> | null = null;

  constructor(fetchFn: FetchFn<T>) {
    this.fetcher = new Fetcher(fetchFn);
  }

  private setupFetcherEventHanlder() {
    if (!this.fetcher) {
      return;
    }

    this.fetcher.on("update", (payload: UpdatePayload<T>) => {
      // save items to storage
      this.storage.insert(payload.items)
      // save period to fetched
      this.fetched.insert(payload.period)
    });
  }

  fetch() {}
}
