import {
  ModuleRequiredPermissionType,
  RequiredPermissionType,
} from '../../models/required-permission.type';
import * as PermissionConstants from '../../models/profile.constants';

export function getRequiredPermissions(): ModuleRequiredPermissionType {
  return {
    [PermissionConstants.Modules.Security]: {
      [PermissionConstants.Components.Profile]: profilePermission(),
      [PermissionConstants.Components.User]: userPermission(),
    },
    [PermissionConstants.Modules.General]: {
      [PermissionConstants.Components.Auth]: authPermission(),
      [PermissionConstants.Components.Email]: emailPermission(),
      [PermissionConstants.Components.Blob]: blobPermission(),
    },
    [PermissionConstants.Modules.Inventory]: {
      [PermissionConstants.Components.Product]: productPermission(),
      [PermissionConstants.Components.StockCycle]: stockCyclePermission(),
      [PermissionConstants.Components.Category]: categoryPermission(),
      [PermissionConstants.Components.Addon]: addonPermission(),
      [PermissionConstants.Components.Stock]: stockPermission(),
    },
    [PermissionConstants.Modules.Invoice]: {
      [PermissionConstants.Components.Invoicing]: invoicePermission(),
      [PermissionConstants.Components.ReceivableAccount]:
        receivabelAccountPermission(),
      [PermissionConstants.Components.Client]: clientPermission(),
    },
  };
}

function profilePermission(): RequiredPermissionType {
  return {
    create: {
      expected: PermissionConstants.Permission.Create,
      valid: false,
    },
    update: {
      expected: PermissionConstants.Permission.Update,
      valid: false,
    },
    delete: {
      expected: PermissionConstants.Permission.Delete,
      valid: false,
    },
    read: {
      expected: PermissionConstants.Permission.Read,
      valid: false,
    },
    [PermissionConstants.Permission.AssignProfile]: {
      expected: PermissionConstants.Permission.AssignProfile,
      valid: false,
    },
    [PermissionConstants.Permission.UnAssignProfile]: {
      expected: PermissionConstants.Permission.UnAssignProfile,
      valid: false,
    },
  };
}

function userPermission(): RequiredPermissionType {
  return {
    create: {
      expected: PermissionConstants.Permission.Create,
      valid: false,
    },
    update: {
      expected: PermissionConstants.Permission.Update,
      valid: false,
    },
    delete: {
      expected: PermissionConstants.Permission.Delete,
      valid: false,
    },
    read: {
      expected: PermissionConstants.Permission.Read,
      valid: false,
    },
  };
}

function authPermission(): RequiredPermissionType {
  return {
    [PermissionConstants.Permission.UpdateUserProfile]: {
      expected: PermissionConstants.Permission.UpdateUserProfile,
      valid: false,
    },
  };
}

function productPermission(): RequiredPermissionType {
  return {
    create: {
      expected: PermissionConstants.Permission.Create,
      valid: false,
    },
    update: {
      expected: PermissionConstants.Permission.Update,
      valid: false,
    },
    delete: {
      expected: PermissionConstants.Permission.Delete,
      valid: false,
    },
    read: {
      expected: PermissionConstants.Permission.Read,
      valid: false,
    },
  };
}

function stockCyclePermission(): RequiredPermissionType {
  return {
    create: {
      expected: PermissionConstants.Permission.Create,
      valid: false,
    },
    update: {
      expected: PermissionConstants.Permission.Update,
      valid: false,
    },
    delete: {
      expected: PermissionConstants.Permission.Delete,
      valid: false,
    },
    read: {
      expected: PermissionConstants.Permission.Read,
      valid: false,
    },
    open: {
      expected: PermissionConstants.Permission.Open,
      valid: false,
    },
    close: {
      expected: PermissionConstants.Permission.Close,
      valid: false,
    },
  };
}

function categoryPermission(): RequiredPermissionType {
  return {
    create: {
      expected: PermissionConstants.Permission.Create,
      valid: false,
    },
    update: {
      expected: PermissionConstants.Permission.Update,
      valid: false,
    },
    delete: {
      expected: PermissionConstants.Permission.Delete,
      valid: false,
    },
    read: {
      expected: PermissionConstants.Permission.Read,
      valid: false,
    },
  };
}

