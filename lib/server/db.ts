import { Pool, QueryResult } from "pg";

type QueryConfig = {
    text: string;
    values?: unknown[];
};

const parseBoolean = (value: string | undefined, fallback: boolean) => {
    if (value === undefined) return fallback;
    const normalized = value.toLowerCase();
    if (["1", "true", "yes", "on"].includes(normalized)) return true;
    if (["0", "false", "no", "off"].includes(normalized)) return false;
    return fallback;
};

const pool = new Pool({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 5432,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    ssl: parseBoolean(process.env.DATABASE_SSL, true)
        ? { rejectUnauthorized: false }
        : undefined,
    application_name: "acc-rpa-config",
});

export const query = async <T>(
    textOrConfig: string | QueryConfig,
    values: unknown[] = [],
): Promise<QueryResult<T>> => {
    const client = await pool.connect();
    try {
        if (typeof textOrConfig === "string") {
            return await client.query<T>(textOrConfig, values);
        }
        return await client.query<T>(textOrConfig);
    } finally {
        client.release();
    }
};

export const closePool = async () => {
    await pool.end();
};

