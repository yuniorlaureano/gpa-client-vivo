export class Permission {
  public static Create: string = 'create';
  public static Update: string = 'update';
  public static Delete: string = 'delete';
  public static Read: string = 'read';
  public static ReadProducts: string = 'read-products';
  public static ReadExistence: string = 'read-existence';
  public static RegisterInput: string = 'add-input';
  public static RegisterOutput: string = 'add-output';
  public static UpdateInput: string = 'update-input';
  public static UpdateOutput: string = 'update-output';
  public static Open: string = 'open';
  public static Close: string = 'close';
  public static Cancel: string = 'cancel';
  public static AssignProfile: string = 'assign-profile';
  public static UnAssignProfile: string = 'unAssign-profile';
  public static UpdateUserProfile: string = 'updateUser-profile';
  public static ReadTransactions: string = 'read-transactions';
  public static Return: string = 'return';
}

export class Apps {
  public static GPA: string = 'GPA';
}

export class Modules {
  public static Inventory: string = 'inventory';
  public static Invoice: string = 'invoice';
  public static Security: string = 'security';
  public static Report: string = 'report';
  public static Common: string = 'common';
  public static Auth: string = 'common';
}

export class Components {
  public static Addon: string = 'addon';
  public static Category: string = 'category';
  public static ProductLocation: string = 'productLocation';
  public static Product: string = 'product';
  public static Provider: string = 'provider';
  public static Reason: string = 'reason';
  public static StockCycle: string = 'stockCycle';
  public static Stock: string = 'stock';
  public static Client: string = 'client';
  public static Invoicing: string = 'invoicing';
  public static ReceivableAccount: string = 'receivable';
  public static User: string = 'user';
  public static Profile: string = 'profile';
  public static Auth: string = 'auth';
}
