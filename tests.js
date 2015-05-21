QUnit.test('chip8 "namespace" exists', function (assert) {
  assert.ok(chip8);
});

QUnit.test('instantiable emulator exists', function (assert) {
  assert.ok(new chip8.Emulator());
});

QUnit.test('registers initialized to zero', function (assert) {
  var emulator = new chip8.Emulator();
  for (var i = 0; i < 16; i += 1) {
    assert.equal(emulator.v(i), 0);
  }
});

QUnit.test('address pointer initialized to zero', function (assert) {
  var emulator = new chip8.Emulator();
  assert.equal(emulator.i, 0);
});

QUnit.test('screen memory initialized to zero', function (assert) {
  var emulator = new chip8.Emulator();
  var pixels = emulator.gfx;
  for (var col = 0; col < 8; col += 1) {
    for (var row = 0; row < 4; row += 1) {
      assert.equal(pixels[col * row + row], 0);
    }
  }
});

QUnit.test('00EE returns from subroutine', function (assert) {
  var done = assert.async();
  var index1 = mkindex();
  var index2 = Math.floor(Math.random() * 16) + 5;
  var index3 = mkindex();
  var l1 = mkvalue();
  var l2 = mkvalue() + 1;

  while (index1 === index3) {
    index3 = mkindex();
  }

  if (index2 % 2) {
    index2 += 1;
  }

  var program = new Program()
    .call(0x200 + index2)
    .setRegister(index3)
    .toValue(l2);

  for (var i = 4; i < index2; i += 1) {
    program.noop();
  }

  var emulator = program
    .setRegister(index1)
    .toValue(l1)
    .exitSub()
    .run();

  emulator.waitForEmulatorToComplete(function () {
    for (var i = 0; i < 16; i += 1) {
      var actual = emulator.v(i);
      var message = undefined;
      var expected = 0;
      if (index1 === i) {
        expected = l1;
        message = 'First register at ' + index1 + ' ?= ' + l1;
      } else if (index3 === i) {
        expected = l2;
        message = 'Second register at ' + index3 + ' ?= ' + l2;
      }
      assert.equal(actual, expected, message);
    }
    done();
  });
});

QUnit.test('1NNN jumps to NNN', function (assert) {
  var done = assert.async();
  var index1 = mkindex();
  var index2 = Math.floor(Math.random() * 16) + 3;
  var l1 = mkvalue();

  var program = new Program()
    .jumpTo(0x200 + index2);

  for (var i = 2; i < index2; i += 1) {
    program.noop();
  }

  var emulator = program
    .setRegister(index1)
    .toValue(l1)
    .run();

  emulator.waitForEmulatorToComplete(function () {
    for (var i = 0; i < 16; i += 1) {
      var actual = emulator.v(i);
      var expected = 0;
      if (index1 === i) {
        expected = l1;
      }
      assert.equal(actual, expected);
    }
    done();
  });
});

QUnit.test('2NNN calls subroutine at NNN', function (assert) {
  var done = assert.async();
  var index1 = mkindex();
  var index2 = Math.floor(Math.random() * 16) + 3;
  var l1 = mkvalue();

  var program = new Program()
    .call(0x200 + index2);

  for (var i = 2; i < index2; i += 1) {
    program.noop();
  }

  var emulator = program
    .setRegister(index1)
    .toValue(l1)
    .run();

  emulator.waitForEmulatorToComplete(function () {
    for (var i = 0; i < 16; i += 1) {
      var actual = emulator.v(i);
      var expected = 0;
      if (index1 === i) {
        expected = l1;
      }
      assert.equal(actual, expected);
    }
    done();
  });
});

