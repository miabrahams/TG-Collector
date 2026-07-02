import { For } from 'solid-js';
import { favoriteOptions, sortOptions } from './constants';
import {
  favoritesMode,
  setFavoritesMode,
  setSortMode,
  setVideosOnly,
  sortMode,
  videosOnly,
} from '@preferences/state';
import { setCurrentPage } from '@gallery/state';
import { FavoriteOption, SortOption } from '@shared/types/preferences';

const SearchOptions = () => {
  const resetPage = () => setCurrentPage(1);

  return (
    <div class="flex flex-wrap items-center gap-2">
      <select
        class="control max-w-full"
        value={sortMode()}
        onChange={(event) => {
          setSortMode(event.currentTarget.value as SortOption);
          resetPage();
        }}
        aria-label="Sort order"
      >
        <For each={Object.entries(sortOptions)}>
          {([value, label]) => <option value={value}>{label}</option>}
        </For>
      </select>

      <select
        class="control max-w-full"
        value={favoritesMode()}
        onChange={(event) => {
          setFavoritesMode(event.currentTarget.value as FavoriteOption);
          resetPage();
        }}
        aria-label="Favorite filter"
      >
        <For each={Object.entries(favoriteOptions)}>
          {([value, label]) => <option value={value}>{label}</option>}
        </For>
      </select>

      <label class="inline-flex items-center gap-2 text-sm text-[rgb(var(--color-muted))]">
        <input
          type="checkbox"
          checked={videosOnly()}
          onChange={(event) => {
            setVideosOnly(event.currentTarget.checked);
            resetPage();
          }}
          class="h-4 w-4 accent-[rgb(var(--color-accent))]"
        />
        Videos only
      </label>
    </div>
  );
};

export default SearchOptions;
