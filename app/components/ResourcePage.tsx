'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

interface ResourcePageProps {
  title: string;
  apiPath: string;
  columns: { key: string; label: string }[];
  renderCell: (item: any, key: string) => React.ReactNode;
}

export function ResourcePage({ title, apiPath, columns, renderCell }: ResourcePageProps) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiPath)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') {
          setData(res.data);
        }
        setLoading(false);
      });
  }, [apiPath]);

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          activeId={title.toLowerCase().replace(' ', '-')} 
          user={{ name: "Admin", role: "Super Admin", email: "admin@explorejogja.com", avatar: "https://unavatar.io/gravatar/elbhrecat@gmail.com" }} 
          currentDate={new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
        />
        <main className="flex-1 overflow-y-auto p-8">
          <h2 className="text-2xl font-extrabold text-gray-900">{title}</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="mt-6 bg-white rounded-xl shadow p-6">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase">
                    {columns.map(col => <th key={col.key} className="py-2">{col.label}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map((item: any) => (
                    <tr key={item.id}>
                      {columns.map(col => (
                        <td key={col.key} className="py-3 text-sm">{renderCell(item, col.key)}</td>
                      ))}
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