QUnit.test('3XKK does not skip if different', function (assert) {
  var done = assert.async();
  var index1 = mkindex();
  var index2 = (index1 + 1) % 0xF;
  var l1 = mkvalue();
  var l2 = (l1 + 1) & 0xFF;

  var emulator = new Program()
    .setRegister(index1)
    .toValue(l1)
    .skipIfEqual(index1, l2)
    .setRegister(index2)
    .toValue(l2)
    .run();

  emulator.waitForEmulatorToComplete(function () {
    for (var i = 0; i < 16; i += 1) {
      var actual = emulator.v(i);
      var expected = 0;
      if (index1 === i) {
        expected = l1;
      }
      assert.equal(actual, expected);
    }
    done();
  });
});

QUnit.test('3XKK skips if same', function (assert) {
  var done = assert.async();
  var index1 = mkindex();
  var index2 = (index1 + 1) % 0xF;
  var l1 = mkvalue();
  var l2 = (l1 + 1) & 0xFF;

  var emulator = new Program()
    .setRegister(index1)
    .toValue(l1)
    .skipIfEqual(index1, l1)
    .setRegister(index2)
    .toValue(l2)
    .run();

  emulator.waitForEmulatorToComplete(function () {
    for (var i = 0; i < 16; i += 1) {
      var actual = emulator.v(i);
      var expected = 0;
      if (index1 === i) {
        expected = l1;
      } else if (index2 === i) {
        expected = l2;
      }
      assert.equal(actual, expected);
    }
    done();
  });
});

QUnit.test('4XKK skips if different', function (assert) {
  var done = assert.async();
  var index1 = mkindex();
  var index2 = (index1 + 1) % 0xF;
  var l1 = mkvalue();
  var l2 = (l1 + 1) & 0xFF;

  var emulator = new Program()
    .setRegister(index1)
    .toValue(l1)
    .skipIfUnequal(index1, l2)
    .setRegister(index2)
    .toValue(l2)
    .run();

  emulator.waitForEmulatorToComplete(function () {
    for (var i = 0; i < 16; i += 1) {
      var actual = emulator.v(i);
      var expected = 0;
      if (index1 === i) {
        expected = l1;
      }
      assert.equal(actual, expected);
    }
    done();
  });
});

QUnit.test('4XKK does not skip if same', function (assert) {
  var done = assert.async();
  var index1 = mkindex();
  var index2 = (index1 + 1) % 0xF;
  var l1 = mkvalue();
  var l2 = (l1 + 1) & 0xFF;

  var emulator = new Program()
    .setRegister(index1)
    .toValue(l1)
    .skipIfUnequal(index1, l1)
    .setRegister(index2)
    .toValue(l2)
    .run();

  emulator.waitForEmulatorToComplete(function () {
    for (var i = 0; i < 16; i += 1) {
      var actual = emulator.v(i);
      var expected = 0;
      if (index1 === i) {
        expected = l1;
      } else if (index2 === i) {
        expected = l2;
      }
      assert.equal(actual, expected);
    }
    done();
  });
});

QUnit.test('5XY0 skips if same', function (assert) {
  var done = assert.async();
  var index1 = mkindex();
  var index2 = (index1 + 1) % 0xF;
  var l1 = mkvalue();
  var l2 = (l1 + 1) % 0xFF;

  var emulator = new Program()
    .setRegister(index1)
    .toValue(l1)
    .setRegister(index2)
    .toValue(l1)
    .skipIfSame(index1, index2)
    .setRegister(index1)
    .toValue(l2)
    .run();

  emulator.waitForEmulatorToComplete(function () {
    for (var i = 0; i < 16; i += 1) {
      var actual = emulator.v(i);
      var expected = 0;
      if (index1 === i) {
        expected = l1;
      } else if (index2 == i) {
        expected = l1;
      }
      assert.equal(actual, expected);
    }
    done();
  });
});

