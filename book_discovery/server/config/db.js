const { Pool } = require('pg');

const usesConnectionString = Boolean(process.env.DATABASE_URL);
const requiresSsl = process.env.DB_SSL === 'true'
    || process.env.DATABASE_URL?.includes('supabase.co');
const sslConfig = requiresSsl ? { rejectUnauthorized: false } : undefined;

const pool = new Pool({
    ...(usesConnectionString
        ? { connectionString: process.env.DATABASE_URL }
        : {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT) || 5432,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        }),
    ...(sslConfig ? { ssl: sslConfig } : {}),
});

const convertPlaceholders = (sql) => {
    let index = 0;
    return sql.replace(/\?/g, () => `$${++index}`);
};

const toLegacyResult = (result) => {
    if (result.command === 'SELECT') {
        return result.rows;
    }

    return {
        affectedRows: result.rowCount,
        insertId: result.rows?.[0]?.id,
        rows: result.rows,
    };
};

const query = async (sql, params = [], callback) => {
    const queryParams = Array.isArray(params) ? params : [];
    const queryCallback = typeof params === 'function' ? params : callback;

    try {
        const result = await pool.query(convertPlaceholders(sql), queryParams);
        const legacyResult = toLegacyResult(result);

        if (queryCallback) {
            queryCallback(null, legacyResult);
        }

        return legacyResult;
    } catch (error) {
        if (queryCallback) {
            queryCallback(error);
            return null;
        }

        throw error;
    }
};

pool.query('SELECT 1')
    .then(() => {
        console.log('Connected to the PostgreSQL database.');
    })
    .catch((err) => {
        console.error('Error connecting to the database:', err);
    });

module.exports = {
    query,
    pool,
};
