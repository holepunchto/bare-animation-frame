const DisplayLink = require('bare-core-animation/display-link')
const RunLoop = require('bare-foundation/run-loop')

// A display link ticks before the changes made since the last tick are
// committed, so they are part of the frame that follows.
module.exports = class IOSClock {
  constructor(target, onframe) {
    this._onframe = onframe
    this._link = null
  }

  start() {
    this._link = new DisplayLink()
    this._link.on('tick', this._onframe)
    this._link.addToRunLoop(RunLoop.main, RunLoop.MODE.COMMON)
  }

  stop() {
    this._link.invalidate()
    this._link = null
  }
}
