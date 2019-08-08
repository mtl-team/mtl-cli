/**
 * 生成一个 UUID 字符串
 */
define(function () {
  return function (len) {
    len = len || 6;
    len = parseInt(len, 10);
    len = isNaN(len) ? 6 : len;
    let seed = 'abcdefghijklmnopqrstubwxyzABCEDFGHIJKLMNOPQRSTUVWXYZ';
    let seedLen = seed.length - 1;
    let uid = '';
    while (len--) {
      uid += seed[Math.round(Math.random() * seedLen)];
    }
    return uid;
  };
});