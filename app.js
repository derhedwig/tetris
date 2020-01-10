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
    var rows = 0
    for (var i = 0; i < 16; i++) {
      if (this.grid[i].every(Boolean)) {
        rows++
        for (var k = i; k > 1; k--) {
          this.grid[k] = this.grid[k - 1];
        }
      }
    }
    return rows
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


class Player {
  constructor(grid) {
    this.grid = grid
    this.y = 0
    this.tetronimoIndex = Math.floor(Math.random() * tetronimos.length)
    this.matrix = tetronimos[this.tetronimoIndex]
    this.x = Math.floor(Math.random() * (grid.cols - this.matrix[0].length + 1))
    this.draw()
  }

  gridCollision(x, y) {
    for (var i = 0; i < this.matrix.length; i++) {
      for (var j = 0; j < this.matrix[i].length; j++) {
        if (this.matrix[i][j] !== 0 && this.grid.getCell(j + this.x + x, i + this.y + y) !== 0) {
          return true
        }
      }
    }
  }

  moveLeft() {
    if (this.x > 0 && !this.gridCollision(-1, 0)) {
      this.x--
      this.draw()
      return true
    }
    return false
  }

  moveRight() {
    if (this.x + this.matrix[0].length < this.grid.cols && !this.gridCollision(1, 0)) {
      this.x++
      this.draw()
      return true
    }
    return false
  }

  moveDown() {
    if (this.y + this.matrix.length < this.grid.rows && !this.gridCollision(0, 1)) {
      this.y++
      this.draw()
      return true
    }
    return false
  }

  rotate() {
    var tmpMatrix = this.matrix[0].map((val, index) => this.matrix.map(row => row[index]).reverse())
    for (var i = 0; i < tmpMatrix.length; i++) {
      for (var j = 0; j < tmpMatrix[i].length; j++) {
        if (tmpMatrix[i][j] !== 0 && this.grid.getCell(j + this.x, i + this.y) !== 0) {
          return false
        }
      }
    }
    this.matrix = tmpMatrix
    this.draw()
    return true
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


class Game {
  constructor() {
    this.paused = false
    this.pace = 500
    this.timer = 0
    this.rows = 0
    this.grid = new Grid()
    this.player = new Player(this.grid)
    this.registerHandlers()
  }

  registerHandlers() {
    var that = this
    // Keyboard Handlers
    document.addEventListener('keydown', function (event) {
      if (event.key === 'p') {
        that.pause = !that.pause
      }

      if (that.pause) return

      if (event.key === 'ArrowLeft') {
        that.player.moveLeft()
      }
      if (event.key === 'ArrowRight') {
        that.player.moveRight()
      }
      if (event.key === 'ArrowDown') {
        that.advancePlayer()
      }
      if (event.key === 'ArrowUp') {
        that.player.rotate()
      }
    })

    // Button Handlers
    buttonLeft.addEventListener('click', function () {
      that.player.moveLeft()
    })
    buttonRight.addEventListener('click', function () {
      that.player.moveRight()
    })
    buttonDown.addEventListener('click', function () {
      that.advancePlayer()
    })
    buttonUp.addEventListener('click', function () {
      that.player.rotate()
    })
  }

  start() {
    requestAnimationFrame(() => this.loop())
  }

  increaseRows(amount) {
    this.rows += amount
    scoreRowsDiv.innerHTML = this.rows
  }

  advancePlayer() {
    if (this.player.moveDown()) return

    // copy player to grid
    for (var i = 0; i < this.player.matrix.length; i++) {
      for (var j = 0; j < this.player.matrix[i].length; j++) {
        if (this.player.matrix[i][j] !== 0) {
          this.grid.setCell(j + this.player.x, i + this.player.y, this.player.tetronimoIndex + 1)
        }
      }
    }
    // check for full rows
    this.increaseRows(this.grid.checkFullRows())
    this.grid.draw()
    this.player = new Player(this.grid)
  }

  loop(time) {
    if (!this.pause && time - this.timer > this.pace) {
      this.timer = time
      this.advancePlayer()
      if (this.grid.checkGameOver()) {
        pause = true
      }
      this.grid.draw()
    }
    requestAnimationFrame(time => this.loop(time))
  }
}

var game = new Game()
game.start()