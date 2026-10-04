import api from '@/lib/api';

export interface UserMe {
  id: number;
  full_name: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
}

export interface UserUpdate {
  full_name?: string;
  email?: string;
}

export async function getCurrentUser(): Promise<UserMe> {
  const { data } = await api.get<UserMe>('/users/me');
  return data;
}

export async function updateUser(id: number, payload: UserUpdate): Promise<UserMe> {
  const { data } = await api.patch<UserMe>(`/users/${id}`, payload);
  return data;
}
