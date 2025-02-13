import { Block, GridBlock } from './objects.js'

const canvas = document.getElementsByTagName('canvas')[0]
const ctx = canvas.getContext('2d') || new CanvasRenderingContext2D()
const gameWidth = canvas.width - 200
const gameHeight = canvas.height - 200
const tileStep = 25
const tilesX = gameWidth / tileStep
const tilesY = gameHeight / tileStep
const gameOffsetWidth = tileStep * 4
const gameOffsetHeight = tileStep * 2

let then = 0
let currentFPS = 0
let score = 0
let scorePlus = 0
let lines = 0
let timeElapsed = 0
let thenStepFPS = then + 1000
let thenStepGame = then + 800
let gameOver = false
let btnsTimer = 0

let block = new Block({ x: 0, y: 0 }, [], 'green', false)
/** @type {GridBlock[]} */
let gridBlocks = []
/** @type {Number[][]} */
let nextShape = []
/** @type {'green' | 'red' | 'yellow' | 'blue' | 'orange' | 'white'} */
let nextColor = 'green'
/** @type {Object.<string, boolean>} */
let keysDown = {}
/** @type {Number[]} */
let lineIndexes = []

/** 
 * @param {Number[][]} parts
 * @param {Boolean} isRot
 * @returns {Boolean} */
function isYBottCol(parts, isRot = false) {
  let yBottCol = false
  parts.forEach((row, rowIndex) => {
    row.forEach((part, colIndex) => {
      if (part == 1) {
        if (!yBottCol) {
          yBottCol = gridBlocks.some((gridBlock) => 
            (gridBlock.pos.x == block.pos.x + (tileStep * colIndex))
            && (gridBlock.pos.y == block.pos.y + (tileStep * rowIndex) + (isRot ? 0 : tileStep))
          ) || (block.pos.y + (tileStep * rowIndex) + (isRot ? 0 : tileStep) == gameHeight + gameOffsetHeight)
        }
      }
    })
  })
  return yBottCol
}

/** 
 * @param {Number[][]} parts
 * @param {Boolean} isRot
 * @returns {Boolean} */
function isXLeftCol(parts, isRot = false) {
  let xLeftCol = false
  parts.forEach((row, rowIndex) => {
    row.forEach((part, colIndex) => {
      if (part == 1) {
        if (!xLeftCol) {
          xLeftCol = gridBlocks.some((gridBlock) => 
            (gridBlock.pos.x == block.pos.x + (tileStep * colIndex) - (isRot ? 0 : tileStep))
            && (gridBlock.pos.y == block.pos.y + (tileStep * rowIndex))
          ) || (block.pos.x + (tileStep * colIndex) == (gameOffsetWidth - (isRot ? tileStep : 0)))
        }
      }
    })
  })
  return xLeftCol
}

/** 
 * @param {Number[][]} parts
 * @param {Boolean} isRot
 * @returns {Boolean} */
function isXRighCol(parts, isRot = false) {
  let xRighCol = false
  parts.forEach((row, rowIndex) => {
    row.forEach((part, colIndex) => {
      if (part == 1) {
        if (!xRighCol) {
          xRighCol = gridBlocks.some((gridBlock) => 
            (gridBlock.pos.x == block.pos.x + (tileStep * colIndex) + (isRot ? 0 : tileStep))
            && (gridBlock.pos.y == block.pos.y + (tileStep * rowIndex))
          ) || (block.pos.x + (tileStep * colIndex) + (isRot ? 0 : tileStep) == gameWidth + gameOffsetWidth)
        }
      }
    })
  })
  return xRighCol
}

function tryRotation() {
  /** @type {Number[][]} */
  let rotParts = []
  block.parts.forEach((row) => {
    row.forEach((part, colIndex) => {
      if (rotParts[colIndex]) {
        rotParts[colIndex].unshift(part)
      } else {
        rotParts.push([part])
      }
    })
  })
  if (!isYBottCol(rotParts, true) 
      && !isXLeftCol(rotParts, true) 
      && !isXRighCol(rotParts, true)) {
    block.parts = rotParts
  }
}

/** 
 * @param {Number} clientX 
 * @param {Number} clientY */