QUnit.test('5XY0 does not skip if different', function (assert) {
  var done = assert.async();
  var index1 = mkindex();
  var index2 = (index1 + 1) % 0xF;
  var l1 = mkvalue();
  var l2 = (l1 + 1) % 0xFF;

  var emulator = new Program()
    .setRegister(index1)
    .toValue(l1)
    .setRegister(index2)
    .toValue(l2)
    .skipIfSame(index1, index2)
    .setRegister(index1)
    .toValue(l2)
    .run();

  emulator.waitForEmulatorToComplete(function () {
    for (var i = 0; i < 16; i += 1) {
      var actual = emulator.v(i);
      var expected = 0;
      if (index1 === i) {
        expected = l2;
      } else if (index2 == i) {
        expected = l2;
      }
      assert.equal(actual, expected);
    }
    done();
  });
});

QUnit.test('6XNN', function (assert) {
  var done = assert.async();
  var index = mkindex();
  var l = mkvalue();
  var emulator = new Program()
    .setRegister(index)
    .toValue(l)
    .run();

  emulator.waitForEmulatorToComplete(function () {
    for (var i = 0; i < 16; i += 1) {
      var actual = emulator.v(i);
      var expected = index === i? l : 0;
      assert.equal(actual, expected);
    }
    done();
  });
});

QUnit.test('7XNN', function (assert) {
  var done = assert.async();
  var index = mkindex();
  var l1 = mkvalue();
  var l2 = mkvalue();

  var emulator = new Program()
    .setRegister(index)
    .toValue(l1)
    .toRegister(index)
    .addValue(l2)
    .run();

  emulator.waitForEmulatorToComplete(function () {
    for (var i = 0; i < 16; i += 1) {
      var actual = emulator.v(i);
      var expected = index === i? (l1 + l2) % 0x100 : 0;
      assert.equal(actual, expected);
    }
    done();
  });
});

QUnit.test('8XY0', function (assert) {
  var done = assert.async();
  var index1 = mkindex();
  var index2 = mkindex();
  var l = mkvalue();

  var emulator = new Program()
    .setRegister(index1)
    .toValue(l)
    .setRegister(index2)
    .fromRegister(index1)
    .run();

  emulator.waitForEmulatorToComplete(function () {
    for (var i = 0; i < 16; i += 1) {
      var actual = emulator.v(i);
      var expected = (index1 === i || index2 === i)? l : 0;
      assert.equal(actual, expected);
    }
    done();
  });
});

QUnit.test('8XY1', function (assert) {
  var done = assert.async();
  var index1 = mkindex();
  var index2 = mkindex();
  var l1 = mkvalue();
  var l2 = mkvalue();

  var emulator = new Program()
    .setRegister(index1)
    .toValue(l1)
    .setRegister(index2)
    .toValue(l2)
    .setRegister(index1)
    .or(index2)
    .run();

  emulator.waitForEmulatorToComplete(function () {
    for (var i = 0; i < 16; i += 1) {
      var actual = emulator.v(i);
      var expected = 0;
      if (i === index2) {
        expected = l2;
      } else if (i === index1) {
        expected = l2 | l1;
      }
      assert.equal(actual, expected);
    }
    done();
  });
});

QUnit.test('8XY2', function (assert) {
  var done = assert.async();
  var index1 = mkindex();
  var index2 = mkindex();
  var l1 = mkvalue();
  var l2 = mkvalue();

  var emulator = new Program()
    .setRegister(index1)
    .toValue(l1)
    .setRegister(index2)
    .toValue(l2)
    .setRegister(index1)
    .and(index2)
    .run();

  emulator.waitForEmulatorToComplete(function () {
    for (var i = 0; i < 16; i += 1) {
      var actual = emulator.v(i);
      var expected = 0;
      if (i === index2) {
        expected = l2;
      } else if (i === index1) {
        expected = l2 & l1;
      }
      assert.equal(actual, expected);
    }
    done();
  });
});

