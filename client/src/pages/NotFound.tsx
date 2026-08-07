import { Link } from 'react-router-dom';

export const NotFound = () => (
  <div className="container-x py-32 text-center">
    <h1 className="font-display text-7xl font-bold text-gold">404</h1>
    <p className="text-xl mt-4">Page not found</p>
    <p className="text-muted mt-2">The page you're looking for doesn't exist.</p>
    <Link to="/" className="btn-primary mt-6 inline-flex">Back to Home</Link>
  </div>
);