function handleButtons(clientX, clientY) {
  const rect = canvas.getBoundingClientRect()
  let x = Math.floor((clientX - rect.left) / (rect.right - rect.left) * canvas.width)
  let y = Math.floor((clientY - rect.top) / (rect.bottom - rect.top) * canvas.height)
  if (x > (gameOffsetWidth + tileStep)
    && x < (gameOffsetWidth + (tileStep * 5))
    && y > (gameOffsetHeight + gameHeight + tileStep)
    && y < (gameOffsetHeight + gameHeight + (tileStep * 5))) {
      keysDown['A'] = true
  } else if (x > (gameOffsetWidth + (tileStep * 10))
    && x < (gameOffsetWidth + (tileStep * 15))
    && y > (gameOffsetHeight + gameHeight + tileStep)
    && y < (gameOffsetHeight + gameHeight + (tileStep * 5))) {
      keysDown['D'] = true
  } else if (x > (gameOffsetWidth + (gameWidth / 2) - (tileStep / 2) - tileStep)
    && x < (gameOffsetWidth + (gameWidth / 2) - (tileStep / 2) - tileStep) + tileStep * 3
    && y > (gameOffsetHeight + gameHeight + tileStep)
    && y < (gameOffsetHeight + gameHeight + tileStep) + (tileStep * 2) - (tileStep / 4)) {
      keysDown['W'] = true
  } else if (x > (gameOffsetWidth + (gameWidth / 2) - (tileStep / 2) - tileStep)
    && x < (gameOffsetWidth + (gameWidth / 2) - (tileStep / 2) - tileStep) + tileStep * 3
    && y > (gameOffsetHeight + gameHeight + (tileStep * 3) + (tileStep / 4))
    && y < (gameOffsetHeight + gameHeight + (tileStep * 3) + (tileStep / 4)) + (tileStep * 2) - (tileStep / 4)) {
      keysDown['S'] = true
  }
  if (!btnsTimer) {
    btnsTimer = setInterval(() => handleButtons(clientX, clientY), 200)
  }
}

function nextRandShape() {
  const randShape = Math.floor(Math.random() * 10) + 1
  switch (randShape) {
    case 1: nextShape = [[0, 1, 0], [1, 1, 1]]
      break
    case 2: nextShape = [[1, 1, 1], [0, 1, 0]]
      break
    case 3: nextShape = [[1, 1, 1], [1, 0, 0]]
      break
    case 4: nextShape = [[0, 0, 1], [1, 1, 1]]
      break
    case 5: nextShape = [[1, 1, 0], [0, 1, 1]]
      break
    case 6: nextShape = [[1, 0], [1, 1], [0, 1]]
      break
    case 7: nextShape = [[1], [1], [1]]
      break
    case 8: nextShape = [[1, 1, 1]]
      break
    case 9: nextShape = [[0, 1, 0], [1, 1, 1], [0, 1, 0]]
      break
    case 10: nextShape = [[1, 1], [1, 1]]
      break
  }
}

function nextRandColor() {
  const randColor = Math.floor(Math.random() * 5) + 1
  switch (randColor) {
    case 1: nextColor = 'green'
      break
    case 2: nextColor = 'red'
      break
    case 3: nextColor = 'yellow'
      break
    case 4: nextColor = 'blue'
      break
    case 5: nextColor = 'orange'
      break
  }
}

function buildBlock() {
  const centerStartX = (((gameWidth - tileStep) / 2) - tileStep + gameOffsetWidth)
  const centerStartY = (gameOffsetHeight - (nextShape.length * tileStep))
  block.pos = { x: centerStartX, y: centerStartY }
  block.parts = nextShape
  block.color = nextColor
  block.active = true
  nextRandShape()
  nextRandColor()
}

function checkGameOver(linePlus = false) {
  let blocksOut = 0
  for (let i = (gridBlocks.length - scorePlus); i < gridBlocks.length; i++) {
    const gb = gridBlocks[i]
    const blockOut = (gb.pos.y < gameOffsetHeight)
    if (blockOut) {
      blocksOut++
      if (!gameOver) gameOver = true
    }
  }
  score += (scorePlus - blocksOut) + (linePlus ? (lineIndexes.length * tilesX) : 0)
  scorePlus = 0
}

