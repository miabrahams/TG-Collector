import { Navigate } from '@solidjs/router';
import { Match, Switch } from 'solid-js';
import { useUser } from '@auth/api';
import { RegisterForm } from '@auth/AuthForms';

const RegisterPage = () => {
  const user = useUser();

  return (
    <Switch>
      <Match when={user.data}>
        <Navigate href="/" />
      </Match>
      <Match when={!user.data}>
        <RegisterForm />
      </Match>
    </Switch>
  );
};

export default RegisterPage;
