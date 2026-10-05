const Choreographer = require('bare-ndk/choreographer')
const FrameCallback = require('bare-ndk/frame-callback')

// Frame callbacks run at the start of a frame, before it is laid out and drawn.
module.exports = class AndroidClock {
  constructor(target, onframe) {
    this._onframe = onframe
    this._callback = null
  }

  start() {
    const choreographer = Choreographer.getInstance()

    this._callback = new FrameCallback()
    this._callback.on('frame', () => {
      choreographer.postFrameCallback(this._callback)

      this._onframe()
    })

    choreographer.postFrameCallback(this._callback)
  }

  stop() {
    Choreographer.getInstance().removeFrameCallback(this._callback)

    this._callback = null
  }
}
