const CompositionTarget = require('bare-win-ui/composition-target')

// The rendering event is raised once per frame, before it is rendered.
module.exports = class Win32Clock {
  constructor(target, onframe) {
    this._onframe = onframe
  }

  start() {
    CompositionTarget.on('rendering', this._onframe)
  }

  stop() {
    CompositionTarget.off('rendering', this._onframe)
  }
}
