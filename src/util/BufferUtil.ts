export const readUInt64BE = (buf: Buffer, offset?: number): number => {
  if (offset === undefined) {
    offset = 0;
  }
  // tslint:disable-next-line:no-bitwise
  return (buf.readUInt32BE(0) << 8) + buf.readUInt32BE(4);
}
