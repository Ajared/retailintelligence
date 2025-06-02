'use server';

import { UserInterface } from '~/types/user';
import customFetch from '~/lib/custom-fetch';
import { StoreInterface } from '~/types/store';

export const getAllStores = async () => {
  try {
    const response = await customFetch.get<StoreInterface[]>('/admin/stores');

    if (!('data' in response)) {
      throw new Error(response.message);
    }

    console.log('Response => ', response);

    return response.data as StoreInterface[];
  } catch (error) {
    console.log('Failed to fetch store data => ', error);
  }
};

export const getAllUsers = async () => {
  try {
    const response = await customFetch.get<UserInterface[]>('/admin/users');

    if (!('data' in response)) {
      throw new Error(response.message);
    }

    console.log('Response => ', response);
    return response.data as UserInterface[];
  } catch (error) {
    console.log('Failed to fetch users => ', error);
  }
};
