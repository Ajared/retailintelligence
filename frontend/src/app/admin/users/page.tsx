'use server';

import Content from './content';
import { Suspense } from 'react';
import { getAllUsers } from '../actions';
import EmptyState from '../_components/empty';

export default async function UsersPage() {
  const users = getAllUsers();
  return (
    <Suspense fallback={<EmptyState />}>
      <Content users={users} />
    </Suspense>
  );
}