/** @param {Boolean} fromEndBlock */
function checkLines(fromEndBlock) {
  if (fromEndBlock) {
    for (let rowIndex = 0; rowIndex < tilesY; rowIndex++) {
      let lineBlocksCount = 0
      for (let colIndex = 0; colIndex < tilesX; colIndex++) {
        if (gridBlocks.some((gb) => 
            (gb.pos.x == ((colIndex * tileStep) + gameOffsetWidth))
            && (gb.pos.y == ((rowIndex * tileStep) + gameOffsetHeight)))
          ) {
            lineBlocksCount++
          }
      }
      if (lineBlocksCount == tilesX) {
        lineIndexes.push(rowIndex)
      }
    }
    if (lineIndexes.length > 0) {
      lineIndexes.forEach((lineIndex) => {
        for (let colIndex = 0; colIndex < tilesX; colIndex++) {
          const gb = gridBlocks.find((gb) => 
            (gb.pos.x == ((colIndex * tileStep) + gameOffsetWidth))
            && (gb.pos.y == ((lineIndex * tileStep) + gameOffsetHeight)))
          if (gb) gb.color = 'white'
        }
      })
    } else {
      checkGameOver()
    }
  } else {
    if (lineIndexes.length > 0) {
      lineIndexes.forEach((lineIndex) => {
        for (let colIndex = 0; colIndex < tilesX; colIndex++) {
          let gbIndex = gridBlocks.findIndex((gb) => 
            (gb.pos.x == ((colIndex * tileStep) + gameOffsetWidth))
            && (gb.pos.y == ((lineIndex * tileStep) + gameOffsetHeight)))
          if (gbIndex > -1) {
            gridBlocks.splice(gbIndex, 1)
          }
        }
        gridBlocks.forEach((gb) => {
          if (gb.pos.y < ((lineIndex * tileStep) + gameOffsetHeight)) {
            gb.pos.y += tileStep
          }
        })
      })
      checkGameOver(true)
      lines += lineIndexes.length
      lineIndexes = []
    }
  }
}

/** @param {Number} nowTime */
function update(nowTime) {
  if (block.active) {
    if (keysDown['A'] || keysDown['ARROWLEFT']) {
      if (!isXLeftCol(block.parts)) block.pos.x -= tileStep
      keysDown['A'] = false
      keysDown['ARROWLEFT'] = false
    }
    if (keysDown['D'] || keysDown['ARROWRIGHT']) {
      if (!isXRighCol(block.parts)) block.pos.x += tileStep
      keysDown['D'] = false
      keysDown['ARROWRIGHT'] = false
    }
    if (keysDown['S'] || keysDown['ARROWDOWN']) {
      if (!isYBottCol(block.parts)) block.pos.y += tileStep
      keysDown['S'] = false
      keysDown['ARROWDOWN'] = false
    }
    if (keysDown['W'] || keysDown['ARROWUP']) {
      tryRotation()
      keysDown['W'] = false
      keysDown['ARROWUP'] = false
    }
    if (nowTime >= thenStepGame) {
      checkLines(false)
      let endBlock = false
      if (!isYBottCol(block.parts)) {
        block.pos.y += tileStep
      } else {
        endBlock = true
      }
      if (endBlock) {
        block.parts.forEach((row, rowIndex) => {
          row.forEach((part, colIndex) => {
            if (part == 1) {
              scorePlus++
              gridBlocks.push(new GridBlock(
                {
                  x: block.pos.x + (tileStep * colIndex), 
                  y: block.pos.y + (tileStep * rowIndex)
                },
                block.color
              ))
            }
          })
        })
        checkLines(true)
        block.active = false
      }
      thenStepGame = nowTime + 800
    }
  } else {
    if (!gameOver) buildBlock()
  }
}

