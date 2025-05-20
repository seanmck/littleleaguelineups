// components/Navbar.tsx
import React from 'react';

export default function Navbar() {
  return (
    <nav className="bg-blue-800 text-white px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Little League Coach</h1>
      <div className="flex items-center space-x-6">
        <a href="#" className="hover:underline">Rosters</a>
        <a href="/teams/1/games/setup" className="hover:underline">Lineups</a>
        <button className="bg-white text-blue-800 font-semibold px-4 py-1 rounded hover:bg-blue-100 transition">
          Log out
        </button>
      </div>
    </nav>
  );
}
