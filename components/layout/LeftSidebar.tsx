'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface MenuItem {
  label: string;
  href: string;
  isSubItem?: boolean;
}

interface MenuSection {
  icon: string;
  title: string;
  items: MenuItem[];
}

const menuStructure: MenuSection[] = [
  {
    icon: '📁',
    title: 'Organização',
    items: [
      { label: 'Início', href: '/inicio' },
      { label: 'Base', href: '/base' },
      { label: 'Áreas', href: '/areas' },
    ],
  },
  {
    icon: '📁',
    title: 'Áreas',
    items: [
      { label: 'KPIs', href: '/kpis' },
      { label: 'Tarefas', href: '/tarefas' },
      { label: 'Processos', href: '/processos' },
    ],
  },
  {
    icon: '💬',
    title: 'Conversar',
    items: [
      { label: 'Conversar', href: '/conversar' },
    ],
  },
];

export default function LeftSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary-700">Consultoria</h1>
        <p className="text-sm text-gray-500 mt-1">Gestão Organizacional</p>
      </div>

      <nav className="px-3 pb-6">
        {menuStructure.map((section, idx) => (
          <div key={idx} className="mb-6">
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <span>{section.icon}</span>
              <span>{section.title}</span>
            </div>
            <div className="space-y-1 mt-2">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'sidebar-item',
                      isActive && 'sidebar-item-active'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
