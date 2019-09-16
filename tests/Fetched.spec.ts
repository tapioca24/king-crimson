import Fetched from "../src/Fetched";
import { DateTime, Duration, Interval } from "luxon";
import { createPeriods } from './testHelper'

describe("Fetched", () => {
  const ps = createPeriods(
    DateTime.fromISO("2019-01-01T00:00:00Z"),
    Duration.fromObject({ hours: 1 }),
    5
  );

  describe("insert", () => {
    it("連続しない区間を追加", () => {
      const f = new Fetched();
      f.insert([ps[0], ps[2], ps[4]]);
      expect(f.periods.length).toBe(3);

      expect(f.periods[0].equals(ps[0])).toBeTruthy();
      expect(f.periods[1].equals(ps[2])).toBeTruthy();
      expect(f.periods[2].equals(ps[4])).toBeTruthy();
    });

    it("連続する区間を追加", () => {
      const f = new Fetched();
      f.insert([ps[0], ps[1], ps[4]]);
      expect(f.periods.length).toBe(2);
      const e = Interval.fromDateTimes(ps[0].start, ps[1].end);
      expect(f.periods[0].equals(e)).toBeTruthy();
      expect(f.periods[1].equals(ps[4])).toBeTruthy();
    });
  });

  describe("clear", () => {
    it("全データを削除", () => {
      const f = new Fetched();
      f.insert([ps[0], ps[1], ps[4]]);
      f.clear();
      expect(f.periods.length).toBe(0);
    });
  });

  describe("getUnfetchedPeriods", () => {
    const f = new Fetched();
    f.insert([ps[0], ps[2], ps[3]]);

    it("未取得区間が返される", () => {
      const start = ps[0].start.minus({ hour: 1 });
      const end = ps[4].end.plus({ hour: 1 });
      const request = Interval.fromDateTimes(start, end);

      const result = f.getUnfetchedPeriods(request);
      expect(result.length).toBe(3);

      let e;
      e = Interval.fromDateTimes(start, ps[0].start);
      expect(result[0].equals(e)).toBeTruthy();
      e = Interval.fromDateTimes(ps[0].end, ps[2].start);
      expect(result[1].equals(e)).toBeTruthy();
      e = Interval.fromDateTimes(ps[3].end, end);
      expect(result[2].equals(e)).toBeTruthy();
    });

    it("必要なら分割される", () => {
      const start = ps[0].start.minus({ hour: 1 });
      const end = ps[4].end.plus({ hour: 1 });
      const request = Interval.fromDateTimes(start, end);
      const limit = Duration.fromObject({ hour: 1 });

      const result = f.getUnfetchedPeriods(request, limit);
      expect(result.length).toBe(4);

      let e;
      e = Interval.fromDateTimes(start, ps[0].start);
      expect(result[0].equals(e)).toBeTruthy();
      e = Interval.fromDateTimes(ps[0].end, ps[2].start);
      expect(result[1].equals(e)).toBeTruthy();
      e = Interval.fromDateTimes(ps[3].end, ps[4].end);
      expect(result[2].equals(e)).toBeTruthy();
      e = Interval.fromDateTimes(ps[4].end, end);
      expect(result[3].equals(e)).toBeTruthy();
    });
  });
});
