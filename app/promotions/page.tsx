'use client';
import { ResourcePage } from '../components/ResourcePage';
import { Tag } from 'lucide-react';

export default function PromotionsPage() {
  return (
    <ResourcePage
      title="Promotions & Campaigns"
      apiPath="/api/promotions"
      columns={[
        { key: 'code', label: 'Code' },
        { key: 'name', label: 'Campaign' },
        { key: 'discount', label: 'Discount' },
        { key: 'validUntil', label: 'Valid Until' },
        { key: 'status', label: 'Status' },
      ]}
      renderCell={(item, key) => {
        if (key === 'code') return <span className="font-mono text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded">{item[key]}</span>;
        if (key === 'status') return <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${item[key] === 'Active' ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'}`}>{item[key] || 'Active'}</span>;
        return item[key] || '-';
      }}
    />
  );
}
