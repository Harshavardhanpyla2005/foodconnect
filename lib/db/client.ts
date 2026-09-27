import { MongoClient, Db, MongoClientOptions } from "mongodb"

/**
 * FoodConnect — Server-Side MongoDB Client Connection Layer
 *
 * Implements a cached singleton connection pattern optimized for:
 * 1. Next.js App Router server-side route handlers and server actions.
 * 2. Hot-module reload (HMR) in development without leaking connection pools.
 * 3. Strict server-only environment protection preventing exposure to client components.
 */

// ============================================================================
// 1. CLIENT-SIDE IMPORT GUARD
// ============================================================================
if (typeof window !== "undefined") {
  throw new Error(
    "Security Violation: 'lib/db/client.ts' is a server-only module and must never be imported in client components."
  )
}

// ============================================================================
// 2. CONFIGURATION & TYPES
// ============================================================================

export interface DatabaseConnection {
  client: MongoClient
  db: Db
}

export interface DatabaseHealth {
  ok: boolean
  databaseName: string
  latencyMs?: number
  error?: string
}

declare global {
  // Attach connection promise to globalThis in development to persist across HMR
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

const DEFAULT_DB_NAME = "foodconnect"

const options: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
}

// ============================================================================
// 3. LAZY CONNECTION FACTORY
// ============================================================================

/**
 * Returns the cached MongoClient promise.
 * Lazily evaluates environment variables so importing this file during
 * static builds without MONGODB_URI does not throw at module evaluation time.
 */
export function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    throw new Error(
      "Configuration Error: 'MONGODB_URI' environment variable is not defined. " +
        "Please provide a valid connection string in your .env.local file."
    )
  }

  if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so the MongoClient is preserved
    // across module reloads caused by HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, options)
      global._mongoClientPromise = client.connect()
    }
    return global._mongoClientPromise
  }

  // In production mode, it's best not to use a global variable.
  const client = new MongoClient(uri, options)
  return client.connect()
}

// ============================================================================
// 4. DATABASE & HEALTH HELPERS
// ============================================================================

/**
 * Retrieves the connected MongoDB database instance.
 *
 * @param customDbName Optional database name override. Defaults to MONGODB_DB or "foodconnect".
 * @returns Connected Db instance.
 */
export async function getDatabase(customDbName?: string): Promise<Db> {
  const dbName = customDbName || process.env.MONGODB_DB || DEFAULT_DB_NAME
  const client = await getClientPromise()
  return client.db(dbName)
}

/**
 * Diagnostic helper to verify database connectivity.
 *
 * @returns Health status object with ping latency.
 */
export async function pingDatabase(): Promise<DatabaseHealth> {
  const dbName = process.env.MONGODB_DB || DEFAULT_DB_NAME
  const startTime = Date.now()

  try {
    const db = await getDatabase(dbName)
    // Run MongoDB ping command on admin / target database
    await db.command({ ping: 1 })
    const latencyMs = Date.now() - startTime

    return {
      ok: true,
      databaseName: dbName,
      latencyMs,
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    return {
      ok: false,
      databaseName: dbName,
      error: errorMessage,
    }
  }
}
