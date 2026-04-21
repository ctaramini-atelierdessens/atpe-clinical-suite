import { createHash } from 'crypto'
import { toCanonicalJson } from '@/lib/atpe/be-export-canonical'

export function sha256Hex(value: string) {
  return createHash('sha256').update(value, 'utf8').digest('hex')
}

export function buildPayloadHash(payload: unknown) {
  const canonical = toCanonicalJson(payload)
  return {
    canonical,
    hash: sha256Hex(canonical),
  }
}