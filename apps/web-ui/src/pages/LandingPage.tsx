import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-24 px-8 text-center relative overflow-hidden">
        {/* Subtle diamond pattern background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30z' fill='%2315803d' fill-opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }} />
        <div className="relative">
          <h1 className="text-6xl md:text-7xl font-display text-green-900 mb-4 tracking-wide animate-fade-in-up">
            Smarter Little League Lineups
          </h1>
          <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto opacity-0 animate-fade-in-up animation-delay-100">
            Balance fairness and strategy with just a few clicks.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-lg text-lg font-semibold shadow-lg shadow-green-700/25 transition-all hover:shadow-xl hover:shadow-green-700/30 hover:-translate-y-0.5 active:scale-[0.98] opacity-0 animate-fade-in-up animation-delay-200"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-8 pb-24">
        <div className="grid md:grid-cols-3 gap-8 stagger-children">
          <FeatureCard
            icon={<ScaleIcon />}
            title="Fair Play Balancing"
            description="Every player gets infield, outfield, and rest time — no one's stuck on the bench too long."
          />
          <FeatureCard
            icon={<BoltIcon />}
            title="Fast Game Setup"
            description="Select who's coming, pick the date, and get a 4-inning lineup in seconds."
          />
          <FeatureCard
            icon={<BrainIcon />}
            title="Smart Preferences"
            description="Respect player strengths and avoid positions they don't like to play."
          />
        </div>
      </section>

      {/* Screenshot */}
      <section className="max-w-4xl mx-auto px-8 pb-24 text-center">
        <img
          src="/assets/lineup-preview.png"
          alt="Lineup preview"
          className="mx-auto rounded-xl shadow-xl border border-slate-200"
        />
      </section>

      {/* Who It's For */}
      <section className="py-20 px-8 text-center bg-green-900 text-white relative">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='8' fill='%23ffffff' fill-opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
        }} />
        <div className="relative max-w-xl mx-auto">
          <h2 className="text-4xl font-display tracking-wide mb-4">
            Built for Coaches, Loved by Parents
          </h2>
          <p className="text-lg text-green-200 mb-10">
            Simple, fair, and effective lineup planning for your whole season.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/signup"
              className="bg-white text-green-900 px-6 py-3 rounded-lg text-lg font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Sign Up
            </Link>
            <Link
              to="/login"
              className="border-2 border-green-400 text-green-100 hover:bg-green-800 px-6 py-3 rounded-lg text-lg font-semibold transition-all"
            >
              Log In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-6 text-center shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-green-200 transition-all duration-200">
      <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-green-50 text-green-700 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-display text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}

function ScaleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18" /><path d="M3 7l3-3 3 3" /><path d="M15 7l3-3 3 3" />
      <path d="M3 7v4a3 3 0 0 0 6 0V7" /><path d="M15 7v4a3 3 0 0 0 6 0V7" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a4 4 0 0 1 4 4c0 1.1-.4 2.1-1.1 2.9l-.5.5A4 4 0 0 1 16 13c0 1.1-.4 2.1-1.1 2.9A3 3 0 0 1 13 22h-2a3 3 0 0 1-1.9-6.1A4 4 0 0 1 8 13a4 4 0 0 1 1.6-3.6l-.5-.5A4 4 0 0 1 8 6a4 4 0 0 1 4-4z" />
      <path d="M12 2v20" />
    </svg>
  );
}

export default LandingPage;
