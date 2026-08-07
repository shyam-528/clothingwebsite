import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-ink/10 mt-24 bg-cream dark:bg-[#0f0f10]">
      <div className="container-x py-14 grid md:grid-cols-4 gap-10">
        <div>
          <Link to="/" className="font-display text-2xl font-bold">
            Urban<span className="text-gold">Threads</span>
          </Link>
          <p className="mt-3 text-sm text-muted leading-relaxed">
            Premium clothing for the modern wardrobe. Crafted with care, designed to last.
          </p>
          <div className="flex gap-3 mt-5">
            {[Instagram, Twitter, Facebook, Mail].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="social"
                className="h-9 w-9 grid place-items-center rounded-full border border-ink/15 hover:bg-ink hover:text-white transition"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display font-semibold mb-3">Shop</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link to="/shop?category=mens-wear" className="hover:text-ink dark:hover:text-white">Men</Link></li>
            <li><Link to="/shop?category=womens-wear" className="hover:text-ink dark:hover:text-white">Women</Link></li>
            <li><Link to="/shop?category=kids-wear" className="hover:text-ink dark:hover:text-white">Kids</Link></li>
            <li><Link to="/shop?category=footwear" className="hover:text-ink dark:hover:text-white">Footwear</Link></li>
            <li><Link to="/shop?category=accessories" className="hover:text-ink dark:hover:text-white">Accessories</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold mb-3">Help</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><a href="#" className="hover:text-ink dark:hover:text-white">Shipping</a></li>
            <li><a href="#" className="hover:text-ink dark:hover:text-white">Returns</a></li>
            <li><a href="#" className="hover:text-ink dark:hover:text-white">Size Guide</a></li>
            <li><a href="#" className="hover:text-ink dark:hover:text-white">FAQ</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold mb-3">Newsletter</h4>
          <p className="text-sm text-muted mb-3">
            Get 10% off your first order and early access to drops.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert('Thanks for subscribing!');
            }}
            className="flex gap-2"
          >
            <input
              type="email"
              required
              placeholder="Your email"
              className="input flex-1"
            />
            <button type="submit" className="btn-primary">Join</button>
          </form>
        </div>
      </div>

      <div className="border-t border-ink/10 py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} Urban Threads. All rights reserved.
      </div>
    </footer>
  );
};
