var // Constantes
  COLS = 26,
  ROWS = 26,
  EMPTY = 0,
  SNAKE = 1,
  FRUIT = 2,
  LEFT = 0,
  UP = 1,
  RIGHT = 2,
  DOWN = 3,
  KEY_LEFT = 37,
  KEY_UP = 38,
  KEY_RIGHT = 39,
  KEY_DOWN = 40,
  // Objetos do jogo
  canvas /* HTMLCanvas */,
  ctx /* CanvasRenderingContext2d */,
  keystate /* Objeto, usado para teclados */,
  frames /* Número, usado na animação  */,
  score; /* Número, para acopanhar a pontuação */
/**
 * Grid datastructor, útil em jogos onde o mundo do jogo é confinado em pedaços de dados ou informações de tamanho absoluto.
 *
 * @type {Object}
 */
grid = {
  width: null /* Número de colunas */,
  height: null /* Número de linhas */,
  _grid: null /* Grid */,
  /**
   * Iniciando o preenchimento de uma grade c x r com o valor de d
   * @param  {any}    d default value to fill with
   * @param  {number} c número de colunas
   * @param  {number} r número de linhas
   */
  init: function (d, c, r) {
    this.width = c;
    this.height = r;
    this._grid = [];
    for (var x = 0; x < c; x++) {
      this._grid.push([]);
      for (var y = 0; y < r; y++) {
        this._grid[x].push(d);
      }
    }
  },
  /**
   * Definir o valor da célula do grid em (x, y)
   *
   * @param {any}    Valor para setar
   * @param {number} x   Coordenada X
   * @param {number} y   Coordenada Y
   */
  set: function (val, x, y) {
    this._grid[x][y] = val;
  },
  /**
   * Obtém o valor da célula em (x, y)
   *
   * @param  {number} Coordenada X
   * @param  {number} Coordenada Y
   * @return {any}   Valor da célula
   */
  get: function (x, y) {
    return this._grid[x][y];
  },
};
/**
 * A cobra, funciona como uma fila (FIFO, primeiro no primeiro out) de dados com todas as posições atuais na grade com o id da cobra
 *
 * @type {Object}
 */
snake = {
  direction: null /* Direção */,
  last: null /* Ponteiro com última posição */,
  _queue: null /* Array<number>, representação */,
  /**
   * Limpa a fila e define a posição inicial e a direção
   *
   * @param  {number} d Inicia a direção
   * @param  {number} x Inicia coordenada X
   * @param  {number} y Inicia coordenada Y
   */
  init: function (d, x, y) {
    this.direction = d;
    this._queue = [];
    this.insert(x, y);
  },
  /**
   * Adiciona um elemento à fila
   *
   * @param  {number} x coordenada X
   * @param  {number} y coordenada Y
   */
  insert: function (x, y) {
    // unshift prefixa um elemento a um array
    this._queue.unshift({ x: x, y: y });
    this.last = this._queue[0];
  },
  /**
   * Remove e retorna o primeiro elemento na fila.
   *
   * @return {Object} o primeiro elemento
   */
  remove: function () {
    // retorna o último elemento de um array
    return this._queue.pop();
  },
};
/**
 * Definir um ID de comida em uma célula livre aleatória no grid
 */
function setFood() {
  var empty = [];

  // iterar pelo grid e encontrar todas as células vazias
  for (var x = 0; x < grid.width; x++) {
    for (var y = 0; y < grid.height; y++) {
      if (grid.get(x, y) === EMPTY) {
        empty.push({ x: x, y: y });
      }
    }
  }
  // Escolher célula randômica
  var randpos = empty[Math.round(Math.random() * (empty.length - 1))];
  grid.set(FRUIT, randpos.x, randpos.y);
}
/**
 * Inicia o jogo
 */
