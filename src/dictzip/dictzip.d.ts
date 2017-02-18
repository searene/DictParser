declare module "inflate" {
    export function jszlib_inflate_buffer(buffer: Uint8Array, start?: number, length?: number, afterUncOffset?: number): Buffer;
}
