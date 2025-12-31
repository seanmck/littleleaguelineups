import { Client } from 'pg';
const { PG_HOST, PG_USER, PG_PASSWORD, PG_DB } = process.env;
if (!PG_HOST || !PG_USER || !PG_PASSWORD || !PG_DB) {
    throw new Error('Missing required database environment variables');
}
const client = new Client({
    host: PG_HOST,
    user: PG_USER,
    password: PG_PASSWORD,
    database: PG_DB,
    port: 5432,
    ssl: {
        rejectUnauthorized: false, // Set to true in production with a valid certificate
    }
});
const resetDatabase = async () => {
    try {
        console.log('🔗 Connecting to the database...');
        await client.connect();
        console.log('⚠️ Wiping existing data...');
        await client.query(`
      TRUNCATE TABLE "Game", "Player", "Team", "_GamePlayers" RESTART IDENTITY CASCADE
    `);
        /*
        console.log('🆕 Adding sample data...');
    
        // Insert sample teams
        const team1 = await client.query(
          `INSERT INTO "Team" (name) VALUES ($1) RETURNING id`,
          ['Sample Team 1']
        );
        const team2 = await client.query(
          `INSERT INTO "Team" (name) VALUES ($1) RETURNING id`,
          ['Sample Team 2']
        );
    
        const team1Id = team1.rows[0].id;
        const team2Id = team2.rows[0].id;
    
        // Insert sample players for Team 1
        for (let i = 1; i <= 9; i++) {
          await client.query(
            `INSERT INTO "Player" (name, team_id) VALUES ($1, $2)`,
            [`Player ${i} (Team 1)`, team1Id]
          );
        }
    
        // Insert sample players for Team 2
        for (let i = 1; i <= 9; i++) {
          await client.query(
            `INSERT INTO Player (name, team_id) VALUES ($1, $2)`,
            [`Player ${i} (Team 2)`, team2Id]
          );
        }
    
        */
        console.log('✅ Database reset and sample data added!');
    }
    catch (err) {
        console.error('❌ Error resetting database:', err);
    }
    finally {
        await client.end();
        console.log('🔌 Disconnected from the database');
    }
};
resetDatabase().catch(err => console.error('🔥 Script failed:', err));
