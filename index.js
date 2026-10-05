const hrtime = require('bare-hrtime')
const Clock = require('#clock')
const AnimationFrameRequest = require('./lib/request')

// The platform only reaches a clock weakly, so a provider with requests still
// pending is kept here until they have run.
const ticking = new Set()

class AnimationFrameProvider {
  constructor(target = null) {
    this._clock = new Clock(target, this._onframe.bind(this))
    this._requests = new Set()

    this.requestAnimationFrame = this.requestAnimationFrame.bind(this)
    this.cancelAnimationFrame = this.cancelAnimationFrame.bind(this)
    this.afterAnimationFrame = this.afterAnimationFrame.bind(this)
  }

  requestAnimationFrame(callback, opts) {
    return this._request(1, callback, opts)
  }

  cancelAnimationFrame(request) {
    if (request instanceof AnimationFrameRequest) request.cancel()
  }

  // The frame after the next one only starts once the next one, which has every
  // change made before the call, has been laid out and drawn.
  afterAnimationFrame(callback, opts) {
    return this._request(2, callback, opts)
  }

  _request(frames, callback, opts) {
    if (typeof callback === 'object' && callback !== null) {
      opts = callback
      callback = undefined
    }

    const signal = (opts !== undefined && opts.signal) || null

    if (callback === undefined) {
      return new Promise((resolve, reject) => {
        new AnimationFrameRequest(this, frames, resolve, signal, reject)
      })
    }

    return new AnimationFrameRequest(this, frames, callback, signal)
  }

  _schedule(request) {
    if (!ticking.has(this)) {
      this._clock.start()

      ticking.add(this)
    }

    this._requests.add(request)
  }

  // The clock is left to stop on its next frame, as stopping it while a frame
  // is being run could start it again within the same frame.
  _cancel(request) {
    return this._requests.delete(request)
  }

  _onframe() {
    const now = milliseconds(hrtime.bigint())

    // Requests made while this frame is being run wait for the next one.
    for (const request of [...this._requests]) {
      if (!this._requests.delete(request)) continue

      try {
        request._onframe(now)
      } catch (err) {
        queueMicrotask(() => {
          throw err
        })
      }
    }

    if (this._requests.size === 0) {
      this._clock.stop()

      ticking.delete(this)
    }
  }
}

module.exports = exports = AnimationFrameProvider

const provider = new AnimationFrameProvider()

exports.requestAnimationFrame = provider.requestAnimationFrame
exports.cancelAnimationFrame = provider.cancelAnimationFrame
exports.afterAnimationFrame = provider.afterAnimationFrame

function milliseconds(nanoseconds) {
  return Number(nanoseconds / 1000000n) + Number(nanoseconds % 1000000n) / 1e6
}
