import { A } from '@solidjs/router';
import { Menu } from 'lucide-solid';
import { createSignal, Show } from 'solid-js';
import { User } from '@shared/types/user';
import SearchBox from './SearchBox';
import SearchOptions from './SearchOptions';
import ViewOptions from './ViewOptions';

type NavigationProps = {
  user: User;
  onLogout: () => void;
};

const Navigation = (props: NavigationProps) => {
  const [menuOpen, setMenuOpen] = createSignal(false);

  return (
    <header class="sticky top-0 z-40 border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-nav))]/95 backdrop-blur">
      <nav class="mx-auto w-full max-w-[1800px] px-3 py-3 sm:px-4">
        <div class="hidden items-center justify-between gap-4 md:flex">
          <div class="flex min-w-0 flex-1 items-center gap-4">
            <A href="/" class="text-sm font-medium text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-text))]">
              Home
            </A>
            <A href="/about" class="text-sm font-medium text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-text))]">
              About
            </A>
            <ViewOptions />
            <SearchOptions />
            <div class="w-72">
              <SearchBox />
            </div>
          </div>

          <div class="flex items-center gap-3">
            <Show
              when={props.user}
              fallback={
                <>
                  <A href="/register" class="btn-secondary">Register</A>
                  <A href="/login" class="btn-secondary">Login</A>
                </>
              }
            >
              {(user) => (
                <>
                  <span class="max-w-64 truncate text-sm text-[rgb(var(--color-muted))]">Welcome, {user().email}</span>
                  <button type="button" class="btn-secondary" onClick={props.onLogout}>
                    Logout
                  </button>
                </>
              )}
            </Show>
          </div>
        </div>

        <div class="md:hidden">
          <div class="flex items-center gap-2">
            <div class="min-w-0 flex-1">
              <SearchBox />
            </div>
            <button
              type="button"
              class="icon-button"
              aria-label="Toggle menu"
              aria-expanded={menuOpen()}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <Menu size={20} />
            </button>
          </div>

          <Show when={menuOpen()}>
            <div class="mt-3 flex flex-col gap-3 border-t border-[rgb(var(--color-border))] pt-3">
              <div class="flex items-center gap-4">
                <A href="/" class="text-sm font-medium">Home</A>
                <A href="/about" class="text-sm font-medium">About</A>
              </div>
              <ViewOptions />
              <SearchOptions />
              <div class="flex gap-2">
                <Show
                  when={props.user}
                  fallback={
                    <>
                      <A href="/register" class="btn-secondary flex-1 text-center">Register</A>
                      <A href="/login" class="btn-secondary flex-1 text-center">Login</A>
                    </>
                  }
                >
                  <button type="button" class="btn-secondary w-full" onClick={props.onLogout}>
                    Logout
                  </button>
                </Show>
              </div>
            </div>
          </Show>
        </div>
      </nav>
    </header>
  );
};

export default Navigation;
