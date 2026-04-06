export type MembershipRole = 'owner' | 'admin' | 'clinician' | 'supervisor' | 'reader'

const roleRank: Record<MembershipRole, number> = {
  reader: 1,
  supervisor: 2,
  clinician: 3,
  admin: 4,
  owner: 5,
}

export function hasRole(role: MembershipRole | null | undefined, minimum: MembershipRole) {
  if (!role) return false
  return roleRank[role] >= roleRank[minimum]
}

export function canCreateOrEdit(role: MembershipRole | null | undefined) {
  return hasRole(role, 'clinician')
}

export function canManageOrganization(role: MembershipRole | null | undefined) {
  return hasRole(role, 'admin')
}

export function canExport(role: MembershipRole | null | undefined) {
  return hasRole(role, 'supervisor')
}

export function canSoftDelete(role: MembershipRole | null | undefined) {
  return hasRole(role, 'clinician')
}

export function canReview(role: MembershipRole | null | undefined) {
  return hasRole(role, 'supervisor')
}

export function canUploadDocuments(role: MembershipRole | null | undefined) {
  return hasRole(role, 'clinician')
}
