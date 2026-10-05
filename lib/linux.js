const Application = require('bare-gtk/application')

// The update phase of a frame comes before it is laid out and drawn.
module.exports = class LinuxClock {
  constructor(target, onframe) {
    this._target = target
    this._onframe = onframe
    this._clock = null
  }

  start() {
    const widget = this._target || activeWindow()

    const clock = widget.frameClock

    if (clock === null) {
      throw new Error('The widget has not been realized, so it has no frame clock')
    }

    this._clock = clock.on('update', this._onframe).beginUpdating()
  }

  stop() {
    this._clock.off('update', this._onframe).endUpdating()
    this._clock = null
  }
}

function activeWindow() {
  const application = Application.getDefault()

  const window = application === null ? null : application.activeWindow

  if (window === null) throw new Error('There is no window to time frames by')

  return window
}
