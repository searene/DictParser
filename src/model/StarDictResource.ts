export class StarDictResource {
  public static TYPE_IMG = "img";
  public static TYPE_SND = "snd";
  public static TYPE_VDO = "vdo";
  public static TYPE_ATT = "att";

  public type: string;
  public fileName: string;

  constructor(type: string, fileName: string) {
    this.type = type;
    this.fileName = fileName;
  }
}