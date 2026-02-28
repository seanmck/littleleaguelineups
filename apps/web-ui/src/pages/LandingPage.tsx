import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="min-h-screen font-sans">
      {/* Hero */}
      <section className="py-20 px-8 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-blue-800 mb-4 tracking-tight">
          Smarter Little League Lineups
        </h1>
        <p className="text-xl text-slate-500 mb-8 max-w-2xl mx-auto">
          Balance fairness and strategy with just a few clicks.
        </p>
        <Link
          to="/signup"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl hover:shadow-blue-600/30"
        >
          Get Started Free
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-8 pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon="&#9878;"
            title="Fair Play Balancing"
            description="Every player gets infield, outfield, and rest time — no one's stuck on the bench too long."
          />
          <FeatureCard
            icon="&#9889;"
            title="Fast Game Setup"
            description="Select who's coming, pick the date, and get a 4-inning lineup in seconds."
          />
          <FeatureCard
            icon="&#129504;"
            title="Smart Preferences"
            description="Respect player strengths and avoid positions they don't like to play."
          />
        </div>
      </section>

      {/* Screenshot */}
      <section className="max-w-4xl mx-auto px-8 pb-20 text-center">
        <img
          src="/assets/lineup-preview.png"
          alt="Lineup preview"
          className="mx-auto rounded-xl shadow-xl border border-slate-200"
        />
      </section>

      {/* Who It's For */}
      <section className="py-16 px-8 text-center bg-white/60">
        <h2 className="text-3xl font-bold text-slate-800 mb-3">
          Built for Coaches, Loved by Parents
        </h2>
        <p className="text-lg text-slate-500 mb-8 max-w-xl mx-auto">
          Simple, fair, and effective lineup planning for your whole season.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/signup"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-colors"
          >
            Sign Up
          </Link>
          <Link
            to="/login"
            className="bg-white border border-slate-300 hover:border-slate-400 text-slate-700 px-6 py-3 rounded-lg text-lg font-semibold transition-colors"
          >
            Log In
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}

export default LandingPage;
