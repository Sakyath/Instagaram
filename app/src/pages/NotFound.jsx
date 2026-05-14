import { Link } from 'react-router';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-lg text-muted-foreground mb-2">Page not found</p>
      <p className="text-sm text-muted-foreground mb-6">The link you followed may be broken, or the page may have been removed.</p>
      <Link to="/" className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
        <Home className="w-4 h-4" /> Back to home
      </Link>
    </div>
  );
}
