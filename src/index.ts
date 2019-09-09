import Fetched from "@/Fetched";
import Fetcher, { FetchFn, UpdatePayload } from "@/Fetcher";

class KingCrimson<T extends KingCrimson.SequentialData> {
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
      // save data to storage
      // save period to fetched
    });
  }

  fetch() {}
}
