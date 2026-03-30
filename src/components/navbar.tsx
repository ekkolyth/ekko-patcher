import { Link, useRouterState } from '@tanstack/react-router';
import { ThemeToggle } from '@/components/theme-toggle';
import { Cpu } from 'lucide-react';

export function Navbar() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <header className="border-b-2 border-border bg-card">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary border-2 border-border flex items-center justify-center">
              <Cpu className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">Ekko Patcher</h1>
          </div>
          <nav className="flex gap-0 border-2 border-border">
            <Link
              to="/apply"
              className={`px-4 py-1.5 text-sm font-medium transition-colors border-r-2 border-border ${
                currentPath === '/apply'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-foreground hover:bg-muted'
              }`}
            >
              Apply
            </Link>
            <Link
              to="/create"
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                currentPath === '/create'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-foreground hover:bg-muted'
              }`}
            >
              Create
            </Link>
          </nav>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
