import { cookies } from 'next/headers';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import Link from 'next/link';

async function fetchFromBackend(path: string, token: string) {
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8081";
  try {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    });
    return res.ok ? await res.json() : null;
  } catch { return null; }
}

async function checkHealth() {
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8081";
  try { const res = await fetch(`${BACKEND_URL}/health`, { cache: 'no-store' }); return res.ok; } catch { return false; }
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
        <main className="flex-1 overflow-y-auto p-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Dashboard</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Destinations</p>
              <p className="text-3xl font-extrabold text-primary mt-1">{destCount}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Users</p>
              <p className="text-3xl font-extrabold text-primary mt-1">{userCount}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">AI Services</p>
              <p className={`text-sm font-bold mt-2 ${aiStatus ? 'text-success' : 'text-danger'}`}>{aiStatus ? 'Enabled' : 'Disabled'}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Backend</p>
              <p className={`text-sm font-bold mt-2 ${backendConnected ? 'text-success' : 'text-danger'}`}>{backendConnected ? 'Connected' : 'Disconnected'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* SVG Visitor Chart */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Visitor Trend (7 Days)</h3>
              <svg viewBox="0 0 400 120" className="w-full">
                <defs>
                  <linearGradient id="dashGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#8B5E3C" stopOpacity="0.15"/>
                    <stop offset="100%" stopColor="#8B5E3C" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M0,100 Q50,85 100,75 T200,50 T300,35 T400,15 V120 H0 Z" fill="url(#dashGrad)" />
                <path d="M0,100 Q50,85 100,75 T200,50 T300,35 T400,15" fill="none" stroke="#8B5E3C" strokeWidth="2" />
                {[0,1,2,3,4,5,6].map(i => (
                  <circle key={i} cx={i * 66.6} cy={100 - i * 12} r="3" fill="#8B5E3C" />
                ))}
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => (
                  <text key={d} x={i * 66.6} y={118} textAnchor="middle" fontSize="8" fill="#9CA3AF">{d}</text>
                ))}
              </svg>
            </div>

            {/* AI Insights */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-sm font-bold text-gray-800 mb-4">AI Insights</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-xs font-bold text-primary">Peak Season Alert</p>
                  <p className="text-[10px] text-gray-600 mt-1">Visitor numbers expected to rise 40% in July. Consider increasing staff at top 5 destinations.</p>
                </div>
                <div className="p-3 rounded-xl bg-success/5 border border-success/10">
                  <p className="text-xs font-bold text-success">Sentiment Trend</p>
                  <p className="text-[10px] text-gray-600 mt-1">Overall review sentiment improved to 91% positive this month, up from 87%.</p>
                </div>
                <div className="p-3 rounded-xl bg-warning/5 border border-warning/10">
                  <p className="text-xs font-bold text-warning">Content Gap</p>
                  <p className="text-[10px] text-gray-600 mt-1">12 destinations lack updated descriptions. Use AI Generate to fill gaps.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Link href="/destinations/create" className="bg-white rounded-xl shadow p-4 text-center hover:border-primary/20 border border-border transition-premium">
              <p className="text-xs font-bold text-gray-800">Add Destination</p>
            </Link>
            <Link href="/reviews" className="bg-white rounded-xl shadow p-4 text-center hover:border-primary/20 border border-border transition-premium">
              <p className="text-xs font-bold text-gray-800">Moderate Reviews</p>
            </Link>
            <Link href="/ai-recommendations" className="bg-white rounded-xl shadow p-4 text-center hover:border-primary/20 border border-border transition-premium">
              <p className="text-xs font-bold text-gray-800">AI Simulator</p>
            </Link>
            <Link href="/analytics" className="bg-white rounded-xl shadow p-4 text-center hover:border-primary/20 border border-border transition-premium">
              <p className="text-xs font-bold text-gray-800">View Analytics</p>
            </Link>
          </div>

          {/* Recent Destinations */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Recent Destinations</h3>
            <table className="w-full">
              <thead>
                <tr className="text-left text-[10px] text-gray-400 uppercase tracking-wider border-b border-border">
                  <th className="pb-3 font-bold">Name</th>
                  <th className="pb-3 font-bold">Category</th>
                  <th className="pb-3 font-bold">Region</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {destinations.slice(0, 5).map((dest: any) => (
                  <tr key={dest.id} className="hover:bg-bg transition">
                    <td className="py-3 text-xs font-semibold text-gray-800">{dest.name}</td>
                    <td className="py-3 text-xs text-gray-500">{dest.category}</td>
                    <td className="py-3 text-xs text-gray-500">{dest.region}</td>
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
