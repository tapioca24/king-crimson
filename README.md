# king-crimson

> A library that provides classes for managing sequential data.

## Installation

```sh
npm install king-crimson
```

## Usage

The following two management classes are provided.

- `DateTimeDataManager`: Manage data with datetime information.
- `IntervalDataManager`: Manages data with interval information.

### DateTimeDataManager

```ts
import { DateTimeDataManager } from "king-crimson";
import { DateTime, Duration, Interval } from "luxon";
import queryString from "query-string";

// Event data to manage
interface MyEventData {
  timestamp: number;
  event: string;
}

// Create an async function to call API
const fetchData = async (since: number, until: number, signal: AbortSignal) => {
  const query = queryString.stringify({ since, until });
  const url = `https://example.com/api/data?${query}`;
  const res = await fetch(uri, { signal });
  const data = await res.json();
  return data;
};

// Create instance
const ddm = new DateTimeDataManager<MyEventData>({
  fetchFn(period: Interval) {
    const controller = new AbortController();
    const signal = controller.signal;
    const since = period.start.toMillis();
    const until = period.end.toMillis();
    return {
      promise: fetchData(since, until, signal),
      cancel() {
        controller.abort();
      }
    };
  },
  itemKey(item: MyEventData) {
    return item.timestamp;
  }
});

// Execute fetch
const datetime = DateTime.local();
ddm.fetch(datetime);

// Cancel fetch
ddm.cansel();

// Search data
const interval = datetime.before(Duration.fromObject({ hour: 1 }));
const data = ddm.searchBetween(interval);
```

#### Config

| Property | Type                                                                  | Description                                                 |
| -------- | --------------------------------------------------------------------- | ----------------------------------------------------------- |
| fetchFn  | `(period: Interval) => { promise: Promise<T[]>, cancel: () => void }` | Methods that request data and methods that cancel requests. |
| itemKey  | `(item: T) => any`                                                    | Key value of AVL tree.                                      |

#### Options

| Property             | Type                                                                                       | Default                                | Description                                                               |
| -------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------- | ------------------------------------------------------------------------- |
| fetchDuration        | `Duration`                                                                                 | `Duration.fromObject({ hour: 24 })`    | Duration for making data requests in batch.                               |
| requestDurationLimit | `Duration`                                                                                 | `Duration.fromObject({ minute: 180 })` | Duration limit for one data request.                                      |
| updateInterceptor    | `((payload: { items: T[], period: Interval }) => { items: T[], period: Interval }) | null` | `null`                                 | Interceptor that transforms the payload before handling the update event. |

### IntervalDataManager

```ts
import { IntervalDataManager } from "king-crimson";
import { DateTime, Duration, Interval } from "luxon";
import queryString from "query-string";

// Event data to manage
interface MyEventData {
  timestamp: number;
  duration: number;
  event: string;
}

// Create an async function to call API
const fetchData = async (since: number, until: number, signal: AbortSignal) => {
  const query = queryString.stringify({ since, until });
  const url = `https://example.com/api/data?${query}`;
  const res = await fetch(uri, { signal });
  const data = await res.json();
  return data;
};

// Create instance
const idm = new IntervalDataManager<MyEventData>({
  fetchFn(period: Interval) {
    const controller = new AbortController();
    const signal = controller.signal;
    const since = period.start.toMillis();
    const until = period.end.toMillis();
    return {
      promise: fetchData(since, until, signal),
      cancel() {
        controller.abort();
      }
    };
  },
  itemKey(item: MyEventData) {
    return item.timestamp;
  },
  itemTimestamp(item: MyEventData) {
    return item.timestamp;
  },
  itemDuration(item: MyEventData) {
    return item.duration;
  }
});

// Execute fetch
const datetime = DateTime.local();
idm.fetch(datetime);

// Cancel fetch
idm.cansel();

// Search data
const interval = datetime.before(Duration.fromObject({ hour: 1 }));
let data = idm.searchBetween(interval);

// Search for data that includes a specified datetime
data = searchOn(datetime);
```

#### Config

| Property      | Type                                                                  | Description                                                            |
| ------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| fetchFn       | `(period: Interval) => { promise: Promise<T[]>, cancel: () => void }` | Methods that request data and methods that cancel requests.            |
| itemKey       | `(item: T) => any`                                                    | Key value of AVL tree.                                                 |
| itemTimestamp | `(item: T) => number`                                                 | Method that returns the timestamp of data in Unixtime in milliseconds. |
| itemDuration  | `(item: T) => number`                                                 | Method that returns duration of data in milliseconds.                  |

#### Options

| Property             | Type                                                                                       | Default                                | Description                                                               |
| -------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------- | ------------------------------------------------------------------------- |
| fetchDuration        | `Duration`                                                                                 | `Duration.fromObject({ hour: 24 })`    | Duration for making data requests in batch.                               |
| requestDurationLimit | `Duration`                                                                                 | `Duration.fromObject({ minute: 180 })` | Duration limit for one data request.                                      |
| updateInterceptor    | `((payload: { items: T[], period: Interval }) => { items: T[], period: Interval }) | null` | `null`                                 | Interceptor that transforms the payload before handling the update event. |

## Event

Both classes emit the following events:

| Event  | Payload                            | Description                                                                                   |
| ------ | ---------------------------------- | --------------------------------------------------------------------------------------------- |
| update | `{ items: T[], period: Interval }` | When each data fetch is completed, the acquired data and the acquisition period are notified. |
