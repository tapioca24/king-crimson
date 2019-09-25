declare module KingCrimson {
  export interface DateTimeData {
    timestamp: number;
    [key: string]: any;
  }

  export interface IntervalData extends DateTimeData {
    duration: number;
  }
}
