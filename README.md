# bare-animation-frame

The `requestAnimationFrame()` API of the HTML specification for native apps built with Bare. Callbacks run once, before the next frame is laid out and drawn, and are timed by the frames of the platform itself.

```
npm i bare-animation-frame
```

## Usage

```js
const { requestAnimationFrame } = require('bare-animation-frame')

requestAnimationFrame((time) => {
  // Changes made here are part of the next frame.
})
```

`requestAnimationFrame()` returns a request, which can be taken back with `cancel()` or `cancelAnimationFrame()` until its callback has been called, or with `using` at the end of its scope:

```js
using frame = requestAnimationFrame(callback)
```

Without a callback, `requestAnimationFrame()` returns a promise that resolves with the time instead:

```js
const time = await requestAnimationFrame()
```

Both forms take an `AbortSignal` to take the request back once the signal is aborted, which rejects a promise with the reason of the signal:

```js
const controller = new AbortController()

requestAnimationFrame(callback, { signal: controller.signal })

await requestAnimationFrame({ signal: controller.signal })
```

To wait until changes already made have been laid out and drawn, use `afterAnimationFrame()`, which requests a frame from within a frame and returns a request or a promise like `requestAnimationFrame()` does:

```js
const { afterAnimationFrame } = require('bare-animation-frame')

await afterAnimationFrame()
```

Frames can also follow a specific target, such as a window on another screen:

```js
const AnimationFrameProvider = require('bare-animation-frame')

const { requestAnimationFrame, cancelAnimationFrame, afterAnimationFrame } =
  new AnimationFrameProvider(window)
```

## License

Apache-2.0
