import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://listify:listify_secret@localhost:5432/listify',
});
const db = drizzle(pool);

async function main() {
  const result = await db.execute(`UPDATE users SET background_color = '#FFFFFF', is_public = true RETURNING id;`);
  if (result.rows.length > 0) {
    console.log(`Updated user ID: ${result.rows[0].id}`);
    console.log(`URL: http://localhost:5173/#/user/${result.rows[0].id}`);
  } else {
    console.log("No users found.");
  }
  process.exit(0);
}

main().catch(console.error);
