export class StringUtils {
  public static isEmpty = (s: string): boolean => {
    return s === null || s === undefined || s.length === 0;
  }
  public static isNotEmpty = (s: string): boolean => {
    return !StringUtils.isEmpty(s);
  }
}