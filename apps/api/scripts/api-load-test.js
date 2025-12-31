import fetch from 'node-fetch';
const API_BASE = process.env.API_BASE || 'http://localhost:3000/api';
const hammer = async () => {
    console.log('🔨 Starting hammer run...');
    for (let i = 0; i < 1000; i++) {
        // Simulate team creation
        const teamRes = await fetch(`${API_BASE}/teams`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: `Test Team ${Date.now()}-${i}` }),
        });
        const team = await teamRes.json();
        console.log(`🆕 Created team ${team.name}`);
        // Add some players
        for (let j = 0; j < 9; j++) {
            await fetch(`${API_BASE}/teams/${team.id}/players`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: `Player ${j}` }),
            });
        }
        const playerListRes = await fetch(`${API_BASE}/teams/${team.id}/players`);
        const players = await playerListRes.json();
        // Create a game with today's date and all players
        await fetch(`${API_BASE}/teams/${team.id}/games`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                date: new Date().toISOString(),
                playerIds: players.map((p) => p.id),
            }),
        });
        console.log(`🎯 Created game with ${players.length} players`);
    }
    console.log('✅ Hammer complete!');
};
hammer().catch(err => console.error('🔥 Hammer failed:', err));
