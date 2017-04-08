# MP3 ID3v2 Meta Parser

Parses ID3v3 metadata from an MP3 file stored in an `ArrayBuffer`:

```javascript
import parser from 'id3-meta';

let meta = parser(buffer);

console.log(meta);

// =>
{ TIT2: {id:"TIT2",size:125,text:"Symphony No. 1 in E Minor, Op. 39: III. Scherzo: Allegro"},
  TPE1: {id:"TPE1",size:93,text:"Lahti Symphony Orchestra and Osmo Vänskä"},
  TALB: {id:"TALB",size:165,text:"Sibelius: The Complete Symphonies - Karelia - Lemminkäinen - Violin Concerto"},
  TCON: {id:"TCON",size:31,text:"Classical"},
  TCOM: {id:"TCOM",size:39,text:"Jean Sibelius"},"TPE3":{"id":"TPE3","size":35,"text":"Osmo Vänskä"},
  TRCK: {id:"TRCK",size:21,text:"4/43"},
  TYER: {id:"TYER",size:21,text:"2011"},
  TPE2: {id:"TPE2",size:93,text:"Lahti Symphony Orchestra and Osmo Vänskä"},
  TCOP: {id:"TCOP",size:29,text:"2011 Bis"},
  TPOS: {id:"TPOS",size:19,text:"1/1"},
  APIC: {id:"APIC",size:216577,mime:"image/jpeg",text:"",blob:{}} }
```
