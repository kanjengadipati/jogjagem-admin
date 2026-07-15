import { cookies } from 'next/headers';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

async function fetchFromBackend(path: string, token: string) {
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8081";
  try {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

async function checkHealth() {
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8081";
  try {
    const res = await fetch(`${BACKEND_URL}/health`, { cache: 'no-store' });
    return res.ok;
  } catch {
    return false;
  }
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value || '';
  
  const [destRes, userRes, backendConnected] = await Promise.all([
    fetchFromBackend('/destinations', token),
    fetchFromBackend('/auth/admin/users', token),
    checkHealth()
  ]);

  const destinations = destRes?.data || [];
  const destCount = destinations.length;
  const userCount = Array.isArray(userRes?.data) ? userRes.data.length : 0;
  const aiStatus = !!process.env.GEMINI_API_KEY;
  
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-lg font-semibold">Destinations</h2>
              <p className="text-3xl font-bold text-primary">{destCount}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-lg font-semibold">Users</h2>
              <p className="text-3xl font-bold text-primary">{userCount}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-lg font-semibold">AI Services</h2>
              <p className={`text-sm font-bold ${aiStatus ? 'text-green-600' : 'text-red-600'}`}>{aiStatus ? 'Enabled' : 'Disabled'}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-lg font-semibold">Backend</h2>
              <p className={`text-sm font-bold ${backendConnected ? 'text-green-600' : 'text-red-600'}`}>{backendConnected ? 'Connected' : 'Disconnected'}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Destinations</h2>
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase border-b">
                  <th className="py-2">Name</th>
                  <th className="py-2">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {destinations.slice(0, 5).map((dest: any) => (
                  <tr key={dest.id}>
                    <td className="py-3 text-sm">{dest.name}</td>
                    <td className="py-3 text-sm">{dest.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
