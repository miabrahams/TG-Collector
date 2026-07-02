import { A, useNavigate } from '@solidjs/router';
import { createSignal, Show } from 'solid-js';
import { useLogin, useRegister } from './api';

type AuthError = {
  message: string;
} | null;

const readForm = (event: SubmitEvent) => {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const data = new FormData(form);

  return {
    email: String(data.get('email') ?? ''),
    password: String(data.get('password') ?? ''),
  };
};

const Alert = (props: { error: AuthError }) => {
  return (
    <Show when={props.error}>
      {(error) => (
        <div class="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error().message}
        </div>
      )}
    </Show>
  );
};

export const LoginForm = () => {
  const [error, setError] = createSignal<AuthError>(null);
  const login = useLogin();
  const navigate = useNavigate();

  const handleSubmit = (event: SubmitEvent) => {
    const payload = readForm(event);
    setError(null);

    login.mutate(payload, {
      onSuccess: () => navigate('/'),
      onError: (err) => setError({ message: err instanceof Error ? err.message : 'Login failed' }),
    });
  };

  return (
    <section class="mx-auto mt-8 max-w-md rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-panel))] p-6 shadow-sm">
      <h1 class="text-2xl font-semibold">Sign in to your account</h1>
      <form class="mt-6 space-y-4" onSubmit={handleSubmit}>
        <Alert error={error()} />
        <label class="block">
          <span class="label-text">Email</span>
          <input name="email" type="email" class="control mt-1 w-full" autocomplete="email" required />
        </label>
        <label class="block">
          <span class="label-text">Password</span>
          <input name="password" type="password" class="control mt-1 w-full" autocomplete="current-password" required />
        </label>
        <button type="submit" class="btn-primary w-full" disabled={login.isPending}>
          {login.isPending ? 'Signing in...' : 'Sign in'}
        </button>
        <p class="text-center text-sm text-[rgb(var(--color-muted))]">
          Don't have an account? <A href="/register" class="link">Register</A>
        </p>
      </form>
    </section>
  );
};

export const RegisterForm = () => {
  const [error, setError] = createSignal<AuthError>(null);
  const [success, setSuccess] = createSignal(false);
  const register = useRegister();
  const navigate = useNavigate();

  const handleSubmit = (event: SubmitEvent) => {
    const payload = readForm(event);
    setError(null);

    register.mutate(payload, {
      onSuccess: () => {
        setSuccess(true);
        window.setTimeout(() => navigate('/login'), 1200);
      },
      onError: (err) => setError({ message: err instanceof Error ? err.message : 'Registration failed' }),
    });
  };

  return (
    <section class="mx-auto mt-8 max-w-md rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-panel))] p-6 shadow-sm">
      <Show
        when={!success()}
        fallback={
          <>
            <h1 class="text-2xl font-semibold">Registration successful</h1>
            <p class="mt-4 text-[rgb(var(--color-muted))]">
              Redirecting to <A href="/login" class="link">login</A>...
            </p>
          </>
        }
      >
        <h1 class="text-2xl font-semibold">Register an account</h1>
        <form class="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Alert error={error()} />
          <label class="block">
            <span class="label-text">Email</span>
            <input name="email" type="email" class="control mt-1 w-full" autocomplete="email" required />
          </label>
          <label class="block">
            <span class="label-text">Password</span>
            <input name="password" type="password" class="control mt-1 w-full" autocomplete="new-password" required />
          </label>
          <button type="submit" class="btn-primary w-full" disabled={register.isPending}>
            {register.isPending ? 'Registering...' : 'Register'}
          </button>
          <p class="text-center text-sm text-[rgb(var(--color-muted))]">
            Already have an account? <A href="/login" class="link">Login</A>
          </p>
        </form>
      </Show>
    </section>
  );
};
