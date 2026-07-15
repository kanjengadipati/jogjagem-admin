'use client';
import { ResourcePage } from '../components/ResourcePage';

export default function RentalsPage() {
  return (
    <ResourcePage
      title="Vehicle Rentals"
      apiPath="/api/rentals"
      columns={[
        { key: 'name', label: 'Company' },
        { key: 'vehicleType', label: 'Vehicle Type' },
        { key: 'dailyRate', label: 'Daily Rate' },
        { key: 'status', label: 'Status' },
      ]}
      renderCell={(item, key) => {
        if (key === 'dailyRate') return <span className="font-semibold">Rp {(item[key] || 0).toLocaleString()}</span>;
        if (key === 'status') return <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${item[key] === 'Active' ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'}`}>{item[key] || 'Active'}</span>;
        return item[key] || '-';
      }}
    />
  );
}
