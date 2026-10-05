const DisplayLink = require('bare-core-animation/display-link')
const RunLoop = require('bare-foundation/run-loop')
const Screen = require('bare-app-kit/screen')

// A display link ticks before the changes made since the last tick are
// committed, so they are part of the frame that follows.
module.exports = class DarwinClock {
  constructor(target, onframe) {
    this._target = target
    this._onframe = onframe
    this._link = null
  }

  start() {
    const source = this._target || Screen.main()

    if (source === null) throw new Error('There is no screen to time frames by')

    this._link = new DisplayLink(source)
    this._link.on('tick', this._onframe)
    this._link.addToRunLoop(RunLoop.main, RunLoop.MODE.COMMON)
  }

  stop() {
    this._link.invalidate()
    this._link = null
  }
}
