import { AbortSignal } from 'bare-abort-controller'

interface AnimationFrameOptions {
  /**
   * Take back the request once `signal` is aborted. A promise is then rejected with the reason that
   * `signal` was aborted with.
   */
  signal?: AbortSignal
}

/** A requested frame, whose callback has yet to be called. */
interface AnimationFrameRequest {
  /** Take back the request, unless its callback has already been called. */
  cancel(): void

  /** Cancel the request, so that `using` takes it back at the end of its scope. */
  [Symbol.dispose](): void
}

/**
 * The animation frame callbacks of a single target, as the `AnimationFrameProvider` of the HTML
 * specification. On Apple, frames follow `target` if given, which is a view, window or screen. On
 * linux, they follow `target` if given, which is a realized widget. Elsewhere, `target` is ignored.
 */
interface AnimationFrameProvider {
  /**
   * Call `callback` once, before the next frame is laid out and drawn, with the time the frame
   * started in milliseconds, as read from `bare-hrtime`.
   */
  requestAnimationFrame(
    callback: (time: number) => void,
    opts?: AnimationFrameOptions
  ): AnimationFrameRequest

  /**
   * Resolve before the next frame is laid out and drawn, with the time the frame started, so changes
   * made then are part of the frame.
   */
  requestAnimationFrame(opts?: AnimationFrameOptions): Promise<number>

  /** Take back a request whose callback has not been called yet, as `request.cancel()` does. */
  cancelAnimationFrame(request: AnimationFrameRequest): void

  /**
   * Call `callback` once every change made before the call has been laid out and drawn, by
   * requesting a frame from within a frame. It is called with the time that the frame after
   * started.
   */
  afterAnimationFrame(
    callback: (time: number) => void,
    opts?: AnimationFrameOptions
  ): AnimationFrameRequest

  /**
   * Resolve once every change made before the call has been laid out and drawn, with the time that
   * the frame after started.
   */
  afterAnimationFrame(opts?: AnimationFrameOptions): Promise<number>
}

declare class AnimationFrameProvider {
  /**
   * Without `target`, frames follow the main screen on Apple and the active window of the
   * application on Linux.
   */
  constructor(target?: unknown)

  /** `requestAnimationFrame()` of the default provider, which has no target. */
  static requestAnimationFrame(
    callback: (time: number) => void,
    opts?: AnimationFrameOptions
  ): AnimationFrameRequest
  static requestAnimationFrame(opts?: AnimationFrameOptions): Promise<number>

  /** `cancelAnimationFrame()` of the default provider. */
  static cancelAnimationFrame(request: AnimationFrameRequest): void

  /** `afterAnimationFrame()` of the default provider. */
  static afterAnimationFrame(
    callback: (time: number) => void,
    opts?: AnimationFrameOptions
  ): AnimationFrameRequest
  static afterAnimationFrame(opts?: AnimationFrameOptions): Promise<number>
}

declare namespace AnimationFrameProvider {
  export { type AnimationFrameOptions, type AnimationFrameRequest }
}

export = AnimationFrameProvider
