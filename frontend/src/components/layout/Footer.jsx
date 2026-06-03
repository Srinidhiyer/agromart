import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const footerLinks = {
  Products: [
    { label: 'Organic Manure', to: '/products?category=organic-manure' },
    { label: 'Pesticides', to: '/products?category=agricultural-pesticides' },
    { label: 'Bio-fertilizers', to: '/products?category=bio-fertilizers' },
    { label: 'Featured Products', to: '/products?featured=true' },
  ],
  Company: [
    { label: 'About Us', to: '#' },
    { label: 'Contact', to: '#' },
    { label: 'Blog', to: '#' },
    { label: 'Careers', to: '#' },
  ],
  Support: [
    { label: 'Help Center', to: '#' },
    { label: 'Track Order', to: '/orders' },
    { label: 'Return Policy', to: '#' },
    { label: 'Privacy Policy', to: '#' },
  ],
}

const socialLinks = [
  { label: 'Twitter', href: '#', icon: 'X' },
  { label: 'Instagram', href: '#', icon: '📸' },
  { label: 'Facebook', href: '#', icon: 'f' },
  { label: 'YouTube', href: '#', icon: '▶' },
]

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-dark text-gray-300 border-t border-gray-800">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-white text-lg">
                🌿
              </div>
              <span className="font-heading font-bold text-xl text-white">
                Agro<span className="text-primary-500">Mart</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
              India's most trusted platform for premium agriculture supplies. We deliver verified pesticides, 
              organic manures, and bio-fertilizers right to your farm door.
            </p>

            {/* Delivery badge */}
            <div className="flex items-center gap-3 bg-primary-900/30 border border-primary-800 rounded-xl p-3 max-w-xs mb-6">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="text-white font-semibold text-sm">2-3 Hour Delivery</p>
                <p className="text-gray-400 text-xs">Available in 50+ cities across India</p>
              </div>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center text-sm transition-colors duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-heading font-semibold text-white mb-4">{title}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-gray-400 hover:text-primary-400 text-sm transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-10 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="font-heading font-bold text-white text-lg mb-1">Stay updated with farming tips 🌱</h3>
              <p className="text-gray-400 text-sm">Get seasonal deals and agriculture insights delivered to your inbox.</p>
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex gap-2 w-full md:w-auto"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="input bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-primary-500 flex-1 min-w-0 md:w-64"
                id="newsletter-email"
              />
              <button type="submit" className="btn btn-primary btn-md flex-shrink-0">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-sm text-center">
            © {new Date().getFullYear()} AgroMart. All rights reserved. Made with 💚 for Indian Farmers.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-gray-500 text-xs">Secured by</span>
            <div className="flex items-center gap-2">
              {['SSL', 'Razorpay', 'Stripe'].map((badge) => (
                <span
                  key={badge}
                  className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded border border-gray-700"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
