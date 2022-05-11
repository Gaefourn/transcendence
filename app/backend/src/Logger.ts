
interface Context {
  print(): string;
}

export class IdContext implements Context {
  id: string;

  constructor(id: string) {
    this.id = id;
  }

  print(): string {
    return this.id;
  }
}

export class Default implements Context {
  print(): string { return "-"; }
}

class Logger {

  static ctx_log(context: Context, ...args) {
    console.log(`[${new Date().toISOString()}][${context.print()}]`, ...args);
  }

  static log(...args) {
    Logger.ctx_log(new Default(), ...args);
  }

  static ctx_warn(context: Context, ...args) {
    console.warn(`[${new Date().toISOString()}][${context.print()}]`, ...args);
  }

  static warn(...args) {
    Logger.ctx_warn(new Default(), ...args);
  }

  static ctx_err(context: Context, ...args) {
    console.error(`[${new Date().toISOString()}][${context.print()}]`, ...args);
  }

  static err(...args) {
    Logger.ctx_err(new Default(), ...args);
  }
}

export const Console = {
  log: Logger.log,
  warn: Logger.warn,
  err: Logger.err,
  ctx_log: Logger.ctx_log,
  ctx_warn: Logger.ctx_warn,
  ctx_err: Logger.ctx_err,
}
