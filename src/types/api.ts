export type { NearestEpisode } from '@/app/api/nearest-episode/route'

export interface FetchError extends Error {
  status?: number
  info?: Record<string, unknown>
}
