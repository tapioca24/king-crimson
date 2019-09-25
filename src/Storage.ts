import AVLTree from "avl";
import { Interval } from "luxon";

class Storage<T extends KingCrimson.DateTimeData> {
  private tree = new AVLTree();

  get size() {
    return this.tree.size;
  }

  insert(items: T[]) {
    for (const item of items) {
      this.tree.insert(item.timestamp, item);
    }
  }

  /**
   * 指定範囲に含まれるデータを検索する
   * @param period 指定範囲
   */
  search(period: Interval) {
    const start = period.start.toMillis();
    const end = period.end.toMillis();

    const list: T[] = [];
    this.tree.range(start, end, node => {
      const data = node.data as T;
      list.push(data);
    });
    return list;
  }
}

export default Storage;
