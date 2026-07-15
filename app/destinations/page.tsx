'use client';

import { ResourcePage } from '../components/ResourcePage';

export default function DestinationsPage() {
  return (
    <ResourcePage
      title="Destinations"
      apiPath="/api/destinations"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'category', label: 'Category' },
        { key: 'region', label: 'Region' }
      ]}
      renderCell={(item, key) => item[key]}
    />
  );
}