QUnit.test('8XY3', function (assert) {
  var done = assert.async();
  var index1 = mkindex();
  var index2 = mkindex();
  var l1 = mkvalue();
  var l2 = mkvalue();

  var emulator = new Program()
    .setRegister(index1)
    .toValue(l1)
    .setRegister(index2)
    .toValue(l2)
    .setRegister(index1)
    .xor(index2)
    .run();

  emulator.waitForEmulatorToComplete(function () {
    for (var i = 0; i < 16; i += 1) {
      var actual = emulator.v(i);
      var expected = 0;
      if (index1 !== index2 && i === index2) {
        expected = l2;
      } else if (index1 !== index2 && i === index1) {
        expected = l2 ^ l1;
      }
      assert.equal(actual, expected);
    }
    done();
  });
});

QUnit.test('8XY4', function (assert) {
  var done = assert.async();
  var index1 = mkindex();
  var index2 = mkindex();
  var l1 = mkvalue();
  var l2 = mkvalue();

  var emulator = new Program()
    .setRegister(index1)
    .toValue(l1)
    .setRegister(index2)
    .toValue(l2)
    .sumWithOverflow(index1, index2)
    .run();

  emulator.waitForEmulatorToComplete(function () {
    for (var i = 0; i < 16; i += 1) {
      var actual = emulator.v(i);
      var expected = 0;
      if (index1 !== index2 && i === index2) {
        expected = l2;
      } else if (index1 !== index2 && i === index1) {
        expected = (l1 + l2) & 0xFF;
      } else if (index1 === index2 && i === index1) {
        expected = (l2 * 2) & 0xFF;
      } else if (index1 !== index2 && i === 0xF) {
        expected = (l1 + l2) > 0xFF? 1 : 0;
      } else if (i === 0xF) {
        expected = (l2 * 2) > 0xFF? 1 : 0;
      }
      assert.equal(actual, expected);
    }
    done();
  });
});

QUnit.test('8XY5', function (assert) {
  var done = assert.async();
  var index1 = mkindex();
  var index2 = mkindex();
  var l1 = mkvalue();
  var l2 = mkvalue();

  var emulator = new Program()
    .setRegister(index1)
    .toValue(l1)
    .setRegister(index2)
    .toValue(l2)
    .subtractWithCarry(index1, index2)
    .run();

  emulator.waitForEmulatorToComplete(function () {
    for (var i = 0; i < 16; i += 1) {
      var actual = emulator.v(i);
      var expected = 0;
      if (index1 !== index2 && i === index2) {
        expected = l2;
      } else if (index1 !== index2 && i === index1) {
        expected = (l1 - l2 + 0xFF) % 0xFF;
      } else if (index1 !== index2 && i === 0xF) {
        expected = (l1 - l2) < 0? 0 : 1;
      } else if (index1 === index2 && i === 0xF) {
        expected = 1;
      }
      assert.equal(actual, expected);
    }
    done();
  });
});

QUnit.test('8XY6', function (assert) {
  var done = assert.async();
  var index1 = mkindex();
  var l1 = mkvalue();

  var emulator = new Program()
    .setRegister(index1)
    .toValue(l1)
    .shiftRight(index1)
    .run();

  emulator.waitForEmulatorToComplete(function () {
    for (var i = 0; i < 16; i += 1) {
      var actual = emulator.v(i);
      var expected = 0;
      if (index1 === i) {
        expected = l1 >> 1;
      } else if (i === 0xF) {
        expected = l1 & 0x1;
      }
      assert.equal(actual, expected);
    }
    done();
  });
});

QUnit.test('8XY7', function (assert) {
  var done = assert.async();
  var index1 = mkindex();
  var index2 = mkindex();
  var l1 = mkvalue();
  var l2 = mkvalue();

  var emulator = new Program()
    .setRegister(index1)
    .toValue(l1)
    .setRegister(index2)
    .toValue(l2)
    .reverseSubtractWithCarry(index1, index2)
    .run();

  emulator.waitForEmulatorToComplete(function () {
    for (var i = 0; i < 16; i += 1) {
      var actual = emulator.v(i);
      var expected = 0;
      if (index1 !== index2 && i === index2) {
        expected = l2;
      } else if (index1 !== index2 && i === index1) {
        expected = (l2 - l1 + 0xFF) % 0xFF;
      } else if (index1 !== index2 && i === 0xF) {
        expected = (l2 - l1) < 0? 0 : 1;
      } else if (index1 === index2 && i === 0xF) {
        expected = 1;
      }
      assert.equal(actual, expected);
    }
    done();
  });
});

