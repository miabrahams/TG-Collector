import { useNavigate } from '@solidjs/router';
import { ParentComponent } from 'solid-js';
import { useLogout, useUser } from '@auth/api';
import Navigation from '@navigation/Navigation';
import { installPreferenceEffects } from '@preferences/state';

const AppShell: ParentComponent = (props) => {
  installPreferenceEffects();

  const user = useUser();
  const logout = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => navigate('/login'),
    });
  };

  return (
    <div class="min-h-screen bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))]">
      <Navigation user={user.data ?? null} onLogout={handleLogout} />
      <main class="mx-auto w-full max-w-[1800px] px-3 py-4 sm:px-4">
        {props.children}
      </main>
      <footer class="mt-8 border-t border-[rgb(var(--color-border))] px-4 py-5 text-center text-sm text-[rgb(var(--color-muted))]">
        © 2026 Teledeck
      </footer>
    </div>
  );
};

export default AppShell;
