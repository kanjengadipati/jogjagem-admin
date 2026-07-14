'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/roles')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setRoles(data.data);
        }
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <h2 className="text-2xl font-extrabold text-gray-900">Role Management</h2>
          {loading ? (
            <p>Loading roles...</p>
          ) : (
            <div className="mt-6 bg-white rounded-xl shadow p-6">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase">
                    <th className="py-2">Role Name</th>
                    <th className="py-2">Permissions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {roles.map((role: any) => (
                    <tr key={role.id}>
                      <td className="py-3 text-sm font-semibold">{role.name}</td>
                      <td className="py-3 text-sm">{Array.isArray(role.permissions) ? role.permissions.join(', ') : role.permissions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
