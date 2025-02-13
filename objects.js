export class Pos {
  /**
   * @param {Number} x
   * @param {Number} y
   */
  constructor(x, y) {
    /** @type {Number} */
    this.x = x
    /** @type {Number} */
    this.y = y
  }
}

export class GridBlock {
  /**
   * @param {Pos} pos
   * @param {'green' | 'red' | 'yellow' | 'blue' | 'orange' | 'white'} color
   */
  constructor(pos, color) {
    /** @type {Pos} */
    this.pos = pos
    /** @type {'green' | 'red' | 'yellow' | 'blue' | 'orange' | 'white'} */
    this.color = color
  }
}

export class Block extends GridBlock {
  /**
   * @param {Pos} pos
   * @param {Number[][]} parts
   * @param {'green' | 'red' | 'yellow' | 'blue' | 'orange' | 'white'} color
   * @param {Boolean} active
   */
  constructor(pos, parts, color, active) {
    super(pos, color)
    /** @type {Number[][]} */
    this.parts = parts
    /** @type {Boolean} */
    this.active = active
  }
}
