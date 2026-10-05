const { test } = require('bare-tap')
const { Window, View } = require('bare-native')
const AbortController = require('bare-abort-controller')
const AnimationFrameProvider = require('.')
const { requestAnimationFrame, cancelAnimationFrame, afterAnimationFrame } = AnimationFrameProvider

// Frames are only drawn for a window on screen, and on Linux the default
// provider follows the active window.
const window = new Window(300, 200).content(new View()).show()

test('calls the callback with the time of the frame', async (t) => {
  const time = await new Promise((resolve) => requestAnimationFrame(resolve))

  t.equal(typeof time, 'number')
  t.ok(time > 0)
})

test('calls the callbacks of a frame in order with the same time', async (t) => {
  const calls = []

  requestAnimationFrame((time) => calls.push(['a', time]))
  requestAnimationFrame((time) => calls.push(['b', time]))

  await afterAnimationFrame()

  t.deepStrictEqual(
    calls.map(([name]) => name),
    ['a', 'b']
  )
  t.equal(calls[0][1], calls[1][1])
})

test('defers callbacks requested within a frame to the next one', async (t) => {
  const times = await new Promise((resolve) => {
    requestAnimationFrame((first) => {
      requestAnimationFrame((second) => resolve([first, second]))
    })
  })

  t.ok(times[1] > times[0])
})

test('skips a callback cancelled earlier in the same frame', async (t) => {
  let called = false
  let request

  requestAnimationFrame(() => request.cancel())
  request = requestAnimationFrame(() => {
    called = true
  })

  await afterAnimationFrame()

  t.notOk(called)
})

test('takes back a request', async (t) => {
  let calls = 0

  requestAnimationFrame(() => calls++).cancel()

  cancelAnimationFrame(requestAnimationFrame(() => calls++))

  {
    using request = requestAnimationFrame(() => calls++)
  }

  await afterAnimationFrame()

  t.equal(calls, 0)
})

test('takes back a request once its signal is aborted', async (t) => {
  const controller = new AbortController()
  let called = false

  requestAnimationFrame(
    () => {
      called = true
    },
    { signal: controller.signal }
  )

  controller.abort()

  await afterAnimationFrame()

  t.notOk(called)
})

test('resolves without a callback', async (t) => {
  const time = await requestAnimationFrame()

  t.equal(typeof time, 'number')
})

test('rejects with the reason of an aborted signal', async (t) => {
  const reason = new Error('Aborted')

  const controller = new AbortController()
  const pending = requestAnimationFrame({ signal: controller.signal })
  controller.abort(reason)

  const aborted = new AbortController()
  aborted.abort(reason)

  for (const promise of [pending, requestAnimationFrame({ signal: aborted.signal })]) {
    try {
      await promise
      t.fail('Should have rejected')
    } catch (err) {
      t.equal(err, reason)
    }
  }
})

test('reports an error thrown by a callback after the rest have run', async (t) => {
  const error = new Error('Thrown')
  let called = false

  const reported = new Promise((resolve) => Bare.once('uncaughtException', resolve))

  requestAnimationFrame(() => {
    throw error
  })
  requestAnimationFrame(() => {
    called = true
  })

  t.equal(await reported, error)
  t.ok(called)
})

test('rejects a callback that is not a function', (t) => {
  t.throws(() => requestAnimationFrame(null), TypeError)
  t.throws(() => afterAnimationFrame(1), TypeError)
})

test('waits for the frame after the next one', async (t) => {
  const next = requestAnimationFrame()
  const after = afterAnimationFrame()

  t.ok((await after) > (await next))
})

test('follows a target', async (t) => {
  const { requestAnimationFrame } = new AnimationFrameProvider(window.native)

  const time = await requestAnimationFrame()

  t.equal(typeof time, 'number')
})
