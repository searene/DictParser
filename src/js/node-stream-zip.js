/**
 * @license node-stream-zip | (c) 2015 Antelle | https://github.com/antelle/node-stream-zip/blob/master/MIT-LICENSE.txt
 * Portions copyright https://github.com/cthackers/adm-zip | https://raw.githubusercontent.com/cthackers/adm-zip/master/MIT-LICENSE.txt
 * Modified by Searene for dict-parser
 */
const events = require("events"),
  pako = require("pako"),
  Buffer = require("buffer").Buffer,
// stream = require("stream");
  OSSpecificImplementationGetter = require("../os-specific/OSSpecificImplementationGetter").OSSpecificImplementationGetter;

// endregion

// region Constants

var consts = {
  /* The local file header */
  LOCHDR: 30, // LOC header size
  LOCSIG: 0x04034b50, // "PK\003\004"
  LOCVER: 4, // version needed to extract
  LOCFLG: 6, // general purpose bit flag
  LOCHOW: 8, // compression method
  LOCTIM: 10, // modification time (2 bytes time, 2 bytes date)
  LOCCRC: 14, // uncompressed file crc-32 value
  LOCSIZ: 18, // compressed size
  LOCLEN: 22, // uncompressed size
  LOCNAM: 26, // filename length
  LOCEXT: 28, // extra field length

  /* The Data descriptor */
  EXTSIG: 0x08074b50, // "PK\007\008"
  EXTHDR: 16, // EXT header size
  EXTCRC: 4, // uncompressed file crc-32 value
  EXTSIZ: 8, // compressed size
  EXTLEN: 12, // uncompressed size

  /* The central directory file header */
  CENHDR: 46, // CEN header size
  CENSIG: 0x02014b50, // "PK\001\002"
  CENVEM: 4, // version made by
  CENVER: 6, // version needed to extract
  CENFLG: 8, // encrypt, decrypt flags
  CENHOW: 10, // compression method
  CENTIM: 12, // modification time (2 bytes time, 2 bytes date)
  CENCRC: 16, // uncompressed file crc-32 value
  CENSIZ: 20, // compressed size
  CENLEN: 24, // uncompressed size
  CENNAM: 28, // filename length
  CENEXT: 30, // extra field length
  CENCOM: 32, // file comment length
  CENDSK: 34, // volume number start
  CENATT: 36, // internal file attributes
  CENATX: 38, // external file attributes (host system dependent)
  CENOFF: 42, // LOC header offset

  /* The entries in the end of central directory */
  ENDHDR: 22, // size of "end of central directory record(EOCD)"

  // End of central directory signature = 0x06054b50, little-endian
  ENDSIG: 0x06054b50, // "PK\005\006"
  ENDSIGFIRST: 0x50,
  ENDSUB: 8, // number of entries on this disk
  ENDTOT: 10, // total number of entries
  ENDSIZ: 12, // central directory size in bytes
  ENDOFF: 16, // offset of start of central directory, relative to start of archive
  ENDCOM: 20, // zip file comment length
  MAXFILECOMMENT: 0xffff,

  /* The entries in the end of ZIP64 central directory locator */
  ENDL64HDR: 20, // ZIP64 end of central directory locator header size
  ENDL64SIG: 0x07064b50, // ZIP64 end of central directory locator signature
  ENDL64SIGFIRST: 0x50,
  ENDL64OFS: 8, // ZIP64 end of central directory offset

  /* The entries in the end of ZIP64 central directory */
  END64HDR: 56, // ZIP64 end of central directory header size
  END64SIG: 0x06064b50, // ZIP64 end of central directory signature
  END64SIGFIRST: 0x50,
  END64SUB: 24, // number of entries on this disk
  END64TOT: 32, // total number of entries
  END64SIZ: 40,
  END64OFF: 48,

  /* Compression methods */
  STORED: 0, // no compression
  SHRUNK: 1, // shrunk
  REDUCED1: 2, // reduced with compression factor 1
  REDUCED2: 3, // reduced with compression factor 2
  REDUCED3: 4, // reduced with compression factor 3
  REDUCED4: 5, // reduced with compression factor 4
  IMPLODED: 6, // imploded
  // 7 reserved
  DEFLATED: 8, // deflated
  ENHANCED_DEFLATED: 9, // enhanced deflated
  PKWARE: 10, // PKWare DCL imploded
  // 11 reserved
  BZIP2: 12, //  compressed using BZIP2
  // 13 reserved
  LZMA: 14, // LZMA
  // 15-17 reserved
  IBM_TERSE: 18, // compressed using IBM TERSE
  IBM_LZ77: 19, //IBM LZ77 z

  /* General purpose bit flag */
  FLG_ENC: 0, // encrypted file
  FLG_COMP1: 1, // compression option
  FLG_COMP2: 2, // compression option
  FLG_DESC: 4, // data descriptor
  FLG_ENH: 8, // enhanced deflation
  FLG_STR: 16, // strong encryption
  FLG_LNG: 1024, // language encoding
  FLG_MSK: 4096, // mask header values
  FLG_ENTRY_ENC: 1,

  /* 4.5 Extensible data fields */
  EF_ID: 0,
  EF_SIZE: 2,

  /* Header IDs */
  ID_ZIP64: 0x0001,
  ID_AVINFO: 0x0007,
  ID_PFS: 0x0008,
  ID_OS2: 0x0009,
  ID_NTFS: 0x000a,
  ID_OPENVMS: 0x000c,
  ID_UNIX: 0x000d,
  ID_FORK: 0x000e,
  ID_PATCH: 0x000f,
  ID_X509_PKCS7: 0x0014,
  ID_X509_CERTID_F: 0x0015,
  ID_X509_CERTID_C: 0x0016,
  ID_STRONGENC: 0x0017,
  ID_RECORD_MGT: 0x0018,
  ID_X509_PKCS7_RL: 0x0019,
  ID_IBM1: 0x0065,
  ID_IBM2: 0x0066,
  ID_POSZIP: 0x4690,

  EF_ZIP64_OR_32: 0xffffffff,
  EF_ZIP64_OR_16: 0xffff
};

