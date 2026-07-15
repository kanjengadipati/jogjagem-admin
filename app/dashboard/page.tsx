import { cookies } from 'next/headers';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

async function fetchFromBackend(path: string, token: string) {
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8081";
  const res = await fetch(`${BACKEND_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });
  return res.ok ? res.json() : null;
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value || '';
  
  const [destRes, userRes] = await Promise.all([
    fetchFromBackend('/destinations', token),
    fetchFromBackend('/auth/admin/users', token),
  ]);

  const destCount = destRes?.data?.length || 0;
  const userCount = Array.isArray(userRes?.data) ? userRes.data.length : 0;
  
  const user = {
    name: "Admin Jogjagem",
    role: "Super Admin",
    email: "admin@explorejogja.com",
    avatar: "https://unavatar.io/gravatar/elbhrecat@gmail.com",
  };
  
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header 
          activeId="dashboard" 
          user={user} 
          currentDate={new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
        />
        <main className="p-8">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-lg font-semibold">Total Destinations</h2>
              <p className="text-3xl font-bold text-primary">{destCount}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-lg font-semibold">Total Users</h2>
              <p className="text-3xl font-bold text-primary">{userCount}</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
