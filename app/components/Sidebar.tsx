'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Users', path: '/users' },
    { name: 'Roles', path: '/roles' },
  ];

  return (
    <aside className="w-64 border-r border-border h-screen bg-white hidden md:block">
      <div className="p-6">
        <h1 className="text-xl font-bold">Admin</h1>
      </div>
      <nav className="flex flex-col gap-2 p-4">
        {menuItems.map(item => (
          <Link 
            key={item.path}
            href={item.path} 
            className={`px-4 py-2 rounded-lg ${pathname === item.path ? 'bg-primary text-white' : 'hover:bg-bg'}`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
};
