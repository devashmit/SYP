import { Link } from 'react-router-dom';
import sahayogiLogo from '@/assets/Logo.svg';

const EXPLORE = [
  { label: 'Home', to: '/' },
  { label: 'Feed', to: '/feed' },
  { label: 'Community Needs', to: '/community-needs' },
  { label: 'About Us', to: '/about' },
];

const COMMUNITY = [
  { label: 'Create a Post', to: '/create' },
  { label: 'Community Needs', to: '/community-needs' },
  { label: 'Events', to: '/events' },
  { label: 'Volunteers', to: '/volunteers' },
];

const SUPPORT = [
  { label: 'Help Center', to: '/help' },
  { label: 'Guidelines', to: '/guidelines' },
  { label: 'Contact Us', to: '/contact' },
  { label: 'Privacy Policy', to: '/privacy' },
];

const TRUST = [
  { icon: '✓', label: 'Verified Community' },
  { icon: '🔒', label: 'Secure Platform' },
  { icon: '⚡', label: 'Real-time Updates' },
  { icon: '❤️', label: 'Community First' },
];

const Footer = () => (
  <footer style={{ background: '#F7F5F4', borderTop: '1px solid #E8E1E1' }}>
    <div className="container mx-auto px-4 max-w-5xl">

      {/* ── Main grid ── */}
      <div className="py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

        {/* Brand column */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Link to="/" className="inline-flex items-center gap-2 mb-3 group">
            <img src={sahayogiLogo} alt="Sahayogi" className="h-8 w-auto object-contain" />
            <span className="font-bold text-base" style={{ color: '#1E1B1B', letterSpacing: '-0.01em' }}>
              Sahayogi<span style={{ color: '#C96B72' }}>.</span>
            </span>
          </Link>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#7A6F6F', maxWidth: '220px' }}>
            मनदेखि सहयोग। नेपालभरिका समुदायहरूलाई मद्दत।
          </p>
          <div className="flex items-center gap-2">
            <img
              src="https://flagcdn.com/w40/np.png"
              alt="Nepal"
              style={{ height: '12px', borderRadius: '2px', opacity: 0.8 }}
            />
            <span className="text-xs font-medium" style={{ color: '#7A6F6F' }}>Kathmandu, Nepal</span>
          </div>
        </div>

        {/* Explore */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#1E1B1B' }}>Explore</p>
          <ul className="space-y-2.5">
            {EXPLORE.map(({ label, to }) => (
              <li key={label}>
                <Link
                  to={to}
                  className="text-sm transition-colors hover:text-primary"
                  style={{ color: '#7A6F6F' }}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Community */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#1E1B1B' }}>Community</p>
          <ul className="space-y-2.5">
            {COMMUNITY.map(({ label, to }) => (
              <li key={label}>
                <Link
                  to={to}
                  className="text-sm transition-colors hover:text-primary"
                  style={{ color: '#7A6F6F' }}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#1E1B1B' }}>Support</p>
          <ul className="space-y-2.5">
            {SUPPORT.map(({ label, to }) => (
              <li key={label}>
                <Link
                  to={to}
                  className="text-sm transition-colors hover:text-primary"
                  style={{ color: '#7A6F6F' }}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Trust signals ── */}
      <div
        className="py-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
        style={{ borderTop: '1px solid #E8E1E1' }}
      >
        {TRUST.map(({ icon, label }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-sm">{icon}</span>
            <span className="text-xs font-medium" style={{ color: '#7A6F6F' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Bottom bar ── */}
      <div
        className="py-4 flex flex-col sm:flex-row items-center justify-between gap-2"
        style={{ borderTop: '1px solid #E8E1E1' }}
      >
        <p className="text-xs" style={{ color: '#7A6F6F' }}>© 2024 Sahayogi Nepal</p>
        <p className="text-xs italic" style={{ color: '#7A6F6F' }}>बनाइएको माया साथ, नेपालको लागि</p>
      </div>

    </div>
  </footer>
);

export default Footer;
