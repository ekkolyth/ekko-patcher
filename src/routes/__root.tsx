import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Providers } from '@/components/providers';
import { Navbar } from '@/components/navbar';

export const Route = createRootRoute({
  component: () => (
    <Providers>
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col">
          <Outlet />
        </main>
      </div>
    </Providers>
  ),
});
