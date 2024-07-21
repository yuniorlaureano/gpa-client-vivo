export class AddError {
  static readonly type = '[App] AddError';
  constructor(public payload: string) {}
}

export class RemoveError {
  static readonly type = '[App] RemoveError';
  constructor(public error: string) {}
}
