import { drizzle, NeonDatabase } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

type Database = NeonDatabase<typeof schema>;

// Create a singleton database client
let dbInstance: Database | null = null;
let sqlInstance: ReturnType<typeof neon> | null = null;

export function getDb(): Database {
    if (!dbInstance) {
        dbInstance = drizzle(process.env.DATABASE_URL!, { schema });
    }
    return dbInstance;
}

// Get raw SQL client for queries
function getSql() {
    if (!sqlInstance) {
        sqlInstance = neon(process.env.DATABASE_URL!);
    }
    return sqlInstance;
}

// Raw SQL query function for non-Drizzle queries
export async function query(sqlString: string, params?: unknown[]) {
    const sqlClient = getSql();
    const rows = params
        ? await (sqlClient as any).query(sqlString, params)
        : await (sqlClient as any)(sqlString);
    return { rows };
}

// Export db for direct use
export const db = getDb();

// Re-export schema for convenience
export { schema };
