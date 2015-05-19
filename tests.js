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

QUnit.test('stack and stack pointer initialized to zero', function (assert) {
  var emulator = new chip8.Emulator();
  assert.equal(emulator.sp, 0);
  for (var i = 0; i < 16; i += 1) {
    assert.equal(emulator.stack(i), 0);
  }
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

QUnit.test('6XNN', function (assert) {
  var index = mkindex();
  var l = mkvalue();
  var emulator = new Program()
    .setRegister(index)
    .toValue(l)
    .run();

  for (var i = 0; i < 16; i += 1) {
    var actual = emulator.v(i);
    var expected = index === i? l : 0;
    assert.equal(actual, expected);
  }
});

QUnit.test('7XNN', function (assert) {
  var index = mkindex();
  var l1 = mkvalue();
  var l2 = mkvalue();

  var emulator = new Program()
    .setRegister(index)
    .toValue(l1)
    .toRegister(index)
    .addValue(l2)
    .run();

  for (var i = 0; i < 16; i += 1) {
    var actual = emulator.v(i);
    var expected = index === i? (l1 + l2) % 0x100 : 0;
    assert.equal(actual, expected);
  }
});

QUnit.test('8XY0', function (assert) {
  var index1 = mkindex();
  var index2 = mkindex();
  var l = mkvalue();

  var emulator = new Program()
    .setRegister(index1)
    .toValue(l)
    .setRegister(index2)
    .fromRegister(index1)
    .run();

  for (var i = 0; i < 16; i += 1) {
    var actual = emulator.v(i);
    var expected = (index1 === i || index2 === i)? l : 0;
    assert.equal(actual, expected);
  }
});

QUnit.test('8XY1', function (assert) {
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
});

QUnit.test('8XY2', function (assert) {
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
});

QUnit.test('8XY3', function (assert) {
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
});

QUnit.test('8XY4', function (assert) {
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

  for (var i = 0; i < 16; i += 1) {
    var actual = emulator.v(i);
    var expected = 0;
    if (index1 !== index2 && i === index2) {
      expected = l2;
    } else if (index1 !== index2 && i === index1) {
      expected = (l1 + l2) % 0xFF;
    } else if (index1 === index2 && i === index1) {
      expected = (l2 * 2) % 0xFF;
    } else if (i === 0xF) {
      expected = (l1 + l2) > 0xFF? 1 : 0;
    }
    assert.equal(actual, expected);
  }
});

QUnit.test('8XY5', function (assert) {
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
});

QUnit.test('8XY6', function (assert) {
  var index1 = mkindex();
  var l1 = mkvalue();

  var emulator = new Program()
    .setRegister(index1)
    .toValue(l1)
    .shiftRight(index1)
    .run();

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
});

QUnit.test('8XY7', function (assert) {
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
});

QUnit.test('8XYE', function (assert) {
  var index1 = mkindex();
  var l1 = mkvalue();

  var emulator = new Program()
    .setRegister(index1)
    .toValue(l1)
    .shiftLeft(index1)
    .run();

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
});

QUnit.test('9XY0 skips if different', function (assert) {
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
});


function mkindex() {
  return Math.floor(Math.random() * 0xF);
}

function mkvalue() {
  return Math.floor(Math.random() * 0x100);
}

function runProgram(program) {
  var emulator = new chip8.Emulator();
  emulator.load(program);
  emulator.run();
  return emulator;
}

function Program() {
  this.program = [];
}

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

