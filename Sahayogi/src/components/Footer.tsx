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

const LinkCol = ({ title, links }: { title: string; links: { label: string; to: string }[] }) => (
  <div className="min-w-0">
    <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#1E1B1B' }}>
      {title}
    </p>
    <ul className="space-y-2">
      {links.map(({ label, to }) => (
        <li key={label}>
          <Link to={to} className="text-xs transition-colors hover:text-primary" style={{ color: '#7A6F6F' }}>
            {label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => (
  <footer style={{ background: '#F7F5F4', borderTop: '1px solid #E8E1E1' }}>
    <div className="container mx-auto px-4 max-w-5xl">

      {/* ── Main section: brand + 3 link columns always side by side ── */}
      <div className="py-8">

        {/* Top: brand + tagline in one compact row */}
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-2">
              <img src={sahayogiLogo} alt="Sahayogi" className="h-7 w-auto object-contain" />
              <span className="font-bold text-sm" style={{ color: '#1E1B1B' }}>
                Sahayogi<span style={{ color: '#C96B72' }}>.</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed" style={{ color: '#7A6F6F', maxWidth: '200px' }}>
              मनदेखि सहयोग। नेपालभरिका समुदायहरूलाई मद्दत।
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <img src="https://flagcdn.com/w40/np.png" alt="Nepal" style={{ height: '11px', borderRadius: '2px', opacity: 0.8 }} />
              <span className="text-xs" style={{ color: '#7A6F6F' }}>Kathmandu, Nepal</span>
            </div>
          </div>
          <p className="text-[10px] self-end pb-0.5" style={{ color: '#7A6F6F' }}>Built for local communities</p>
        </div>

        {/* Link columns — forced 3-column grid at ALL screen sizes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <LinkCol title="Explore" links={EXPLORE} />
          <LinkCol title="Community" links={COMMUNITY} />
          <LinkCol title="Support" links={SUPPORT} />
        </div>
      </div>

      {/* ── Trust signals ── */}
      <div
        className="py-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
        style={{ borderTop: '1px solid #E8E1E1' }}
      >
        {TRUST.map(({ icon, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="text-xs">{icon}</span>
            <span className="text-[11px] font-medium" style={{ color: '#7A6F6F' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Bottom bar ── */}
      <div
        className="py-3 flex flex-col sm:flex-row items-center justify-between gap-1"
        style={{ borderTop: '1px solid #E8E1E1' }}
      >
        <p className="text-[11px]" style={{ color: '#7A6F6F' }}>© 2024 Sahayogi Nepal</p>
        <p className="text-[11px] italic" style={{ color: '#7A6F6F' }}>बनाइएको माया साथ, नेपालको लागि</p>
      </div>

    </div>
  </footer>
);

export default Footer;
