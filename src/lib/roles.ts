export const ROLES = {
  ADMIN: 'admin',
  COMPRAS: 'compras',
  DEPOSITO: 'deposito',
  RECEPCION: 'recepcion',
  HOUSEKEEPING: 'housekeeping'
} as const

export const PERMISSIONS = {
  INSUMOS: {
    VIEW: ['admin', 'compras', 'deposito'],
    CREATE: ['admin', 'compras'],
    EDIT: ['admin', 'compras'],
    DELETE: ['admin']
  },
  STOCK: {
    VIEW: ['admin', 'compras', 'deposito', 'housekeeping'],
    EDIT: ['admin', 'compras', 'deposito']
  }
}

export function hasPermission(userRole: string, resource: string, action: string): boolean {
  const permissions = PERMISSIONS[resource as keyof typeof PERMISSIONS]
  if (!permissions) return false
  
  const allowedRoles = permissions[action as keyof typeof permissions]
  return allowedRoles?.includes(userRole) || false
}