// endregion

// region StreamZip

var StreamZip = function(config) {
  events.EventEmitter.call(this);
  var fileId,
    fileSize,
    chunkSize,
    ready = false,
    that = this,
    op,
    centralDirectory,
    entries = config.storeEntries === true ? {} : null,
    buildEntries = config.buildEntries,
    fileName = config.file;

  if (buildEntries) {
    open().then(readCentralDirectory);
  }

  function open() {
    return OSSpecificImplementationGetter.fs
      .open(fileName, "r")
      .then(f => {
        fileId = f;
        return OSSpecificImplementationGetter.fs.getSize(fileName);
      })
      .then(size => {
        fileSize = size;
        chunkSize = config.chunkSize || Math.round(fileSize / 1000);
        chunkSize = Math.max(Math.min(chunkSize, Math.min(128 * 1024, fileSize)), Math.min(1024, fileSize));
      });
  }

  function readUntilFoundCallback(err, bytesRead) {
    if (err || !bytesRead) {
      return that.emit("error", err || "Archive read error");
    }
    var buffer = op.win.buffer,
      pos = op.lastPos,
      bufferPosition = pos - op.win.position,
      minPos = op.minPos;
    while (--pos >= minPos && --bufferPosition >= 0) {
      if (buffer.length - bufferPosition >= 4 && buffer[bufferPosition] === op.firstByte) {
        // quick check first signature byte
        if (buffer.readUInt32LE(bufferPosition) === op.sig) {
          op.lastBufferPosition = bufferPosition;
          op.lastBytesRead = bytesRead;
          op.complete();
          return;
        }
      }
    }
    if (pos === minPos) {
      return that.emit("error", "Bad archive");
    }
    op.lastPos = pos + 1;
    op.chunkSize *= 2;
    if (pos <= minPos) return that.emit("error", "Bad archive");
    var expandLength = Math.min(op.chunkSize, pos - minPos);
    op.win.expandLeft(expandLength, readUntilFoundCallback);
  }

  function readCentralDirectory() {
    var totalReadLength = Math.min(consts.ENDHDR + consts.MAXFILECOMMENT, fileSize);
    op = {
      win: new FileWindowBuffer(fileId),
      totalReadLength: totalReadLength,
      minPos: fileSize - totalReadLength,
      lastPos: fileSize,
      chunkSize: Math.min(1024, chunkSize),
      firstByte: consts.ENDSIGFIRST,
      sig: consts.ENDSIG,
      complete: readCentralDirectoryComplete
    };
    op.win.read(fileSize - op.chunkSize, op.chunkSize, readUntilFoundCallback);
  }

  function readCentralDirectoryComplete() {
    var buffer = op.win.buffer;
    var pos = op.lastBufferPosition;
    try {
      centralDirectory = new CentralDirectoryHeader();
      centralDirectory.read(buffer.slice(pos, pos + consts.ENDHDR));
      centralDirectory.headerOffset = op.win.position + pos;
      if (centralDirectory.commentLength)
        that.comment = buffer
          .slice(pos + consts.ENDHDR, pos + consts.ENDHDR + centralDirectory.commentLength)
          .toString();
      else that.comment = null;
      that.entriesCount = centralDirectory.volumeEntries;
      that.centralDirectory = centralDirectory;
      if (
        (centralDirectory.volumeEntries === consts.EF_ZIP64_OR_16 &&
          centralDirectory.totalEntries === consts.EF_ZIP64_OR_16) ||
        centralDirectory.size === consts.EF_ZIP64_OR_32 ||
        centralDirectory.offset === consts.EF_ZIP64_OR_32
      ) {
        readZip64CentralDirectoryLocator();
      } else {
        op = {};
        readEntries();
      }
    } catch (err) {
      that.emit("error", err);
    }
  }

  function readZip64CentralDirectoryLocator() {
    var length = consts.ENDL64HDR;
    if (op.lastBufferPosition > length) {
      op.lastBufferPosition -= length;
      readZip64CentralDirectoryLocatorComplete();
    } else {
      op = {
        win: op.win,
        totalReadLength: length,
        minPos: op.win.position - length,
        lastPos: op.win.position,
        chunkSize: op.chunkSize,
        firstByte: consts.ENDL64SIGFIRST,
        sig: consts.ENDL64SIG,
        complete: readZip64CentralDirectoryLocatorComplete
      };
      op.win.read(op.lastPos - op.chunkSize, op.chunkSize, readUntilFoundCallback);
    }
  }

  function readZip64CentralDirectoryLocatorComplete() {
    var buffer = op.win.buffer;
    var locHeader = new CentralDirectoryLoc64Header();
    locHeader.read(buffer.slice(op.lastBufferPosition, op.lastBufferPosition + consts.ENDL64HDR));
    var readLength = fileSize - locHeader.headerOffset;
    op = {
      win: op.win,
      totalReadLength: readLength,
      minPos: locHeader.headerOffset,
      lastPos: op.lastPos,
      chunkSize: op.chunkSize,
      firstByte: consts.END64SIGFIRST,
      sig: consts.END64SIG,
      complete: readZip64CentralDirectoryComplete
    };
    op.win.read(fileSize - op.chunkSize, op.chunkSize, readUntilFoundCallback);
  }

  function readZip64CentralDirectoryComplete() {
    var buffer = op.win.buffer;
    var zip64cd = new CentralDirectoryZip64Header();
    zip64cd.read(buffer.slice(op.lastBufferPosition, op.lastBufferPosition + consts.END64HDR));
    that.centralDirectory.volumeEntries = zip64cd.volumeEntries;
    that.centralDirectory.totalEntries = zip64cd.totalEntries;
    that.centralDirectory.size = zip64cd.size;
    that.centralDirectory.offset = zip64cd.offset;
    that.entriesCount = zip64cd.volumeEntries;
    op = {};
    readEntries();
  }

  function readEntries() {
    op = {
      win: new FileWindowBuffer(fileId),
      pos: centralDirectory.offset,
      chunkSize: chunkSize,
      entriesLeft: centralDirectory.volumeEntries
    };
    op.win.read(op.pos, Math.min(chunkSize, fileSize - op.pos), readEntriesCallback);
  }

  function readEntriesCallback(err, bytesRead) {
    if (err || !bytesRead) return that.emit("error", err || "Entries read error");
    var buffer = op.win.buffer,
      bufferPos = op.pos - op.win.position,
      bufferLength = buffer.length,
      entry = op.entry;
    try {
      while (op.entriesLeft > 0) {
        if (!entry) {
          entry = new ZipEntry();
          entry.readHeader(buffer, bufferPos);
          entry.headerOffset = op.win.position + bufferPos;
          op.entry = entry;
          op.pos += consts.CENHDR;
          bufferPos += consts.CENHDR;
        }
        var entryHeaderSize = entry.fnameLen + entry.extraLen + entry.comLen;
        var advanceBytes = entryHeaderSize + (op.entriesLeft > 1 ? consts.CENHDR : 0);
        if (bufferLength - bufferPos < advanceBytes) {
          op.win.moveRight(chunkSize, readEntriesCallback, bufferPos);
          op.move = true;
          return;
        }
        entry.read(buffer, bufferPos);
        if (entries) entries[entry.name] = entry;
        that.emit("entry", {
          offset: entry.offset,
          name: entry.name,
          isDirectory: entry.isDirectory
        });
        op.entry = entry = null;
        op.entriesLeft--;
        op.pos += entryHeaderSize;
        bufferPos += entryHeaderSize;
      }
      that.emit("ready");
    } catch (err) {
      that.emit("error", err);
    }
  }

  function checkEntriesExist() {
    if (!entries) throw new Error("storeEntries disabled");
  }

  Object.defineProperty(this, "ready", {
    get: function() {
      return ready;
    }
  });

  this.entry = function(name) {
    checkEntriesExist();
    return entries[name];
  };

  this.setEntries = function(entryList) {
    entries = entryList;
    for (entry of entries) {
      entries[entry.name] = entry;
    }
    return entries;
  };

  this.entries = function() {
    checkEntriesExist();
    return entries;
  };
  this.openEntryPromise = async function(entry) {
    return new Promise((resolve, reject) => {
      openEntry(entry, function(err, entry) {
        if (err) {
          reject(err);
        }
        resolve(entry);
      });
    });
  };
  this.inflate = async function(entry) {
    const openedEntry = await this.openEntryPromise(entry);
    const compressed = (await OSSpecificImplementationGetter.fs.read(
      fileId,
      openedEntry.compressedSize,
      dataOffset(openedEntry)
    )).buffer;
    const inflated = pako.inflateRaw(new Uint8Array(compressed));
    return new Buffer(inflated);
  };

  function openEntry(entry, callback, sync) {
    if (typeof entry === "string") {
      checkEntriesExist();
      entry = entries[entry];
      if (!entry) return callback("Entry not found");
    }
    if (entry.isDirectory) return callback("Entry is not file");
    if (!fileId) {
      OSSpecificImplementationGetter.fs.open(fileName, "r").then(f => {
        fileId = f;
        openEntry(entry, callback, sync);
      });
    } else {
      OSSpecificImplementationGetter.fs
        .read(fileId, consts.LOCHDR, entry.offset)
        .then(readContents => {
          let readEx;
          try {
            entry.readDataHeader(readContents.buffer);
            const encrypted = (this.flags & consts.FLG_ENTRY_ENC) === consts.FLG_ENTRY_ENC;
            if (encrypted) {
              readEx = "Entry encrypted";
            }
          } catch (ex) {
            readEx = ex;
          }
          callback(readEx, entry);
        })
        .catch(callback);
    }
  }

  function dataOffset(entry) {
    return entry.offset + consts.LOCHDR + entry.fnameLen + entry.extraLen;
  }

  this.close = function() {
    if (fileId) {
      OSSpecificImplementationGetter.fs.close(fileId).then(() => {
        fileId = null;
      });
    }
  };
};

