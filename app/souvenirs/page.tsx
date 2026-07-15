'use client';
import { ResourcePage } from '../components/ResourcePage';

export default function SouvenirsPage() {
  return (
    <ResourcePage
      title="Souvenirs & Crafts"
      apiPath="/api/souvenirs"
      columns={[
        { key: 'name', label: 'Shop Name' },
        { key: 'specialty', label: 'Specialty' },
        { key: 'location', label: 'Location' },
        { key: 'status', label: 'Status' },
      ]}
      renderCell={(item, key) => {
        if (key === 'status') return <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${item[key] === 'Active' ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'}`}>{item[key] || 'Active'}</span>;
        return item[key] || '-';
      }}
    />
  );
}
