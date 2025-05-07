import { useParams } from 'react-router-dom';

function GameDetailPage() {
  const { gameId } = useParams();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
      <h2 className="text-xl font-bold mb-4">Game Details</h2>
      <p>Game ID: {gameId}</p>
      {/* Lineup will go here */}
    </div>
  );
}

export default GameDetailPage;