StreamZip.prototype = Object.create(events.EventEmitter.prototype);
StreamZip.prototype.constructor = StreamZip;

StreamZip.setFs = function(customFs) {
  fs = customFs;
};

// endregion

// region CentralDirectoryHeader

var CentralDirectoryHeader = function() {};

CentralDirectoryHeader.prototype.read = function(data) {
  if (data.length !== consts.ENDHDR || data.readUInt32LE(0) !== consts.ENDSIG)
    throw new Error("Invalid central directory");
  // number of entries on this volume
  this.volumeEntries = data.readUInt16LE(consts.ENDSUB);
  // total number of entries
  this.totalEntries = data.readUInt16LE(consts.ENDTOT);
  // central directory size in bytes
  this.size = data.readUInt32LE(consts.ENDSIZ);
  // offset of first CEN header
  this.offset = data.readUInt32LE(consts.ENDOFF);
  // zip file comment length
  this.commentLength = data.readUInt16LE(consts.ENDCOM);
};

// endregion

// region CentralDirectoryLoc64Header

var CentralDirectoryLoc64Header = function() {};

CentralDirectoryLoc64Header.prototype.read = function(data) {
  if (data.length != consts.ENDL64HDR || data.readUInt32LE(0) != consts.ENDL64SIG)
    throw new Error("Invalid zip64 central directory locator");
  // ZIP64 EOCD header offset
  this.headerOffset = Util.readUInt64LE(data, consts.ENDSUB);
};

