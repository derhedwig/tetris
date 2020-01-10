var svgns = "http://www.w3.org/2000/svg";

function drawRect(x, y, color) {
  var rect = document.createElementNS(svgns, 'rect')
  rect.setAttribute("x", x)
  rect.setAttribute("y", y)
  rect.setAttribute("width", 1)
  rect.setAttribute("height", 1)
  rect.setAttribute("fill", color)
  return rect
}



// Keyboard Handlers
document.addEventListener('keydown', function (event) {
  if (event.key === 'ArrowLeft') {
    player.moveLeft()
  }
  if (event.key === 'ArrowRight') {
    player.moveRight()
  }
  if (event.key === 'ArrowDown') {
    player.moveDown()
  }
  if (event.key === 'ArrowUp') {
    player.rotate()
  }
  if (event.key === 'p') {
    pause = !pause
  }
})

// Button Handlers
buttonLeft.addEventListener('click', function () {
  player.moveLeft()
})
buttonRight.addEventListener('click', function () {
  player.moveRight()
})
buttonDown.addEventListener('click', function () {
  player.moveDown()
})
buttonUp.addEventListener('click', function () {
  player.rotate()
})


// The Tetrominos
var I = [[1, 1, 1, 1]]
var J = [
  [1, 0, 0],
  [1, 1, 1]
]
var L = [
  [0, 0, 1],
  [1, 1, 1]
]
var O = [
  [1, 1],
  [1, 1]
]
var S = [
  [0, 1, 1],
  [1, 1, 0]
]
var T = [
  [0, 1, 0],
  [1, 1, 1]
]
var Z = [
  [1, 1, 0],
  [0, 1, 1]
]
var tetronimos = [I, J, L, O, S, T, Z]
var tetronimoColors = ['teal', 'blue', 'orange', 'yellow', 'green', 'purple', 'red']


class Grid {
  constructor(rows = 16, cols = 10) {
    this.rows = rows
    this.cols = cols
    this.grid = Array(rows).fill().map(() => Array(cols).fill(0));
  }

  undraw() {
    document.querySelectorAll('rect.fallen').forEach(gridItem => playground.removeChild(gridItem))
  }

  getCell(x, y) {
    if (y < this.rows && x < this.cols) {
      return this.grid[y][x]
    }
  }

  setCell(x, y, value) {
    this.grid[y][x] = value
  }

  getRow(y) {
    return this.grid[y]
  }

  checkFullRows() {
    for (var i = 0; i < 16; i++) {
      if (this.grid[i].every(Boolean)) {
        scoreRows++
        scoreRowsDiv.innerHTML = scoreRows
        for (var k = i; k > 1; k--) {
          this.grid[k] = this.grid[k - 1];
        }
      }
    }
  }

  checkGameOver() {
    if (this.getRow(0).some(Boolean)) {
      alert("GAME OVER")
      return true
    }
    return false
  }

  draw() {
    this.undraw()
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.cols; j++) {
        if (this.grid[i][j] !== 0) {
          var color = tetronimoColors[this.grid[i][j] - 1]
          var rect = drawRect(j, i, color)
          rect.classList.add("fallen")
          playground.appendChild(rect)
        }
      }
    }
  }
}

var grid = new Grid()


class Player {
  constructor() {
    this.y = 0
    this.tetronimoIndex = Math.floor(Math.random() * tetronimos.length)
    this.matrix = tetronimos[this.tetronimoIndex]
    this.x = Math.floor(Math.random() * (grid.cols - this.matrix[0].length + 1))
    this.draw()
  }

  gridCollision(x, y) {
    for (var i = 0; i < this.matrix.length; i++) {
      for (var j = 0; j < this.matrix[i].length; j++) {
        if (this.matrix[i][j] !== 0 && grid.getCell(j + this.x + x, i + this.y + y) !== 0) {
          return true
        }
      }
    }
  }

  moveLeft() {
    if (pause) return
    if (this.x > 0 && !this.gridCollision(-1, 0)) {
      this.x--
      this.draw()
    }
  }

  moveRight() {
    if (pause) return
    if (this.x + this.matrix[0].length < grid.cols && !this.gridCollision(1, 0)) {
      this.x++
      this.draw()
    }
  }

  moveDown() {
    if (pause) return
    if (this.y + this.matrix.length < grid.rows && !this.gridCollision(0, 1)) {
      this.y++
      this.draw()
      return
    }
    // copy player to grid
    for (var i = 0; i < this.matrix.length; i++) {
      for (var j = 0; j < this.matrix[i].length; j++) {
        if (this.matrix[i][j] !== 0) {
          grid.setCell(j + this.x, i + this.y, this.tetronimoIndex + 1)
        }
      }
    }
    // check for full rows
    grid.checkFullRows()
    grid.draw()
    player = new Player()
  }

  rotate() {
    if (pause) return
    var tmpMatrix = this.matrix[0].map((val, index) => this.matrix.map(row => row[index]).reverse())
    for (var i = 0; i < tmpMatrix.length; i++) {
      for (var j = 0; j < tmpMatrix[i].length; j++) {
        if (tmpMatrix[i][j] !== 0 && grid.getCell(j + this.x, i + this.y) !== 0) {
          return
        }
      }
    }
    this.matrix = tmpMatrix
    this.draw()
  }

  undraw() {
    var oldPlayer = document.querySelector("#domPlayer")
    if (oldPlayer) {
      playground.removeChild(oldPlayer)
    }
  }

  draw() {
    this.undraw()
    var domPlayer = document.createElementNS(svgns, 'g')
    domPlayer.id = "domPlayer"
    playground.appendChild(domPlayer)
    var playerColor = tetronimoColors[this.tetronimoIndex]
    for (var i = 0; i < this.matrix.length; i++) {
      for (var j = 0; j < this.matrix[i].length; j++) {
        if (this.matrix[i][j] === 1) {
          domPlayer.appendChild(drawRect(j + this.x, i + this.y, playerColor))
        }
      }
    }
  }

}

var player = new Player()


function drawNext() {
  document.querySelectorAll("#next rect").forEach(function (rect) {
    next.removeChild(rect)
  })
  var nextPlayerMatrix = tetronimos[nextPlayerTetronimoIndex]
  var color = tetronimoColors[nextPlayerTetronimoIndex]

  for (var i = 0; i < nextPlayerMatrix.length; i++) {
    for (var j = 0; j < nextPlayerMatrix[i].length; j++) {
      if (nextPlayerMatrix[i][j] === 1) {
        next.appendChild(drawRect(j, i, color))
      }
    }
  }
}


var scoreRows = 0
var pause = false

// main loop
var timer = 0
var step = 500
function draw(time) {
  if (!pause && time - timer > step) {
    timer = time
    player.moveDown()
    if (grid.checkGameOver()) {
      pause = true
    }
    grid.draw()
  }
  requestAnimationFrame(draw)
}
requestAnimationFrame(draw)
player.draw()