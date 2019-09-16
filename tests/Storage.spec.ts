import Storage from "../src/Storage";
import { DateTime, Duration, Interval } from "luxon";
import { createPeriods } from "./testHelper";

interface MyData {
  timestamp: number;
  duration: number;
}

// 複数の連続したデータを作成する
const createDataList = (
  start: DateTime,
  duration: Duration,
  num: number
): MyData[] => {
  return createPeriods(start, duration, num).map(period => {
    return {
      timestamp: period.start.toMillis(),
      duration: period.toDuration().valueOf()
    };
  });
};

describe("Storage", () => {
  const list = createDataList(
    DateTime.fromISO("2019-01-01T00:00:00Z"),
    Duration.fromObject({ minute: 1 }),
    5
  );

  describe("insert", () => {
    it("指定した個数のデータが挿入される", () => {
      const s = new Storage<MyData>();
      s.insert(list);

      expect(s.size).toBe(5);
    });
  });

  describe("search", () => {
    it("指定した区間のデータが全て取得される", () => {
      const s = new Storage<MyData>();
      s.insert(list);

      const start = DateTime.fromISO("2019-01-01T00:00:30Z");
      const end = DateTime.fromISO("2019-01-01T00:03:30Z");
      const period = Interval.fromDateTimes(start, end);

      const result = s.search(period);
      expect(result.length).toBe(3);
    });
  });
});
