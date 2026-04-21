export type ClinicalRole = 'therapist' | 'supervisor' | 'admin'

export type ClinicalUserProfileRow = {
  id: string
  user_id: string
  email: string | null
  full_name: string | null
  role: ClinicalRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ClinicalRolePermissions = {
  canReadPatients: boolean
  canEditPatients: boolean

  canReadGroups: boolean
  canEditGroups: boolean

  canReadSupervision: boolean
  canWriteSupervision: boolean

  canReadProtocols: boolean
  canManageProtocols: boolean

  canReadExports: boolean
  canManageExports: boolean

  canReadSignatures: boolean
  canManageSignatures: boolean

  canAccessClinicalAdmin: boolean
  canManageRoles: boolean
}