QUnit.test('8XYE', function (assert) {
  var done = assert.async();
  var index1 = mkindex();
  var l1 = mkvalue();

  var emulator = new Program()
    .setRegister(index1)
    .toValue(l1)
    .shiftLeft(index1)
    .run();

  emulator.waitForEmulatorToComplete(function () {
    for (var i = 0; i < 16; i += 1) {
      var actual = emulator.v(i);
      var expected = 0;
      if (index1 === i) {
        expected = (l1 << 1) & 0xFF;
      } else if (i === 0xF) {
        expected = l1 & 0x80;
      }
      assert.equal(actual, expected);
    }
    done();
  });
});

QUnit.test('9XY0 skips if different', function (assert) {
  var done = assert.async();
  var index1 = mkindex();
  var index2 = (index1 + 1) % 0xF;
  var l1 = mkvalue();
  var l2 = (l1 + 1) % 0xFF;

  var emulator = new Program()
    .setRegister(index1)
    .toValue(l1)
    .setRegister(index2)
    .toValue(l2)
    .skipIfDifferent(index1, index2)
    .setRegister(index1)
    .toValue(l2)
    .run();

  emulator.waitForEmulatorToComplete(function () {
    for (var i = 0; i < 16; i += 1) {
      var actual = emulator.v(i);
      var expected = 0;
      if (index1 === i) {
        expected = l1;
      } else if (index2 == i) {
        expected = l2;
      }
      assert.equal(actual, expected);
    }
    done();
  });
});

QUnit.test('9XY0 does not skip if same', function (assert) {
  var done = assert.async();
  var index1 = mkindex();
  var index2 = (index1 + 1) % 0xF;
  var l1 = mkvalue();
  var l2 = (l1 + 1) % 0xFF;

  var emulator = new Program()
    .setRegister(index1)
    .toValue(l1)
    .setRegister(index2)
    .toValue(l1)
    .skipIfDifferent(index1, index2)
    .setRegister(index1)
    .toValue(l2)
    .run();

  emulator.waitForEmulatorToComplete(function () {
    for (var i = 0; i < 16; i += 1) {
      var actual = emulator.v(i);
      var expected = 0;
      if (index1 === i) {
        expected = l2;
      } else if (index2 == i) {
        expected = l1;
      }
      assert.equal(actual, expected);
    }
    done();
  });
});

QUnit.test('ANNN sets the index reigster', function (assert) {
  var done = assert.async();
  var l1 = mkbigvalue();

  var emulator = new Program()
    .setIndexRegister(l1)
    .run();

  emulator.waitForEmulatorToComplete(function () {
    assert.equal(emulator.i, l1);
    done();
  });
});

QUnit.test('BNNN jumps to NNN + V0', function (assert) {
  var done = assert.async();
  var index1 = mkindex();
  var index2 = Math.floor(Math.random() * 16) + 6;
  var l1 = mkvalue();

  while (index2 % 1 || index2 === index1) {
    index2 = (index2 + 1) % 0xF;
  }

  var program = new Program()
    .setRegister(0)
    .toValue(index1)
    .jumpToPlusV0(0x200 + index2);

  for (var i = 4; i < index1 + index2; i += 1) {
    program.noop();
  }

  var emulator = program
    .setRegister(index1)
    .toValue(l1)
    .run();

  emulator.waitForEmulatorToComplete(function () {
    for (var i = 1; i < 16; i += 1) {
      var actual = emulator.v(i);
      var expected = 0;
      if (index1 === i) {
        expected = l1;
      }
      assert.equal(actual, expected);
    }
    done();
  });
});

