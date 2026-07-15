'use client';
import { ResourcePage } from '../components/ResourcePage';
export default function HotelsPage() {
  return <ResourcePage title="Hotels" apiPath="/api/hotels" columns={[{key: 'name', label: 'Name'}]} renderCell={(item, key) => item[key]} />;
}
