export class ListUtil {

  /**
   * Get {count} numbers ending with {lastNumber}, step is 1.
   *
   * For example, if {count} is 3, {lastNumber} is 10, it returns [8, 9, 10]
   */
  public static buildList = (count: number, lastNumber: number): number[] => {
    const result = [];
    for (let i = lastNumber; i > lastNumber - count; i--) {
      result.push(i);
    }
    return result;
  }
}