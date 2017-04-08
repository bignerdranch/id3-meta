(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.id3Meta = global.id3Meta || {})));
}(this, (function (exports) { 'use strict';

var Cursor = ((buffer, offset) => {
  let consume = size => {
    let cursor = [buffer, offset, size];
    skip(size);
    return cursor;
  };

  let skip = size => {
    offset += size;
  };

  return Object.assign(consume, {
    skip, buffer, offset: () => offset
  });
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

let decode = (format, string) => new TextDecoder(format).decode(string);

let synchToInt = synch => {
  const mask = 0b01111111;
  let b1 = synch & mask;
  let b2 = synch >> 8 & mask;
  let b3 = synch >> 16 & mask;
  let b4 = synch >> 24 & mask;

  return b1 | b2 << 7 | b3 << 14 | b4 << 21;
};

const HEADER_SIZE = 10;
const ID3_ENCODINGS = ['ascii', 'utf-16', 'utf-16be', 'utf-8'];

let decodeLang = cursor => {
  return decode('ascii', new Uint8Array(...cursor(3)));
};

let decodeEncoding = cursor => {
  let view = new DataView(...cursor(1));
  return ID3_ENCODINGS[view.getUint8()];
};

let decodeText = (cursor, size, encoding) => {
  return decode(encoding, new Uint8Array(...cursor(size)));
};

let decodeNullString = (cursor, limit, encoding = 'ascii') => {
  let offset = cursor.offset();
  let array = new Uint8Array(...cursor(limit));
  let index = array.indexOf(0);
  if (index < 0) {
    return '';
  }
  cursor.skip(index - limit + 1);
  return decode(encoding, array.slice(0, index));
};

let decodeImage = (cursor, size) => {
  let [buffer, offset] = cursor(size);
  return buffer.slice(offset, offset + size);
};

let defaultFrameDecoder = (cursor, size) => {
  let encoding = decodeEncoding(cursor);
  return {
    text: decodeText(cursor, size - 1, encoding)
  };
};

let langFrameDecoder = (cursor, size) => {
  let encoding = decodeEncoding(cursor);
  return {
    lang: decodeLang(cursor),
    text: decodeText(cursor, size - 4, encoding)
  };
};

let picFrameDecoder = (cursor, size) => {
  let offset = cursor.offset();
  let remaining = () => size + offset - cursor.offset();

  let encoding = decodeEncoding(cursor);
  let mime = decodeNullString(cursor, remaining());
  cursor.skip(1);
  let text = decodeNullString(cursor, remaining(), encoding);
  let image = decodeImage(cursor, remaining());
  let blob = new Blob([image], { type: mime });

  return { mime, text, blob };
};

let frameDecoders = {
  APIC: picFrameDecoder,
  USLT: langFrameDecoder,
  SYLT: langFrameDecoder,
  COMM: langFrameDecoder,
  USER: langFrameDecoder
};

let decodeFrame = (buffer, offset) => {
  let cursor = Cursor(buffer, offset);
  let header = new DataView(...cursor(HEADER_SIZE));
  if (header.getUint8(0) === 0) {
    return;
  }

  let id = decode('ascii', new Uint8Array(buffer, offset, 4));
  let size = header.getUint32(4);

  let decoder = frameDecoders[id] || defaultFrameDecoder;

  return _extends({
    id, size: size + HEADER_SIZE
  }, decoder(cursor, size));
};

var index = (buffer => {
  let header = new DataView(buffer, 0, HEADER_SIZE);

  let major = header.getUint8(3);
  let minor = header.getUint8(4);
  let version = `ID3v2.${major}.${minor}`;
  // console.log(version);

  let size = synchToInt(header.getUint32(6));

  let offset = HEADER_SIZE;
  let id3Size = HEADER_SIZE + size;

  let frames = {};

  while (offset < id3Size) {
    let frame = decodeFrame(buffer, offset);
    if (!frame) {
      break;
    }
    frames[frame.id] = frame;
    offset += frame.size;
  }

  return frames;
});

exports['default'] = index;

Object.defineProperty(exports, '__esModule', { value: true });

})));
