export class AddError {
  static readonly type = '[Auth] AddError';
  constructor(public payload: string) {}
}

export class AddErrors {
  static readonly type = '[Auth] AddErrors';
  constructor(public payload: string[]) {}
}

export class ClearErrors {
  static readonly type = '[Auth] ClearErrors';
  constructor() {}
}

export class AddMessage {
  static readonly type = '[Auth] AddMessage';
  constructor(public payload: string) {}
}

export class AddMessages {
  static readonly type = '[Auth] AddMessages';
  constructor(public payload: string[]) {}
}

export class ReplaceMessages {
  static readonly type = '[Auth] ReplaceMessages';
  constructor(public payload: string[]) {}
}

export class ClearMessages {
  static readonly type = '[Auth] ClearMessages';
  constructor() {}
}
