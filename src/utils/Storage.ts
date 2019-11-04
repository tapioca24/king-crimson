import AVLTree from "avl";
import { Interval } from "luxon";

class Storage<T> {
  private tree = new AVLTree();

  get size() {
    return this.tree.size;
  }

  /**
   * データを挿入する
   * @param data 挿入するデータの配列
   */
  insert(data: { key: any, item: T }[]) {
    for (const d of data) {
      this.tree.insert(d.key, d.item)
    }
  }

  /**
   * 指定範囲に含まれるデータを検索する
   * @param period 指定範囲
   */
  search(period: Interval) {
    const start = period.start.toMillis();
    const end = period.end.toMillis();

    const items: T[] = [];
    this.tree.range(start, end, node => {
      const data = node.data as T;
      items.push(data);
    });
    return items;
  }
}

export default Storage;