function render() {
  // bg
  ctx.beginPath()
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  // grid
  ctx.beginPath()
  ctx.rect(gameOffsetWidth, gameOffsetHeight, gameWidth, gameHeight)
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.beginPath()
  for (let i = 1; i < tilesX; i++) {
    ctx.moveTo((i * tileStep) + gameOffsetWidth, gameOffsetHeight)
    ctx.lineTo((i * tileStep) + gameOffsetWidth, gameHeight + gameOffsetHeight)
  }
  for (let i = 1; i < tilesY; i++) {
    ctx.moveTo(gameOffsetWidth, (i * tileStep) + gameOffsetHeight)
    ctx.lineTo(gameWidth + gameOffsetWidth, (i * tileStep) + gameOffsetHeight)
  }
  ctx.strokeStyle = '#4d4d4d'
  ctx.lineWidth = 1
  ctx.stroke()
  // blocks
  gridBlocks.forEach((gridBlock) => {
    ctx.beginPath()
    ctx.rect(gridBlock.pos.x, gridBlock.pos.y, tileStep, tileStep)
    ctx.fillStyle = ((!gameOver) ? gridBlock.color : 'grey')
    ctx.fill()
  })
  // block
  ctx.beginPath()
  if (block.active) {
    block.parts.forEach((row, rowIndex) => {
      row.forEach((part, colIndex) => {
        if (part == 1) {
          ctx.rect(block.pos.x + (tileStep * colIndex) + 1, 
                  block.pos.y + (tileStep * rowIndex) + 1, 
                  tileStep - 2, tileStep - 2)
          ctx.fillStyle = block.color
          ctx.fill()
        }
      })
    })
  }
  // banner
  ctx.beginPath()
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, gameOffsetHeight)
  // title
  ctx.beginPath()
  ctx.font = 'bold 24px Verdana'
  ctx.fillStyle = 'white'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillText('TETRIS', canvas.width / 2, gameOffsetHeight / 2)
  // score
  ctx.beginPath()
  ctx.font = '18px Verdana'
  ctx.textBaseline = 'top'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#999999'
  ctx.fillText('SCORE', gameOffsetWidth / 2, gameOffsetHeight)
  ctx.fillStyle = 'white'
  ctx.fillText(score.toString(), gameOffsetWidth / 2, gameOffsetHeight + 18)
  // lines
  ctx.beginPath()
  ctx.font = '18px Verdana'
  ctx.textBaseline = 'top'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#999999'
  ctx.fillText('LINES', gameOffsetWidth / 2, gameOffsetHeight + 18 * 3)
  ctx.fillStyle = 'white'
  ctx.fillText(lines.toString(), gameOffsetWidth / 2, gameOffsetHeight + 18 * 4)
  // next
  ctx.beginPath()
  ctx.font = '18px Verdana'
  ctx.textBaseline = 'top'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#999999'
  ctx.fillText('NEXT', canvas.width - (gameOffsetWidth / 2), gameOffsetHeight)
  ctx.beginPath()
  ctx.lineWidth = 2
  ctx.strokeRect(gameOffsetWidth + gameWidth + (tileStep / 2), 
    gameOffsetHeight + 18, 
    tileStep * 3, tileStep * 3)
  if (!gameOver) {
    ctx.beginPath()
    ctx.lineWidth = 1
    nextShape.forEach((row, rowIndex) => {
      row.forEach((part, colIndex) => {
        if (part == 1) {
          ctx.fillStyle = nextColor
          ctx.fillRect(
            (gameOffsetWidth + gameWidth + (tileStep / 2)) + (tileStep * colIndex) + 1, 
            (gameOffsetHeight + 18) + (tileStep * rowIndex) + 1, 
            tileStep - 2, tileStep - 2
          )
        }
      })
    })
  }
  // time
  ctx.beginPath()
  ctx.font = '18px Verdana'
  ctx.textBaseline = 'bottom'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#999999'
  ctx.fillText(
    'TIME', 
    (gameWidth + gameOffsetWidth) + (gameOffsetWidth / 2), 
    (gameHeight + gameOffsetHeight) - 18
  )
  ctx.fillStyle = 'white'
  let minutes = Math.floor(timeElapsed / 60)
  let seconds = timeElapsed - (minutes * 60)
  ctx.fillText(
    minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0'), 
    (gameWidth + gameOffsetWidth) + (gameOffsetWidth / 2), 
    (gameHeight + gameOffsetHeight)
  )
  // btns
  ctx.beginPath()
  ctx.arc(gameOffsetWidth + (gameWidth / 5), 
    gameOffsetHeight + gameHeight + 75, 
    (gameWidth / 5) - 24, 0, 2 * Math.PI)
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.beginPath()
  ctx.font = '36px Verdana'
  ctx.fillStyle = 'white'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillText('←', gameOffsetWidth + (gameWidth / 5), 
    gameOffsetHeight + gameHeight + 75)
  ctx.beginPath()
  ctx.arc(gameOffsetWidth + gameWidth - (gameWidth / 5), 
    gameOffsetHeight + gameHeight + 75, 
    (gameWidth / 5) - 24, 0, 2 * Math.PI)
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.beginPath()
  ctx.font = '36px Verdana'
  ctx.fillStyle = 'white'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillText('→', gameOffsetWidth + gameWidth - (gameWidth / 5), 
    gameOffsetHeight + gameHeight + 75)
  ctx.beginPath()
  ctx.lineWidth = 2
  ctx.strokeRect(gameOffsetWidth + (gameWidth / 2) - (tileStep / 2) - tileStep, 
    gameOffsetHeight + gameHeight + tileStep, 
    tileStep * 3, (tileStep * 2) - (tileStep / 4))
  ctx.beginPath()
  ctx.font = '30px Verdana'
  ctx.fillStyle = 'white'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillText('↻', gameOffsetWidth + (gameWidth / 2), 
    gameOffsetHeight + gameHeight + (tileStep * 2) - 4)
  ctx.beginPath()
  ctx.lineWidth = 2
  ctx.strokeRect(gameOffsetWidth + (gameWidth / 2) - (tileStep / 2) - tileStep, 
    gameOffsetHeight + gameHeight + (tileStep * 3) + (tileStep / 4), 
    tileStep * 3, (tileStep * 2) - (tileStep / 4))
  ctx.beginPath()
  ctx.font = '30px Verdana'
  ctx.fillStyle = 'white'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillText('↓', gameOffsetWidth + (gameWidth / 2), 
    gameOffsetHeight + gameHeight + (tileStep * 4) + 4)
  // help
  ctx.beginPath()
  ctx.font = '12px Verdana'
  ctx.fillStyle = 'white'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillText('Left: A/ArrowLeft - Right: D/ArrowRight - Down: S/ArrowDown - Rotate: W/ArrowUp', 
    canvas.width / 2, gameOffsetHeight + gameHeight + (tileStep / 2))
  // fps
  ctx.beginPath()
  ctx.font = '12px Verdana'
  ctx.fillStyle = 'white'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillText('FPS: ' + currentFPS, canvas.width / 2, canvas.height - (tileStep / 2))
}

