export type RequiredPermissionType = {
  [key: string]: {
    expected: string;
    valid: boolean;
  };
};

export type ModuleRequiredPermissionType = {
  [key: string]: {
    [key: string]: RequiredPermissionType;
  };
};
