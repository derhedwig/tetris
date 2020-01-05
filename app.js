var timer = 0
var step = 500
var svgns = "http://www.w3.org/2000/svg";
var rows = 0


document.addEventListener('keydown', function (event) {
  if (event.key === 'ArrowLeft') {
    if (!checkCollisions(x = -1, y = 1)) {
      playerX--
      drawPlayer()
    }
  }

  if (event.key === 'ArrowRight') {
    if (!checkCollisions(x = 1, y = 1)) {
      playerX++
      drawPlayer()
    }
  }

  if (event.key === 'ArrowDown') {
    advancePlayer()
  }

  if (event.key === 'ArrowUp') {
    rotatePlayer()
  }
})


var touchX
var touchY

playground.addEventListener('touchstart', function (event) {
  touchX = event.changedTouches[0].pageX
  touchY = event.changedTouches[0].pageY
})

playground.addEventListener('touchmove', function (event) {
  event.preventDefault()
  var distX = event.changedTouches[0].pageX - touchX
  var distY = event.changedTouches[0].pageY - touchY
  if (Math.abs(distX) > Math.abs(distY)) {
    var clientRect = playground.getBoundingClientRect()
    var x = (event.changedTouches[0].pageX - clientRect.left) / clientRect.width * 10
    x = Math.floor(x)
    console.log(x)
    var oldPlayerX = playerX
    playerX = x
    if (checkCollisions(x = 0, y = 0)) {
      playerX = oldPlayerX
    }
    drawPlayer()
  }
})

playground.addEventListener('touchend', function (event) {
  event.preventDefault()
  var distX = event.changedTouches[0].pageX - touchX
  var distY = event.changedTouches[0].pageY - touchY
  if (Math.abs(distX) > Math.abs(distY)) {
    //
  } else {
    if (distY > 0) {
      advancePlayer()
    } else {
      rotatePlayer()
    }
  }
})


var I = [[1, 1, 1, 1]] // 1x4 -> 4x1 [[1], [1], [1], [1]]
var J = [
  [1, 0, 0],
  [1, 1, 1]
] // 2x3 -> 3x2 [[1, 1], [0, 1], [0, 1]]
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


var grid = []
function initGrid() {
  for (var i = 0; i < 16; i++) {
    grid[i] = []
    for (var j = 0; j < 10; j++) {
      grid[i][j] = 0
    }
  }
}
initGrid()


var playerX
var playerY
var player
var playerMatrix
var playerTetronimoIndex
var nextPlayerTetronimoIndex = Math.floor(Math.random() * tetronimos.length)

function initPlayer() {
  playerTetronimoIndex = nextPlayerTetronimoIndex
  nextPlayerTetronimoIndex = Math.floor(Math.random() * tetronimos.length)
  drawNext()
  playerMatrix = tetronimos[playerTetronimoIndex]
  playerY = 0
  playerX = Math.floor(Math.random() * tetronimos.length)
  while (checkCollisions(x = 1, y = 0)) {
    playerX = Math.floor(Math.random() * tetronimos.length)
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
        var rect = document.createElementNS(svgns, 'rect')
        rect.setAttribute("x", j)
        rect.setAttribute("y", i)
        rect.setAttribute("width", 1)
        rect.setAttribute("height", 1)
        rect.setAttribute("fill", color)
        next.appendChild(rect)
      }
    }
  }
}

function rotatePlayer() {
  // copy
  var matrix = JSON.parse(JSON.stringify(playerMatrix))
  // rotate
  matrix = matrix[0].map((val, index) => matrix.map(row => row[index]).reverse())
  // check for overlaps with grid
  for (var i = 0; i < matrix.length; i++) {
    for (var j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j] !== 0 && grid[i + playerY][j + playerX] !== 0) {
        return
      }
    }
  }
  // assign and draw
  playerMatrix = matrix
  drawPlayer()
}

function drawPlayer() {
  var oldPlayer = document.querySelector("#player")
  if (oldPlayer) {
    playground.removeChild(oldPlayer)

  }
  player = document.createElementNS(svgns, 'g')
  player.id = "player"
  playground.appendChild(player)
  var playerColor = tetronimoColors[playerTetronimoIndex]

  for (var i = 0; i < playerMatrix.length; i++) {
    for (var j = 0; j < playerMatrix[i].length; j++) {
      if (playerMatrix[i][j] === 1) {
        var rect = document.createElementNS(svgns, 'rect')
        rect.setAttribute("x", j + playerX)
        rect.setAttribute("y", i + playerY)
        rect.setAttribute("width", 1)
        rect.setAttribute("height", 1)
        rect.setAttribute("fill", playerColor)
        player.appendChild(rect)
      }
    }
  }
}

initPlayer()


function drawGrid() {
  document.querySelectorAll('.grid').forEach(function (gridItem) {
    playground.removeChild(gridItem)
  })
  for (var i = 0; i < 16; i++) {
    for (var j = 0; j < 10; j++) {
      if (grid[i][j] !== 0) {
        var color = tetronimoColors[grid[i][j] - 1]
        var rect = document.createElementNS(svgns, 'rect');
        rect.setAttribute("x", j)
        rect.setAttribute("y", i)
        rect.setAttribute("width", 1)
        rect.setAttribute("height", 1)
        rect.setAttribute("fill", color)
        rect.classList.add("grid")
        playground.appendChild(rect)
      }
    }
  }
}

drawGrid()


function checkCollisions(x = 0, y = 0) {
  for (var i = 0; i < playerMatrix.length; i++) {
    for (var j = 0; j < playerMatrix[i].length; j++) {
      if (playerMatrix[i][j] !== 0) {
        // with bottom
        if (y > 0) {
          if (playerY + i === 15) {
            return true
          }
        }
        // with right
        if (x > 0) {
          if (playerX + j === 9) {
            return true
          }
        }
        // with left
        if (x < 0) {
          if (playerX + j === 0) {
            return true
          }
        }
        // with grid
        if (grid[i + playerY + y][j + playerX + x] !== 0) {
          return true
        }
      }
    }
  }
  return false
}

function advancePlayer() {
  playerY++

  if (checkCollisions(x = 0, y = 1)) {
    // copy player to grid
    for (var i = 0; i < playerMatrix.length; i++) {
      for (var j = 0; j < playerMatrix[i].length; j++) {
        if (playerMatrix[i][j] !== 0) {
          grid[i + playerY][j + playerX] = playerTetronimoIndex + 1
        }
      }
    }

    // check for full rows
    for (var i = 0; i < 16; i++) {
      if (grid[i].every(Boolean)) {
        rows++
        rowsDiv.innerHTML = rows
        for (var k = i; k > 1; k--) {
          grid[k] = grid[k - 1];
        }
      }
    }

    drawGrid()
    initPlayer()
  }
  drawPlayer()
}

function draw(time) {
  if (time - timer > step) {
    timer = time
    advancePlayer()

    // check for gameover
    if (grid[1].some(Boolean)) {
      // alert("GAME OVER")
      window.location.reload()
      return
    }

    drawGrid()
  }
  requestAnimationFrame(draw)
}
requestAnimationFrame(draw)
