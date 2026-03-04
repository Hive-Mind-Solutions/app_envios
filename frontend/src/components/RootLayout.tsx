import { Outlet, Link, useRouterState } from '@tanstack/react-router';
import { LayoutDashboard, FolderKanban, Users, CalendarCheck, Zap } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/projects', label: 'Proyectos', icon: FolderKanban, exact: false },
  { to: '/people', label: 'Personas', icon: Users, exact: false },
  { to: '/assignments', label: 'Asignaciones', icon: CalendarCheck, exact: false },
];

export function RootLayout() {
  const state = useRouterState();
  const currentPath = state.location.pathname;

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-200">
          <Zap className="w-6 h-6 text-indigo-600" />
          <span className="text-lg font-bold text-gray-900">Nebula Assign</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => {
            const isActive = exact ? currentPath === to : currentPath.startsWith(to) && to !== '/';
            const isRoot = to === '/' && currentPath === '/';
            const active = isRoot || isActive;

            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-6 py-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">v1.0.0 · Mock Data</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
