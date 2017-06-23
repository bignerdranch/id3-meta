import {
  isBlank,
  strLeft,
  strRight
} from 'underscore.string';

let pipe = (fx, fy) => (...args) => fy(fx(...args));

let present = (s) => !isBlank(s);
let yes = () => true;

let key = (name) => (obj) => obj[name];
let text = key('text');

export const ALBUM_FIELDS = {
  title     : ['TALB', text, present],
  artist    : ['TPE1', text, present],
  performers: ['TPE2', text, present],
  conductor : ['TPE3', text, present],
  genre     : ['TCON', text, present],
  composer  : ['TCOM', text, present],
  year      : ['TYER', text, present],
  songCount : ['TRCK', pipe(text, s => parseInt(strRight(s, '/'), 10)), present],
  artwork   : ['APIC', key('blob'), yes],
};

export const SONG_FIELDS = {
  albumTitle: ['TALB', text, present],
  title     : ['TIT2', text, present],
  artist    : ['TPE1', text, present],
  performers: ['TPE2', text, present],
  conductor : ['TPE3', text, present],
  composer  : ['TCOM', text, present],
  track     : ['TRCK', pipe(text, s => parseInt(strLeft(s, '/'), 10)), present],
};

let extract = (meta, fields) =>
  Object.keys(fields).reduce((memo, field) => {
    let [id3, extract, test] = fields[field];
    if (meta.hasOwnProperty(id3)) {
      let value = extract(meta[id3]);
      if (test(value)) {
        memo[field] = value;
      }
    }
    return memo;
  }, {});

export let mapSongMeta = (meta) => {
  return extract(meta, SONG_FIELDS);
};

export let mapAlbumMeta = (meta) => {
  return extract(meta, ALBUM_FIELDS);
};
