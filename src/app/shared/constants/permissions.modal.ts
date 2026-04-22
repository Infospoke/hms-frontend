export interface PermissionCell {
  create: boolean;
  view:   boolean;
  edit:   boolean;
  delete: boolean;
}

export interface PermissionModule {
  key:      string;
  label:    string;
  moduleId?: number;  
}

export interface RolePermission {
  roleId:      number;
  roleName:    string;
  permissions: Record<string, PermissionCell>;
}