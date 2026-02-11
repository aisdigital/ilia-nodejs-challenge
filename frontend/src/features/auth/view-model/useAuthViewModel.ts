import { useState } from 'react';
import { authenticate } from '../model/auth.service';
import { configureHttpAuth } from '@/shared/services/api/httpClient';

type AuthState = {
  email: string;
  password: string;
  loading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  email: '',
  password: '',
  loading: false,
  error: null,
};

export function useAuthViewModel() {
  const [state, setState] = useState<AuthState>(initialState);

  const setEmail = (email: string) => setState((prev) => ({ ...prev, email }));
  const setPassword = (password: string) => setState((prev) => ({ ...prev, password }));

  const submit = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await authenticate({ email: state.email, password: state.password });
      localStorage.setItem('access_token', response.access_token);
      configureHttpAuth(response.access_token);
      setState((prev) => ({ ...prev, loading: false }));
    } catch {
      setState((prev) => ({ ...prev, loading: false, error: 'Falha ao autenticar.' }));
    }
  };

  return { state, setEmail, setPassword, submit };
}
