'use client';
import { ResourcePage } from '../components/ResourcePage';

export default function GuidesPage() {
  return (
    <ResourcePage
      title="Tour Guides"
      apiPath="/api/guides"
      columns={[
        { key: 'name', label: 'Guide Name' },
        { key: 'certification', label: 'Certification' },
        { key: 'languages', label: 'Languages' },
        { key: 'rating', label: 'Rating' },
      ]}
      renderCell={(item, key) => {
        if (key === 'rating') return <span className="text-yellow-500">{'★'.repeat(item[key] || 0)}</span>;
        if (key === 'certification') return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary">{item[key] || 'HPI Certified'}</span>;
        return item[key] || '-';
      }}
    />
  );
}
