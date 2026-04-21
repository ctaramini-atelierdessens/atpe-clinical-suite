import type { ClinicalRole, ClinicalRolePermissions } from '@/lib/auth-types'

export function getRolePermissions(role: ClinicalRole): ClinicalRolePermissions {
  switch (role) {
    case 'admin':
      return {
        canReadPatients: true,
        canEditPatients: true,
        canReadGroups: true,
        canEditGroups: true,
        canReadSupervision: true,
        canWriteSupervision: true,
        canManageProtocols: true,
        canManageExports: true,
        canManageSignatures: true,
        canAccessAdmin: true,
      }

    case 'supervisor':
      return {
        canReadPatients: true,
        canEditPatients: false,
        canReadGroups: true,
        canEditGroups: false,
        canReadSupervision: true,
        canWriteSupervision: true,
        canManageProtocols: true,
        canManageExports: true,
        canManageSignatures: false,
        canAccessAdmin: true,
      }

    case 'therapist':
    default:
      return {
        canReadPatients: true,
        canEditPatients: true,
        canReadGroups: true,
        canEditGroups: false,
        canReadSupervision: true,
        canWriteSupervision: false,
        canManageProtocols: true,
        canManageExports: true,
        canManageSignatures: false,
        canAccessAdmin: false,
      }
  }
}