// endregion

// region CentralDirectoryZip64Header

var CentralDirectoryZip64Header = function() {};

CentralDirectoryZip64Header.prototype.read = function(data) {
  if (data.length !== consts.END64HDR || data.readUInt32LE(0) !== consts.END64SIG)
    throw new Error("Invalid central directory");
  // number of entries on this volume
  this.volumeEntries = Util.readUInt64LE(data, consts.END64SUB);
  // total number of entries
  this.totalEntries = Util.readUInt64LE(data, consts.END64TOT);
  // central directory size in bytes
  this.size = Util.readUInt64LE(data, consts.END64SIZ);
  // offset of first CEN header
  this.offset = Util.readUInt64LE(data, consts.END64OFF);
};

// endregion

// region ZipEntry

var ZipEntry = function() {};

ZipEntry.prototype.readHeader = function(data, offset) {
  // data should be 46 bytes and start with "PK 01 02"
  if (data.length < offset + consts.CENHDR || data.readUInt32LE(offset) !== consts.CENSIG) {
    throw new Error("Invalid entry header");
  }
  // version made by
  this.verMade = data.readUInt16LE(offset + consts.CENVEM);
  // version needed to extract
  this.version = data.readUInt16LE(offset + consts.CENVER);
  // encrypt, decrypt flags
  this.flags = data.readUInt16LE(offset + consts.CENFLG);
  // compression method
  this.method = data.readUInt16LE(offset + consts.CENHOW);
  // modification time (2 bytes time, 2 bytes date)
  this.time = data.readUInt32LE(offset + consts.CENTIM);
  // uncompressed file crc-32 value
  this.crc = data.readUInt32LE(offset + consts.CENCRC);
  // compressed size
  this.compressedSize = data.readUInt32LE(offset + consts.CENSIZ);
  // uncompressed size
  this.size = data.readUInt32LE(offset + consts.CENLEN);
  // filename length
  this.fnameLen = data.readUInt16LE(offset + consts.CENNAM);
  // extra field length
  this.extraLen = data.readUInt16LE(offset + consts.CENEXT);
  // file comment length
  this.comLen = data.readUInt16LE(offset + consts.CENCOM);
  // volume number start
  this.diskStart = data.readUInt16LE(offset + consts.CENDSK);
  // internal file attributes
  this.inattr = data.readUInt16LE(offset + consts.CENATT);
  // external file attributes
  this.attr = data.readUInt32LE(offset + consts.CENATX);
  // LOC header offset
  this.offset = data.readUInt32LE(offset + consts.CENOFF);
};

