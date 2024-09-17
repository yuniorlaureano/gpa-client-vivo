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
  public static StockCycleReport = 'stock-cycle-report';
  public static TransactionReport = 'transaction-report';
  public static SaleReport = 'sale-report';
  public static Send = 'send';
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

export const PermissionTranslate = {
  [Permission.Create]: 'Crear',
  [Permission.Update]: 'Actualizar',
  [Permission.Delete]: 'Eliminar',
  [Permission.Read]: 'Leer',
  [Permission.ReadProducts]: 'Leer productos',
  [Permission.ReadExistence]: 'Leer existencia',
  [Permission.RegisterInput]: 'Agregar entrada',
  [Permission.RegisterOutput]: 'Agregar salida',
  [Permission.UpdateInput]: 'Actualizar entrada',
  [Permission.UpdateOutput]: 'Actualizar salida',
  [Permission.Open]: 'Abrir',
  [Permission.Close]: 'Cerrar',
  [Permission.Cancel]: 'Cancelar',
  [Permission.AssignProfile]: 'Asignar perfil',
  [Permission.UnAssignProfile]: 'Desasignar perfil',
  [Permission.UpdateUserProfile]: 'Actualizar perfil de usuario',
  [Permission.ReadTransactions]: 'Leer transacciones',
  [Permission.Return]: 'Devolver',
  [Permission.Upload]: 'Subir archivo',
  [Permission.Download]: 'Descargar',
  [Permission.Print]: 'Imprimir',
  [Permission.ExistenceReport]: 'Reporte de existencia',
  [Permission.StockCycleReport]: 'Reporte de ciclos de inventario',
  [Permission.TransactionReport]: 'Reporte de transacciones',
  [Permission.SaleReport]: 'Reporte de ventas',
  [Permission.Send]: 'Enviar mensajes',
  [Apps.GPA]: 'Sistema GPA',
  [Modules.Inventory]: 'Inventario',
  [Modules.Invoice]: 'Facturación',
  [Modules.Security]: 'Seguridad',
  [Modules.Reporting]: 'Reportes',
  [Modules.General]: 'General',
  [Components.Addon]: 'Agregado',
  [Components.Category]: 'Categoria',
  [Components.ProductLocation]: 'Ubicación de producto',
  [Components.Product]: 'Producto',
  [Components.Provider]: 'Proveedor',
  [Components.Reason]: 'Razón',
  [Components.StockCycle]: 'Ciclo de inventario',
  [Components.Stock]: 'Inventario',
  [Components.Client]: 'Cliente',
  [Components.Invoicing]: 'Facturación',
  [Components.ReceivableAccount]: 'Cuentas por cobrar',
  [Components.User]: 'Usuario',
  [Components.Profile]: 'Perfil',
  [Components.Auth]: 'Authenticación',
  [Components.Email]: 'Correo',
  [Components.Blob]: 'Blob',
  [Components.PrintInformation]: 'Información de impresión',
  [Components.Unit]: 'unit',
  [Components.Dashboard]: 'Dashboard',
  [Components.Report]: 'Reporte',
};
