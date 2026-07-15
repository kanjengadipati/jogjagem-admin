'use client';
import { ResourcePage } from '../components/ResourcePage';
export default function EventsPage() {
  return <ResourcePage title="Events" apiPath="/api/events" columns={[{key: 'name', label: 'Name'}]} renderCell={(item, key) => item[key]} />;
}