function main() {
  // Cria e inicia o elemento canvas
  canvas = document.createElement("canvas");
  canvas.width = COLS * 18;
  canvas.height = ROWS * 18;
  ctx = canvas.getContext("2d");

  // Adiciona o canvas no body
  document.getElementById("game-board").appendChild(canvas);

  // Escolher uma fonte para mostrar a pontuação
  ctx.font = "12px 'Press Start 2P', cursive";
  frames = 0;
  keystate = {};

  // Pega o comando do teclado
  document.addEventListener("keydown", function (evt) {
    keystate[evt.keyCode] = true;
  });
  document.addEventListener("keyup", function (evt) {
    delete keystate[evt.keyCode];
  });

  // Inicializa os objetos e faz uma repetição
  init();
  loop();
}
/**
 * Reseta os objetos do jogo
 */
function init() {
  score = 0;
  grid.init(EMPTY, COLS, ROWS);
  var sp = { x: Math.floor(COLS / 2), y: ROWS - 1 };
  snake.init(UP, sp.x, sp.y);
  grid.set(SNAKE, sp.x, sp.y);
  setFood();
}
/**
 * Renderiza o jogo
 */
function loop() {
  update();
  draw();

  // Redesenha o canvas
  window.requestAnimationFrame(loop, canvas);
}
/**
 * Updates the game logic
 */
function update() {
  frames++;

  // Mudando a direção da cobra de acordo com o comando do teclado
  if (keystate[KEY_LEFT] && snake.direction !== RIGHT) {
    snake.direction = LEFT;
  }
  if (keystate[KEY_UP] && snake.direction !== DOWN) {
    snake.direction = UP;
  }
  if (keystate[KEY_RIGHT] && snake.direction !== LEFT) {
    snake.direction = RIGHT;
  }
  if (keystate[KEY_DOWN] && snake.direction !== UP) {
    snake.direction = DOWN;
  }

  // A cada vinte quadros, atualiza o estado do jogo
  if (frames % 20 === 0) {
    // Último elemento da cobra
    var nx = snake.last.x;
    var ny = snake.last.y;

    // Atualiza a posição dependendo da direção da cobra
    switch (snake.direction) {
      case LEFT:
        nx--;
        break;
      case UP:
        ny--;
        break;
      case RIGHT:
        nx++;
        break;
      case DOWN:
        ny++;
        break;
    }

    // Checa as condições de perda do jogo
    if (
      0 > nx ||
      nx > grid.width - 1 ||
      0 > ny ||
      ny > grid.height - 1 ||
      grid.get(nx, ny) === SNAKE
    ) {
      return init();
    }

    // Verifique se a nova posição está no item de fruta
    if (grid.get(nx, ny) === FRUIT) {
      // Incrementa a pontuação e seta uma nova posição da fruta
      score++;
      setFood();
    } else {
      // Remove a cauda da cobra e adiciona o ID no grid
      var tail = snake.remove();
      grid.set(EMPTY, tail.x, tail.y);
    }

    // Adicionar o ID da cobra numa nova posição adicionando-o na fila
    grid.set(SNAKE, nx, ny);
    snake.insert(nx, ny);
  }
}
/**
 * Renderiza o grid no canvas
 */
function draw() {
  // Calcula -width and -height
  var tw = canvas.width / grid.width;
  var th = canvas.height / grid.height;

  // Limpa o canvas
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Iterar pela grade e desenhar todas as células
  for (var x = 0; x < grid.width; x++) {
    for (var y = 0; y < grid.height; y++) {
      // Define o estilo de preenchimento dependendo do id de cada célula
      switch (grid.get(x, y)) {
        case EMPTY:
          continue;
        case SNAKE:
          ctx.fillStyle = "#0f0";
          ctx.shadowBlur = 10;
          ctx.shadowColor = "#0f0";
          break;
        case FRUIT:
          ctx.fillStyle = "#f0f";
          ctx.shadowBlur = 10;
          ctx.shadowColor = "#f0f";
          break;
      }
      ctx.fillRect(x * tw + 1, y * th + 1, tw - 2, th - 2);
      ctx.shadowBlur = 0;
    }
  }

  // Muda o estilo de preenchimento mais uma vez e desenha a mensagem de pontuação para a tela
  ctx.fillStyle = "#fff";
  ctx.fillText("SCORE: " + score, 10, canvas.height - 10);
}

// Inicializa o jogo
main();
