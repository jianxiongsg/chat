interface Options {
  code: string;
  message: string;
  [key: string]: any;
}
export class WebError extends Error {
  code: string;
  message: string;
  constructor(options: Options) {
    super(options.message);
    Object.assign(this, options);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, WebError);
    }
  }
}
