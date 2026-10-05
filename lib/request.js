module.exports = class AnimationFrameRequest {
  constructor(provider, frames, callback, signal, onabort = noop) {
    if (typeof callback !== 'function') throw new TypeError('Callback must be a function')

    this._provider = provider
    this._frames = frames
    this._callback = callback
    this._signal = signal
    this._onabort = onabort

    this._listener = null

    if (signal !== null) {
      if (signal.aborted) {
        onabort(signal.reason)
        return
      }

      this._listener = this._abort.bind(this)

      signal.addEventListener('abort', this._listener)
    }

    provider._schedule(this)
  }

  cancel() {
    if (this._provider._cancel(this)) this._unlisten()
  }

  [Symbol.dispose]() {
    this.cancel()
  }

  _abort() {
    this.cancel()
    this._onabort(this._signal.reason)
  }

  _unlisten() {
    if (this._listener !== null) this._signal.removeEventListener('abort', this._listener)
  }

  _onframe(time) {
    if (--this._frames > 0) return this._provider._schedule(this)

    this._unlisten()
    this._callback(time)
  }
}

function noop() {}
