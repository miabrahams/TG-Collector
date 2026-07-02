import { createEffect, createMemo, createSignal, Setter } from 'solid-js';
import { defaultPreferences } from './constants';
import { FavoriteOption, SearchPreferences, SortOption, ViewPreferences } from '@shared/types/preferences';

type SignalUpdate<T> = T | ((previous: T) => T);

const readStoredValue = <T,>(key: string, fallback: T): T => {
  if (typeof localStorage === 'undefined') return fallback;

  const stored = localStorage.getItem(key);
  if (stored === null) return fallback;

  try {
    return JSON.parse(stored) as T;
  } catch {
    return stored as T;
  }
};

const createLocalStorageSignal = <T,>(key: string, fallback: T) => {
  const [value, setValue] = createSignal<T>(readStoredValue(key, fallback));
  const setStoredValue: Setter<T> = ((next: SignalUpdate<T>) => {
    return setValue((previous) => {
      const updater = next as SignalUpdate<T>;
      const resolved = typeof updater === 'function'
        ? (updater as (previousValue: T) => T)(previous)
        : updater;

      localStorage.setItem(key, JSON.stringify(resolved));
      return resolved as T extends (...args: never[]) => unknown ? never : T;
    });
  }) as Setter<T>;

  return [value, setStoredValue] as const;
};

export const [sortMode, setSortMode] = createLocalStorageSignal<SortOption>('sortMode', defaultPreferences.search.sort);
export const [videosOnly, setVideosOnly] = createLocalStorageSignal<boolean>('videosOnly', defaultPreferences.search.videos);
export const [favoritesMode, setFavoritesMode] = createLocalStorageSignal<FavoriteOption>('showFavorites', defaultPreferences.search.favorites);
export const [searchString, setSearchString] = createLocalStorageSignal<string>('searchString', defaultPreferences.search.search);
export const [darkMode, setDarkMode] = createLocalStorageSignal<boolean>('darkmode', defaultPreferences.view.darkmode);
export const [hideInfo, setHideInfo] = createLocalStorageSignal<boolean>('hideinfo', defaultPreferences.view.hideinfo);

export const searchPreferences = createMemo<SearchPreferences>(() => ({
  sort: sortMode(),
  videos: videosOnly(),
  favorites: favoritesMode(),
  search: searchString(),
}));

export const viewPreferences = createMemo<ViewPreferences>(() => ({
  darkmode: darkMode(),
  hideinfo: hideInfo(),
}));

export const installPreferenceEffects = () => {
  createEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode());
  });

  createEffect(() => {
    document.documentElement.classList.toggle('hide-info', hideInfo());
  });

  createEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify({
      search: searchPreferences(),
      view: viewPreferences(),
    }));
  });
};