/** @param {Number} nowTime */
function main(nowTime) {
  if (nowTime >= thenStepFPS) {
    currentFPS = Math.round(1000 / (nowTime - then))
    if (!gameOver) timeElapsed += 1
		thenStepFPS = nowTime + 1000
	}
	update(nowTime)
	render()
	then = nowTime
	requestAnimationFrame((nowTime) => main(nowTime))
}

function setup() {
  'keydown keyup'.split(' ').forEach(eType => {
    addEventListener(eType, (e) => {
      if (e instanceof KeyboardEvent) {
        keysDown[e.key.toUpperCase()] = (eType == 'keydown')
      }
    })
  })
  'mousedown touchstart'.split(' ').forEach(eType => {
    addEventListener(eType, (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (e instanceof MouseEvent) {
        if (typeof window.ontouchstart != 'undefined') return
        handleButtons(e.clientX, e.clientY)
      } else if (e instanceof TouchEvent) {
        handleButtons(e.touches[0].clientX, e.touches[0].clientY)
      }
    })
  })
  'mouseup touchend'.split(' ').forEach(eType => {
    addEventListener(eType, () => {
      clearInterval(btnsTimer)
      btnsTimer = 0
    })
  })
  nextRandShape()
  nextRandColor()
  buildBlock()
  requestAnimationFrame((nowTime) => main(nowTime))
}

setup()
