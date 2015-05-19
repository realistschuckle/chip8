(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define('chip8', [], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.chip8 = factory();
  }
}(this, function () {
  function Emulator() {
    this._buffer = new ArrayBuffer(0x1000);
    this._program = new Uint8Array(this._buffer, 0x200, 0xD00);
    this._inst = 0;
    this._registers = new Uint8Array(new ArrayBuffer(0x10));
  }

  Emulator.prototype.v = function (index) {
    return this._registers[index];
  };

  Emulator.prototype.stack = function (index) {
    return 0;
  };

  Emulator.prototype.load = function (program) {
// for (var i = 0; i < program.length; i += 2) {
//   console.log(program[i].toString(16) + program[i + 1].toString(16));
// }
    this._program.set(program);
  };

  Emulator.prototype.run = function () {
    var h = 0;
    var l = 0;

    while (true) {
      h = this._program[this._inst];
      l = this._program[this._inst + 1];

      if (h === 0 && l === 0) {
        break;
      } else if (h >= 0x60 && h < 0x70) {
        this._registers[h - 0x60] = l;
      } else if (h >= 0x70 && h < 0x80) {
        this._registers[h - 0x70] += l;
        this._registers[h - 0x70] %= 0x100;
      } else if (h >= 0x80 && h < 0x90 && (l & 0x6) === 0x6) {
        this._registers[0xF] = this._registers[h - 0x80] & 0x1;
        this._registers[h - 0x80] >>= 1;
      } else if (h >= 0x80 && h < 0x90 && (l & 0x5) === 0x5) {
        var diff = this._registers[h - 0x80] - this._registers[(l - 0x5) / 0x10];
        this._registers[h - 0x80] = (diff + 0xFF) % 0xFF;
        this._registers[0xF] = diff >= 0? 1 : 0;
      } else if (h >= 0x80 && h < 0x90 && (l & 0x4) === 0x4) {
        var sum = this._registers[h - 0x80] + this._registers[(l - 0x4) / 0x10];
        this._registers[h - 0x80] = sum % 0xFF;
        this._registers[0xF] = sum > 0xFF? 1 : 0;
      } else if (h >= 0x80 && h < 0x90 && (l & 0x3) === 0x3) {
        this._registers[h - 0x80] ^= this._registers[(l - 0x3) / 0x10];
      } else if (h >= 0x80 && h < 0x90 && (l & 0x2) === 0x2) {
        this._registers[h - 0x80] &= this._registers[(l - 0x2) / 0x10];
      } else if (h >= 0x80 && h < 0x90 && (l & 0x1) === 0x1) {
        this._registers[h - 0x80] |= this._registers[(l - 0x1) / 0x10];
      } else if (h >= 0x80 && h < 0x90 && (l & 0x1) === 0) {
        this._registers[h - 0x80] = this._registers[l / 0x10];
      }

      this._inst += 2;
    }
  };

  Object.defineProperty(Emulator.prototype, 'sp', {
    get: function () {
      return 0;
    }
  });
  
  Object.defineProperty(Emulator.prototype, 'gfx', {
    enumerable: true,
    get: function () {
      var buffer = new ArrayBuffer(8 * 4);
      return new Uint8Array(buffer);
    }
  });
  
  return {
    Emulator: Emulator
  };
}));