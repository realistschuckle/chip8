var screen = document.getElementById('ascii-screen');
var message = document.getElementById('ascii-message');
var play = document.getElementById('play');

var program = new chip8x.Program();
program.clearScreen();
for (var i = 0; i < 0x10; i += 1) {
  program.setCharInto(i, 0);
  program.draw(0, 1, 2 + (i * 8) % 64, 9 + Math.floor(i / 8) * 8, 5);
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

function updateScreen() {
  if (emulator.dirty) {
    var gfx = emulator.gfx;
    var text = [];
    for (var y = 0; y < 32; y += 1) {
      var row = [];
      for (var x = 0; x < 64; x += 1) {
        row.push(gfx[y * 64 + x] > 0? '*' : ' ');
      }
      text.push(row.join(''));
    }
    screen.innerHTML = text.join('\n');
  }
  if (emulator.running) {
    window.setTimeout(updateScreen, 0);
  } else {
    message.innerHTML = 'GAME OVER!';
  }
}