QUnit.test('FX1E adds VX to I', function (assert) {
  var done = assert.async();
  var index1 = mkindex();
  var l1 = mkvalue();
  var l2 = mkbigvalue();

  var emulator = new Program()
    .setRegister(index1)
    .toValue(l1)
    .setIndexRegister(l2)
    .addRegisterToIndexRegister(index1)
    .run();

  emulator.waitForEmulatorToComplete(function () {
    assert.equal(emulator.i, l1 + l2);
    done();
  });
});

QUnit.test('FX33 stores the BCD of VX in M(I)..M(I+2)', function (assert) {
  var done = assert.async();
  var index1 = mkindex();
  var l1 = mkvalue();
  var l2 = mkindex() + index1;
  var h = Math.floor(l1 / 100);
  var t = Math.floor((l1 % 100) / 10);
  var d = l1 % 10;

  var emulator = new Program()
    .setIndexRegister(l2)
    .setRegister(index1)
    .toValue(l1)
    .bcdFrom(index1)
    .run();

  emulator.waitForEmulatorToComplete(function () {
    var mem = emulator.memory(l2, l2 + 2);
    assert.equal(mem[0], h);
    assert.equal(mem[1], t);
    assert.equal(mem[2], d);
    done();
  });
});

QUnit.test('FX55 stores V0..VX in memory at M(I)', function (assert) {
  var done = assert.async();
  var index1 = mkindex();
  var l1 = Math.min(mkvalue(), 0xE0);
  var l2 = mkvalue();

  var program = new Program()
    .setIndexRegister(l2);

  for (var i = 0; i <= index1; i += 1) {
    program
      .setRegister(i)
      .toValue(l1 + i);
  }

  var emulator = program
    .copyToMemoryThrough(index1)
    .run();

  emulator.waitForEmulatorToComplete(function () {
    var mem = emulator.memory(l2, l2 + index1);
    for (var i = 0; i <= index1; i += 1) {
      assert.equal(mem[i], l1 + i);
    }
    done();
  });
});

QUnit.test('FX65 sets V0..VX from memory at M(I)', function (assert) {
  var done = assert.async();
  var index1 = mkindex();
  var l1 = mkvalue() + 0x10;
  var l2 = Math.min(mkvalue(), 0xE0);

  var program = new Program()
    .setIndexRegister(0x200 + l1)
    .copFromMemoryThrough(index1)
    .noop();

  for (var i = program.length; i < l1; i += 1) {
    program.noop();
  }

  for (var i = 0; i <= index1; i += 1) {
    program.noop(l2 + i)
  }

  var emulator = program.run();
  emulator.waitForEmulatorToComplete(function () {
    for (var i = 0; i < 16; i += 1) {
      var expected = 0;
      if (i <= index1) {
        expected = l2 + i;
      }
      assert.equal(emulator.v(i), expected);
    }
    done();
  });
});


chip8.Emulator.prototype.waitForEmulatorToComplete = function(callback) {
  function check() {
    if (this.running) {
      return setTimeout(check.bind(this), 1);
    }
    callback();
  }
  setTimeout(check.bind(this), 1);
}

function mkindex() {
  return Math.floor(Math.random() * 0xF);
}

function mkvalue() {
  return Math.floor(Math.random() * 0x100);
}

function mkbigvalue() {
  return Math.floor(Math.random() * 0x1000);
}

function runProgram(program) {
  var emulator = new chip8.Emulator();
  emulator.quitOn0000 = true;
  emulator.load(program);
  emulator.run();
  return emulator;
}

function Program() {
  this.program = [];
}

Object.defineProperty(Program.prototype, 'length', {
  get: function () {
    return this.program.length;
  }
});

Program.prototype.run = function () {
  return runProgram(this.program);
};

Program.prototype.setRegister = function (index) {
  this.program.push(0x60 + index);
  return this;
};

