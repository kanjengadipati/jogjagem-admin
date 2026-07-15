'use client';
import { ResourcePage } from '../components/ResourcePage';

export default function RestaurantsPage() {
  return (
    <ResourcePage
      title="Restaurants"
      apiPath="/api/restaurants"
      columns={[
        { key: 'name', label: 'Restaurant' },
        { key: 'cuisine', label: 'Cuisine' },
        { key: 'rating', label: 'Rating' },
        { key: 'status', label: 'Status' },
      ]}
      renderCell={(item, key) => {
        if (key === 'rating') return <span className="text-yellow-500">{'★'.repeat(item[key] || 0)}</span>;
        if (key === 'status') return <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${item[key] === 'Active' ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'}`}>{item[key] || 'Active'}</span>;
        return item[key] || '-';
      }}
    />
  );
}
