var screen = document.getElementById('ascii-screen');
var message = document.getElementById('ascii-message');
var play = document.getElementById('play');

var program = new chip8x.Program();
program.clearScreen();
program.setCharInto(0x0, 0);
for (var i = 0; i < 0x10; i += 1) {
  program.draw(0, 1, i * 4, 7, 1);
}
for (var i = 0; i < 0x10; i += 1) {
  program.setCharInto(i, 0);
  program.draw(0, 1, 2 + (i * 8) % 64, 9 + Math.floor(i / 8) * 8, 5);
}
for (var i = 0; i < 0x10; i += 1) {
  program.draw(0, 1, i * 4, 23, 1);
}
program.end();

var emulator = new chip8.Emulator();
emulator.load(program.bytes);

play.addEventListener('click', function () {
  message.innerHTML = '&nbsp;';
  emulator.reset();
  emulator.run();
  window.setTimeout(updateScreen, 0);
});

var texts = new Array(0x20);
for (var i = 0x00; i < 0x20; i += 1) {
  texts[i] = new Array(0x40);
}
var rowText = new Array(0x20);
function updateScreen() {
  if (emulator.dirty) {
    var gfx = emulator.gfx;
    for (var y = 0; y < 32; y += 1) {
      for (var x = 0; x < 64; x += 1) {
        texts[y][x] = gfx[y * 64 + x] > 0? '*' : ' ';
      }
      rowText[y] = texts[y].join('');
    }

    screen.innerHTML = rowText.join('\n');
  }
  if (emulator.running) {
    window.setTimeout(updateScreen, 0);
  } else {
    message.innerHTML = 'GAME OVER!';
  }
}
