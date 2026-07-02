import { Navigate } from '@solidjs/router';
import { Match, Switch } from 'solid-js';
import { useUser } from '@auth/api';
import { LoginForm } from '@auth/AuthForms';

const LoginPage = () => {
  const user = useUser();

  return (
    <Switch>
      <Match when={user.data}>
        <Navigate href="/" />
      </Match>
      <Match when={!user.data}>
        <LoginForm />
      </Match>
    </Switch>
  );
};

export default LoginPage;