Program.prototype.toRegister = function (index) {
  this.program.push(0x70 + index);
  return this;
};

Program.prototype.fromRegister = function (index) {
  var l = this.program.length;
  this.program[l - 1] += 0x20;
  this.program.push(index * 0x10);
  return this;
};

Program.prototype.sumWithOverflow = function (index1, index2) {
  this.program.push(0x80 + index1);
  this.program.push(index2 * 0x10 + 0x4);
  return this;
};

Program.prototype.subtractWithCarry = function (index1, index2) {
  this.program.push(0x80 + index1);
  this.program.push(index2 * 0x10 + 0x5);
  return this;
};

Program.prototype.reverseSubtractWithCarry = function (index1, index2) {
  this.program.push(0x80 + index1);
  this.program.push(index2 * 0x10 + 0x7);
  return this;
};

Program.prototype.addValue = Program.prototype.toValue = function (value) {
  this.program.push(value)
  return this;
};

Program.prototype.or = function (value) {
  var l = this.program.length;
  this.program[l - 1] += 0x20;
  this.program.push(value * 0x10 + 0x1)
  return this;
};

Program.prototype.and = function (value) {
  var l = this.program.length;
  this.program[l - 1] += 0x20;
  this.program.push(value * 0x10 + 0x2)
  return this;
};

Program.prototype.xor = function (value) {
  var l = this.program.length;
  this.program[l - 1] += 0x20;
  this.program.push(value * 0x10 + 0x3)
  return this;
};

Program.prototype.shiftRight = function (index) {
  this.program.push(0x80 + index);
  this.program.push(mkindex() * 0x10 + 0x6);
  return this;
};

Program.prototype.shiftLeft = function (index) {
  this.program.push(0x80 + index);
  this.program.push(mkindex() * 0x10 + 0xE);
  return this;
};

Program.prototype.skipIfDifferent = function (index1, index2) {
  this.program.push(0x90 + index1);
  this.program.push(index2 * 0x10);
  return this;
};

Program.prototype.skipIfSame = function (index1, index2) {
  this.program.push(0x50 + index1);
  this.program.push(index2 * 0x10);
  return this;
};

Program.prototype.skipIfUnequal = function (index1, value) {
  this.program.push(0x40 + index1);
  this.program.push(value);
  return this;
};

Program.prototype.skipIfEqual = function (index1, value) {
  this.program.push(0x30 + index1);
  this.program.push(value);
  return this;
};

Program.prototype.setIndexRegister = function (value) {
  var value = 0xA000 + value;
  this.program.push(value >> 8);
  this.program.push(value & 0xFF);
  return this;
};

Program.prototype.addRegisterToIndexRegister = function (index) {
  this.program.push(0xF0 + index);
  this.program.push(0x1E);
  return this;
};

Program.prototype.copyToMemoryThrough = function (index) {
  this.program.push(0xF0 + index);
  this.program.push(0x55);
  return this;
};

Program.prototype.copFromMemoryThrough = function (index) {
  this.program.push(0xF0 + index);
  this.program.push(0x65);
  return this;
};

Program.prototype.noop = function (value) {
  value = value || 0;
  this.program.push(value);
  return this;
}

Program.prototype.bcdFrom = function (index) {
  this.program.push(0xF0 + index);
  this.program.push(0x33);
  return this;
};

Program.prototype.jumpTo = function (value) {
  value = 0x1000 + value;
  this.program.push(value >> 8);
  this.program.push(value & 0xFF);
  return this;
};

Program.prototype.call = function (address) {
  address = 0x2000 + address;
  this.program.push(address >> 8);
  this.program.push(address & 0xFF);
  return this;
};

Program.prototype.exitSub = function () {
  this.program.push(0);
  this.program.push(0xEE);
  return this;
};

Program.prototype.jumpToPlusV0 = function (address) {
  address = 0xB000 + address;
  this.program.push(address >> 8);
  this.program.push(address & 0xFF);
  return this;
}
