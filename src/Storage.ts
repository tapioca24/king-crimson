import AVLTree from "avl";

class Storage<T extends KingCrimson.SequentialData> {
  private tree = new AVLTree();

  insert(items: T[]) {
    for (const item of items) {
      this.tree.insert(item.timestamp, item);
    }
  }
}

export default Storage;
