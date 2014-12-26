exports.getCombinations = function(chars, size) {
  var result = [];
  var cache = [];
  var f = function(prefix, chars, size) {
    for (var i = 0; i < chars.length; i++) {
      if(size == null || prefix.length == size-1) {
        result.push(prefix + chars[i]);
      }
      cache.push(prefix + chars[i]);

      if(size == null || prefix.length < size-1)
      f(prefix + chars[i], chars.slice(i + 1), size);
    }
  }
  f('', chars, size);
  return result;
}