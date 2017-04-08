export default (buffer, offset) => {
  let consume = (size) => {
    let cursor = [buffer, offset, size];
    skip(size);
    return cursor;
  };

  let skip = (size) => {
    offset += size;
  };

  return Object.assign(consume, {
    skip, buffer, offset: () => offset
  });
};
