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

  Program.prototype.loadFromHref = function (href, cb) {
    var self = this;
    var req = new XMLHttpRequest();
    req.open('GET', href, true);
    req.responseType = 'arraybuffer';

    req.onload = function (e) {
      var buffer = req.response;
      if (buffer) {
        self.bytes = new Uint8Array(buffer);
        cb();
      } else {
        cb(e);
      }
    };

    req.send(null);
  };

  Program.prototype.draw = function (a, b, x, y, n) {
    this.bytes.push(0x60 + a);
    this.bytes.push(x);
    this.bytes.push(0x60 + b);
    this.bytes.push(y);
    this.bytes.push(0xD0 + a);
    this.bytes.push(b * 0x10 + n);
    return this;
  };

  Program.prototype.v = function (a, n) {
    this.bytes.push(0x60 + a);
    this.bytes.push(n);
    return this;
  };

  Program.prototype.mark = function () {
    this.mark = this.bytes.length + 0x200;
    return this;
  };

  Program.prototype.beep = function (a) {
    this.bytes.push(0xF0 + a);
    this.bytes.push(0x18);
    return this;
  };

  Program.prototype.jumpToMark = function () {
    this.bytes.push(0x10 + (this.mark >> 8));
    this.bytes.push(this.mark & 0xFF);
    return this;
  };

  Program.prototype.skipNextIfNotPressed = function (a) {
    this.bytes.push(0xE0 + a);
    this.bytes.push(0xA1);
    return this;
  }

  Program.prototype.toString = function () {
    var s = [];
    for (var i = 0; i < this.bytes.length; i += 2) {
      var index = pad(i, 4, ' ');
      var memloc = pad((i + 0x200).toString(16), 4);
      var h = pad(this.bytes[i].toString(16), 2);
      var l = '--';
      if (i + 1 < this.bytes.length) {
        l = pad(this.bytes[i + 1].toString(16), 2);
      }
      var desc = '';
      if (h === '00' && l == 'e0') {
        desc = '# Clear the screen';
      } else if (h == '00' && l == 'ee') {
        desc = '# Return from subroutine';
      } else if (h[0] === '1') {
        desc = '# Jump to 0' + h[1] + l;
      } else if (h[0] === '2') {
        desc = '# Call subroutine at 0' + h[1] + l;
      } else if (h[0] === '3') {
        desc = '# Skip next instruction if V' + h[1].toUpperCase() + ' == 0x' + l;
      } else if (h[0] === '4') {
        desc = '# Skip next instruction if V' + h[1].toUpperCase() + ' != 0x' + l;
      } else if (h[0] === '5') {
        desc = '# Skip next instruction if V' + h[1].toUpperCase() + ' != V' + l[0].toUpperCase();
      } else if (h[0] === '6') {
        desc = '# V' + h[1].toUpperCase() + ' := 0x' + l;
      } else if (h[0] === '7') {
        desc = '# V' + h[1].toUpperCase() + ' := V' + h[1].toUpperCase() + ' + 0x' + l;
      } else if (h[0] === '8') {
        desc = '# V' + h[1].toUpperCase() + ' := something with V' + l[0].toUpperCase();
      } else if (h[0] === '9') {
        desc = '# Skip next opcode if V' + h[1].toUpperCase() + ' != V' + l[0].toUpperCase();
      } else if (h[0] === 'a') {
        desc = '# I := 0x' + h[1] + l;
      } else if (h[0] === 'b') {
        desc = '# Jump to V0 + 0' + h[1] + l;
      } else if (h[0] === 'c') {
        desc = '# Generate random number into V' + h[1].toUpperCase();
      } else if (h[0] === 'd') {
        desc = '# Draw ' + l[1] + '-line sprite at (V' + h[1].toUpperCase() + ', V' + l[0].toUpperCase() + ')';
      } else if (h[0] === 'e') {
        desc = '# Skip next instruction ...';
      } else if (h[0] === 'f' && l === '55') {
        desc = '# Store V0..V' + h[1].toUpperCase() + ' in memory at M(I)';
      } else if (h[0] === 'f' && l === '65') {
        desc = '# Read V0..V' + h[1].toUpperCase() + ' from memory at M(I)';
      } else if (h[0] === 'f' && l === '1e') {
        desc = '# I := I + V' + h[1].toUpperCase();
      } else if (h[0] === 'f' && l === '29') {
        desc = '# Point I to 5-byte sprite in V' + h[1].toUpperCase();
      }
      s.push(index + '   ' + memloc + '    ' + h + l + '    ' + desc);
    }
    return s.join('\n');
  };

  return {
    Program: Program
  };
}));