function addonPermission(): RequiredPermissionType {
  return {
    create: {
      expected: PermissionConstants.Permission.Create,
      valid: false,
    },
    update: {
      expected: PermissionConstants.Permission.Update,
      valid: false,
    },
    delete: {
      expected: PermissionConstants.Permission.Delete,
      valid: false,
    },
    read: {
      expected: PermissionConstants.Permission.Read,
      valid: false,
    },
  };
}

function stockPermission(): RequiredPermissionType {
  return {
    create: {
      expected: PermissionConstants.Permission.Create,
      valid: false,
    },
    update: {
      expected: PermissionConstants.Permission.Update,
      valid: false,
    },
    delete: {
      expected: PermissionConstants.Permission.Delete,
      valid: false,
    },
    read: {
      expected: PermissionConstants.Permission.Read,
      valid: false,
    },
    [PermissionConstants.Permission.RegisterInput]: {
      expected: PermissionConstants.Permission.RegisterInput,
      valid: false,
    },
    [PermissionConstants.Permission.RegisterOutput]: {
      expected: PermissionConstants.Permission.RegisterOutput,
      valid: false,
    },
    cancel: {
      expected: PermissionConstants.Permission.Cancel,
      valid: false,
    },
    [PermissionConstants.Permission.UpdateInput]: {
      expected: PermissionConstants.Permission.UpdateInput,
      valid: false,
    },
    [PermissionConstants.Permission.UpdateOutput]: {
      expected: PermissionConstants.Permission.UpdateOutput,
      valid: false,
    },
    [PermissionConstants.Permission.ReadProducts]: {
      expected: PermissionConstants.Permission.ReadProducts,
      valid: false,
    },
    [PermissionConstants.Permission.ReadExistence]: {
      expected: PermissionConstants.Permission.ReadExistence,
      valid: false,
    },
    [PermissionConstants.Permission.ReadTransactions]: {
      expected: PermissionConstants.Permission.ReadTransactions,
      valid: false,
    },
  };
}

function invoicePermission(): RequiredPermissionType {
  return {
    create: {
      expected: PermissionConstants.Permission.Create,
      valid: false,
    },
    update: {
      expected: PermissionConstants.Permission.Update,
      valid: false,
    },
    delete: {
      expected: PermissionConstants.Permission.Delete,
      valid: false,
    },
    read: {
      expected: PermissionConstants.Permission.Read,
      valid: false,
    },
    return: {
      expected: PermissionConstants.Permission.Return,
      valid: false,
    },
  };
}

function receivabelAccountPermission(): RequiredPermissionType {
  return {
    create: {
      expected: PermissionConstants.Permission.Create,
      valid: false,
    },
    update: {
      expected: PermissionConstants.Permission.Update,
      valid: false,
    },
    delete: {
      expected: PermissionConstants.Permission.Delete,
      valid: false,
    },
    read: {
      expected: PermissionConstants.Permission.Read,
      valid: false,
    },
  };
}

function clientPermission(): RequiredPermissionType {
  return {
    create: {
      expected: PermissionConstants.Permission.Create,
      valid: false,
    },
    update: {
      expected: PermissionConstants.Permission.Update,
      valid: false,
    },
    delete: {
      expected: PermissionConstants.Permission.Delete,
      valid: false,
    },
    read: {
      expected: PermissionConstants.Permission.Read,
      valid: false,
    },
  };
}

function emailPermission(): RequiredPermissionType {
  return {
    create: {
      expected: PermissionConstants.Permission.Create,
      valid: false,
    },
    update: {
      expected: PermissionConstants.Permission.Update,
      valid: false,
    },
    delete: {
      expected: PermissionConstants.Permission.Delete,
      valid: false,
    },
    read: {
      expected: PermissionConstants.Permission.Read,
      valid: false,
    },
  };
}

function blobPermission(): RequiredPermissionType {
  return {
    create: {
      expected: PermissionConstants.Permission.Create,
      valid: false,
    },
    update: {
      expected: PermissionConstants.Permission.Update,
      valid: false,
    },
    delete: {
      expected: PermissionConstants.Permission.Delete,
      valid: false,
    },
    read: {
      expected: PermissionConstants.Permission.Read,
      valid: false,
    },
    upload: {
      expected: PermissionConstants.Permission.Upload,
      valid: false,
    },
  };
}
