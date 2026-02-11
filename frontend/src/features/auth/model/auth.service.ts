import { usersApi } from '@/shared/services/api/httpClient';

export type AuthInput = {
  email: string;
  password: string;
};

export async function authenticate(input: AuthInput) {
  const { data } = await usersApi.post('/auth', input);
  return data as { access_token: string };
}
