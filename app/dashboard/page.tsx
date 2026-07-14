import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

export default async function DashboardPage() {
  // In a real app, fetch data from backend here
  const user = {
    name: "Admin Jogjagem",
    role: "Super Admin",
    email: "admin@explorejogja.com",
    avatar: "https://unavatar.io/gravatar/elbhrecat@gmail.com",
  };
  
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Header activeId="dashboard" user={user} currentDate="Today" />
        <main className="p-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p>Welcome to the admin dashboard.</p>
        </main>
      </div>
    </div>
  );
}
