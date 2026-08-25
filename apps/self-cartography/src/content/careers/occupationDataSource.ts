import type { Career } from './occupationData'
import { OCCUPATIONS } from './occupationData'

/**
 * The seam that keeps the app from ever touching an external API's actual
 * response shape. Every consumer in this app — the fit engine, the results
 * UI — depends only on this interface and the normalized Career type, never
 * on where the data actually came from. Async on purpose: a real dataset
 * (O*NET's Web Services API, for instance) is a network call, and this
 * interface has to be true for that implementation on day one, not
 * retrofitted once a local-only assumption is already baked into callers.
 *
 * To add a real O*NET-backed source later: implement this interface
 * (`OnetApiOccupationDataSource`), have its methods fetch from O*NET's Web
 * Services and map the response into the normalized Career shape defined
 * in occupationData.ts, and swap the instance created below. Nothing
 * outside this file changes.
 */
export interface OccupationDataSource {
  getAllCareers(): Promise<Career[]>
  getCareerById(id: string): Promise<Career | undefined>
}

/** Backed by the hand-authored seed set in occupationData.ts — every
 *  entry's own `source` field says so, so a caller can always tell real
 *  O*NET data apart from this placeholder set once both exist side by side. */
export class LocalOccupationDataSource implements OccupationDataSource {
  private readonly careers: Career[]

  constructor(careers: Career[]) {
    this.careers = careers
  }

  async getAllCareers(): Promise<Career[]> {
    return this.careers
  }

  async getCareerById(id: string): Promise<Career | undefined> {
    return this.careers.find((c) => c.id === id)
  }
}

/** The data source this build actually uses. Swapping this line for an
 *  API-backed implementation is the entire integration surface. */
export const occupationDataSource: OccupationDataSource = new LocalOccupationDataSource(OCCUPATIONS)

/**
 * A synchronous escape hatch for the current UI and fit engine, which
 * predate this async-capable interface and aren't written to handle a
 * loading state. Safe ONLY because today's implementation resolves
 * instantly from an in-memory array — it is not a general property of
 * OccupationDataSource, and it would need to be removed (in favor of
 * actually awaiting getAllCareers()) the moment a real network-backed
 * source is plugged in. Kept in one place, clearly named, so that future
 * migration is a search for this one function, not a hunt through the
 * whole results pipeline for places that assumed synchronous data.
 */
export function getLocalCareersSync(): Career[] {
  return OCCUPATIONS
}
