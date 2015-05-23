(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define('chip8x', [], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.chip8x = factory();
  }
}(this, function () {
  function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }

  function Program() {
    this.bytes = [];
  }

  Program.prototype.end = function () {
    this.bytes.push(0x1F);
    this.bytes.push(0xFF);
    return this;
  };

  Program.prototype.clearScreen = function () {
    this.bytes.push(0x00);
    this.bytes.push(0xE0);
    return this;
  };

  Program.prototype.setCharInto = function (c, a) {
    this.bytes.push(0x60 + a);
    this.bytes.push(c);
    this.bytes.push(0xF0 + a);
    this.bytes.push(0x29);
    return this;
  };

  Program.prototype.draw = function (a, b, x, y, n) {
    this.bytes.push(0x60 + a);
    this.bytes.push(x);
    this.bytes.push(0x60 + b);
    this.bytes.push(y);
    this.bytes.push(0xD0 + a);
    this.bytes.push(b * 0x10 + n);
  };

  Program.prototype.toString = function () {
    var s = [];
    for (var i = 0; i < this.bytes.length; i += 2) {
      var index = pad(i, 4);
      var h = pad(this.bytes[i].toString(16), 2);
      var l = '--';
      if (i + 1 < this.bytes.length) {
        l = pad(this.bytes[i + 1].toString(16), 2);
      }
      s.push(index + ': ' + h + l);
    }
    return s.join('\n');
  };

  return {
    Program: Program
  };
}));
