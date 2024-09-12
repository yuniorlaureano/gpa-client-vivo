export class Permission {
  public static Create: string = 'create';
  public static Update: string = 'update';
  public static Delete: string = 'delete';
  public static Read: string = 'read';
  public static ReadProducts: string = 'read_products';
  public static ReadExistence: string = 'read_existence';
  public static RegisterInput: string = 'add_input';
  public static RegisterOutput: string = 'add_output';
  public static UpdateInput: string = 'update_input';
  public static UpdateOutput: string = 'update_output';
  public static Open: string = 'open';
  public static Close: string = 'close';
  public static Cancel: string = 'cancel';
  public static AssignProfile: string = 'assign_profile';
  public static UnAssignProfile: string = 'unAssign_profile';
  public static UpdateUserProfile: string = 'update_user_profile';
  public static ReadTransactions: string = 'read_transactions';
  public static Return: string = 'return';
  public static Upload: string = 'upload';
  public static Download: string = 'download';
  public static Print = 'print';
  public static ExistenceReport = 'existence-report';
}

export class Apps {
  public static GPA: string = 'GPA';
}

export class Modules {
  public static Inventory: string = 'inventory';
  public static Invoice: string = 'invoice';
  public static Security: string = 'security';
  public static Reporting = 'reporting';
  public static General: string = 'general';
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
  public static Email: string = 'email';
  public static Blob: string = 'blob';
  public static PrintInformation = 'printInformation';
  public static Unit = 'unit';
  public static Dashboard = 'dashboard';
  public static Report = 'report';
}
