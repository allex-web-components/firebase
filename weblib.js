function createWebLib (execlib) {
  'use strict';
  var mylib = {};
  require('./elements')(execlib);

  return mylib;
}
module.exports = createWebLib;