ZipEntry.prototype.readDataHeader = function(data) {
  // 30 bytes and should start with "PK\003\004"
  if (data.readUInt32LE(0) !== consts.LOCSIG) {
    throw new Error("Invalid local header");
  }
  // version needed to extract
  this.version = data.readUInt16LE(consts.LOCVER);
  // general purpose bit flag
  this.flags = data.readUInt16LE(consts.LOCFLG);
  // compression method
  this.method = data.readUInt16LE(consts.LOCHOW);
  // modification time (2 bytes time ; 2 bytes date)
  this.time = data.readUInt32LE(consts.LOCTIM);
  // uncompressed file crc-32 value
  this.crc = data.readUInt32LE(consts.LOCCRC) || this.crc;
  // compressed size
  var compressedSize = data.readUInt32LE(consts.LOCSIZ);
  if (compressedSize && compressedSize !== consts.EF_ZIP64_OR_32) {
    this.compressedSize = compressedSize;
  }
  // uncompressed size
  var size = data.readUInt32LE(consts.LOCLEN);
  if (size && size !== consts.EF_ZIP64_OR_32) {
    this.size = size;
  }
  // filename length
  this.fnameLen = data.readUInt16LE(consts.LOCNAM);
  // extra field length
  this.extraLen = data.readUInt16LE(consts.LOCEXT);
};

