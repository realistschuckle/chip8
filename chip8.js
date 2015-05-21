(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define('chip8', [], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.chip8 = factory();
  }
}(this, function () {
  function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }

  function Emulator() {
    this._buffer = new ArrayBuffer(0x1000);
    this._memory = new Uint8Array(this._buffer);
    this._program = new Uint8Array(this._buffer, 0x200, 0xCA0);
    this._inst = 0;
    this._registers = new Uint8Array(new ArrayBuffer(0x10));
    this._keys = 0;
    this._i = 0;
    this._delayTimer = 0;
    this._soundTimer = 0;
    this._stack = [];
    this.quitOn0000 = false;
    this.running = false;
  }

  Emulator.prototype.keydown = function (key) {
    this._keys |= 1 << key;
    if (this._waitingForKey) {
      var index = this._waitingForKey - 1;
      this._waitingForKey = false;
      this._registers[index] = key;
      window.setTimeout(this._loop.bind(this), 2);
    }
  };

  Emulator.prototype.keyup = function (key) {
    this._keys &= (0xFFFF ^ (1 << key));
  };

  Emulator.prototype.v = function (index) {
    return this._registers[index];
  };

  Emulator.prototype.memory = function (from, to) {
    return this._memory.slice(from, from + to);
  };

  Emulator.prototype.load = function (program) {
// for (var i = 0; i < program.length; i += 2) {
//   console.log(program[i].toString(16) + program[i + 1].toString(16));
// }
    this._program.set(program);
  };

  Emulator.prototype.run = function () {
    this.running = true;

    var timerCountDown = function () {
      if (this._delayTimer > 0) {
        this._delayTimer -= 1;
      }
      if (this._soundTimer > 0) {
        this._soundTimer -= 1;
      }

      window.requestAnimationFrame(timerCountDown.bind(this));
    };
    window.requestAnimationFrame(timerCountDown.bind(this));

    var loop = this._loop = function () {
      var h = 0;
      var l = 0;

      h = this._program[this._inst];
      l = this._program[this._inst + 1];
      if (this._inst > this._program.length) {
        return this.running = false;
      } else if (h === 0 && l === 0 && this.quitOn0000) {
        return this.running = false;
      } else if (h === 0 && l === 0xEE) {
        this._inst = this._stack.pop();
        return window.setTimeout(loop.bind(this), 2);
      } else if (h >= 0x10 && h < 0x20) {
        this._inst = ((h & 0xF) * 0x100 + l) - 0x200;
        return window.setTimeout(loop.bind(this), 2)
      } else if (h >= 0x20 && h < 0x30) {
        this._stack.push(this._inst + 2);
        this._inst = ((h & 0xF) * 0x100 + l) - 0x200;
        return window.setTimeout(loop.bind(this), 2)
      } else if (h >= 0x30 && h < 0x40) {
        var skip = this._registers[h % 0x30] !== l;
        if (skip) {
          this._inst += 2;
        }
      } else if (h >= 0x40 && h < 0x50) {
        var skip = this._registers[h % 0x40] !== l;
        if (skip) {
          this._inst += 2;
        }
      } else if (h >= 0x50 && h < 0x60 && (l & 0x1) === 0) {
        var skip = this._registers[h % 0x50] === this._registers[l / 0x10];
        if (skip) {
          this._inst += 2;
        }
      } else if (h >= 0x60 && h < 0x70) {
        this._registers[h - 0x60] = l;
      } else if (h >= 0x70 && h < 0x80) {
        this._registers[h - 0x70] += l;
        this._registers[h - 0x70] %= 0x100;
      } else if (h >= 0x80 && h < 0x90 && (l & 0xE) === 0xE) {
        this._registers[0xF] = this._registers[h - 0x80] & 0x80;
        var result = (this._registers[h - 0x80] << 1) & 0xFF;
        this._registers[h - 0x80] = result;
      } else if (h >= 0x80 && h < 0x90 && (l & 0x7) === 0x7) {
        var diff = this._registers[(l - 0x7) / 0x10] - this._registers[h - 0x80];
        this._registers[h - 0x80] = (diff + 0xFF) % 0xFF;
        this._registers[0xF] = diff >= 0? 1 : 0;
      } else if (h >= 0x80 && h < 0x90 && (l & 0x6) === 0x6) {
        this._registers[0xF] = this._registers[h - 0x80] & 0x1;
        this._registers[h - 0x80] >>= 1;
      } else if (h >= 0x80 && h < 0x90 && (l & 0x5) === 0x5) {
        var diff = this._registers[h - 0x80] - this._registers[(l - 0x5) / 0x10];
        this._registers[h - 0x80] = (diff + 0xFF) % 0xFF;
        this._registers[0xF] = diff >= 0? 1 : 0;
      } else if (h >= 0x80 && h < 0x90 && (l & 0x4) === 0x4) {
        var sum = this._registers[h - 0x80] + this._registers[(l - 0x4) / 0x10];
        this._registers[h - 0x80] = sum & 0xFF;
        this._registers[0xF] = sum > 0xFF? 1 : 0;
      } else if (h >= 0x80 && h < 0x90 && (l & 0x3) === 0x3) {
        this._registers[h - 0x80] ^= this._registers[(l - 0x3) / 0x10];
      } else if (h >= 0x80 && h < 0x90 && (l & 0x2) === 0x2) {
        this._registers[h - 0x80] &= this._registers[(l - 0x2) / 0x10];
      } else if (h >= 0x80 && h < 0x90 && (l & 0x1) === 0x1) {
        this._registers[h - 0x80] |= this._registers[(l - 0x1) / 0x10];
      } else if (h >= 0x80 && h < 0x90 && (l & 0x1) === 0) {
        this._registers[h - 0x80] = this._registers[l / 0x10];
      } else if (h >= 0x90 && h < 0xA0 && (l & 0x1) === 0) {
        var skip = this._registers[h % 0x90] !== this._registers[l / 0x10];
        if (skip) {
          this._inst += 2;
        }
      } else if (h >= 0xA0 && h < 0xB0) {
        this._i = (h & 0xF) * 0x100 + l;
      } else if (h >= 0xB0 && h < 0xC0) {
        var address = (h & 0xF) * 0x100 + l + this._registers[0] - 0x200;
        this._inst = address;
        return window.setTimeout(loop.bind(this), 2);
      } else if (h >= 0xC0 && h < 0xD0) {
        this._registers[h & 0xF] = l & Math.floor(Math.random() * 0xFF);
      } else if (h >= 0xE0 && h <= 0xF0 && l == 0x9E) {
        if (this._keys & (1 << this._registers[h & 0xF])) {
          this._inst += 2;
        }
      } else if (h >= 0xE0 && h <= 0xF0 && l == 0xA1) {
        if ((this._keys & (1 << this._registers[h & 0xF])) === 0) {
          this._inst += 2;
        }
      } else if (h >= 0xF0 && h <= 0xFF && l == 0x07) {
        this._registers[h - 0xF0] = this._delayTimer;
      } else if (h >= 0xF0 && h <= 0xFF && l == 0x0A) {
        this._waitingForKey = (h & 0xF) + 1;
      } else if (h >= 0xF0 && h <= 0xFF && l == 0x15) {
        this._delayTimer = this._registers[h - 0xF0];
      } else if (h >= 0xF0 && h <= 0xFF && l == 0x18) {
        this._soundTimer = this._registers[h - 0xF0];
      } else if (h >= 0xF0 && h <= 0xFF && l == 0x1E) {
        this._i += this._registers[h - 0xF0];
      } else if (h >= 0xF0 && h <= 0xFF && l == 0x33) {
        var value = this._registers[h - 0xF0];
        this._memory[this._i] = Math.floor(value / 100);
        this._memory[this._i + 1] = Math.floor((value % 100) / 10);
        this._memory[this._i + 2] = value % 10;
      } else if (h >= 0xF0 && h <= 0xFF && l == 0x55) {
        this._memory.set(this._registers.slice(0, h - 0xF0 + 1), this._i);
      } else if (h >= 0xF0 && h <= 0xFF && l == 0x65) {
        this._registers.set(this._memory.slice(this._i, this._i + h - 0xF0 + 1));
      } else {
        var inst = pad(h.toString(16), 2) + pad(l.toString(16), 2);
        console.log('not a recognized instruction:', inst);
        throw new Error('unrecognized instruction: ' + inst);
      }

      this._inst += 2;

      if (!this._waitingForKey) {
        window.setTimeout(loop.bind(this), 2);
      }
    }

    window.setTimeout(loop.bind(this), 2);
  };

  Object.defineProperty(Emulator.prototype, 'i', {
    get: function () {
      return this._i;
    }
  });
  
  Object.defineProperty(Emulator.prototype, 'delay', {
    get: function () {
      return this._delayTimer;
    }
  });
  
  Object.defineProperty(Emulator.prototype, 'sound', {
    get: function () {
      return this._soundTimer;
    }
  });
  
  return {
    Emulator: Emulator
  };
}));
