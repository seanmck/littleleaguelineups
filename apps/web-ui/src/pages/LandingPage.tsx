import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-16">

        {/* Hero Section */}
        <section className="text-center">
          <h1 className="text-5xl font-bold text-blue-800 mb-4">
            Smarter Little League Lineups
          </h1>
          <p className="text-xl text-slate-600 mb-6">
            Balance fairness and strategy with just a few clicks.
          </p>
          <Link
            to="/teams"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded text-lg"
          >
            Get Started
          </Link>
        </section>

        {/* Feature Highlights */}
        <section className="grid md:grid-cols-3 gap-8">
          <div className="bg-white border p-6 rounded shadow text-center">
            <h3 className="text-lg font-semibold mb-2">⚖ Fair Play Balancing</h3>
            <p className="text-sm text-slate-600">
              Ensure every player gets infield, outfield, and rest time — and no one's stuck on the bench too long.
            </p>
          </div>
          <div className="bg-white border p-6 rounded shadow text-center">
            <h3 className="text-lg font-semibold mb-2">⚡ Fast Game Setup</h3>
            <p className="text-sm text-slate-600">
              Select who's coming, pick the date, and get a 4-inning lineup in seconds.
            </p>
          </div>
          <div className="bg-white border p-6 rounded shadow text-center">
            <h3 className="text-lg font-semibold mb-2">🧠 Smart Preferences</h3>
            <p className="text-sm text-slate-600">
              Respect player strengths and avoid positions they don't like to play.
            </p>
          </div>
        </section>

        {/* Screenshot or Preview */}
        <section className="text-center">
          <img
            src="/assets/lineup-preview.png"
            alt="Lineup preview"
            className="mx-auto rounded shadow-md border border-slate-200"
          />
        </section>

        {/* Who It’s For */}
        <section className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Built for Coaches, Loved by Parents
          </h2>
          <p className="text-slate-600">
            Simple, fair, and effective lineup planning for your whole season.
          </p>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/teams"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded text-lg"
          >
            Create Your Team
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