ZipEntry.prototype.read = function(data, offset) {
  this.name = data.slice(offset, (offset += this.fnameLen)).toString();
  var lastChar = data[offset - 1];
  this.isDirectory = lastChar == 47 || lastChar == 92;

  if (this.extraLen) {
    this.readExtra(data, offset);
    offset += this.extraLen;
  }
  this.comment = this.comLen ? data.slice(offset, offset + this.comLen).toString() : null;
};

ZipEntry.prototype.readExtra = function(data, offset) {
  var signature,
    size,
    maxPos = offset + this.extraLen;
  while (offset < maxPos) {
    signature = data.readUInt16LE(offset);
    offset += 2;
    size = data.readUInt16LE(offset);
    offset += 2;
    if (consts.ID_ZIP64 === signature) {
      this.parseZip64Extra(data, offset, size);
    }
    offset += size;
  }
};

ZipEntry.prototype.parseZip64Extra = function(data, offset, length) {
  if (length >= 8 && this.size === consts.EF_ZIP64_OR_32) {
    this.size = Util.readUInt64LE(data, offset);
    offset += 8;
    length -= 8;
  }
  if (length >= 8 && this.compressedSize === consts.EF_ZIP64_OR_32) {
    this.compressedSize = Util.readUInt64LE(data, offset);
    offset += 8;
    length -= 8;
  }
  if (length >= 8 && this.offset === consts.EF_ZIP64_OR_32) {
    this.offset = Util.readUInt64LE(data, offset);
    offset += 8;
    length -= 8;
  }
  if (length >= 4 && this.diskStart === consts.EF_ZIP64_OR_16) {
    this.diskStart = data.readUInt32LE(offset);
    // offset += 4; length -= 4;
  }
};

// region FileWindowBuffer

var FileWindowBuffer = function(fileId) {
  this.position = 0;
  this.buffer = new Buffer(0);

  this.read = function(pos, length, callback) {
    if (this.buffer.length < length) this.buffer = new Buffer(length);
    this.position = pos;
    OSSpecificImplementationGetter.fs.read(fileId, length, this.position)
      .then(readContents => {
        this.buffer = readContents.buffer;
        callback(null, readContents.bytesRead);
      });
  };

  this.expandLeft = function(length, callback) {
    this.buffer = Buffer.concat([new Buffer(length), this.buffer]);
    this.position -= length;
    if (this.position < 0) this.position = 0;
    OSSpecificImplementationGetter.fs.read(fileId, length, this.position)
      .then(readContents => {
        this.buffer = readContents.buffer;
        callback(null, readContents.bytesRead);
      });
  };

  this.moveRight = function(length, callback, shift) {
    if (shift) {
      this.buffer.copy(this.buffer, 0, shift);
    } else {
      shift = 0;
    }
    this.position += shift;
    OSSpecificImplementationGetter.fs.readWithBufferOffset(fileId, this.buffer, this.buffer.length - shift, shift, this.position + this.buffer.length -shift)
      .then(readContents => {
        callback(null, readContents.bytesRead)
      });
  };
};


var Util = {
  readUInt64LE: function(buffer, offset) {
    return buffer.readUInt32LE(offset + 4) * 0x0000000100000000 + buffer.readUInt32LE(offset);
  }
};

module.exports = {
  StreamZip: StreamZip,
  ZipEntry: ZipEntry
};

