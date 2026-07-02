import { Search } from 'lucide-solid';
import { searchString, setSearchString } from '@preferences/state';
import { setCurrentPage } from '@gallery/state';

const SearchBox = () => {
  return (
    <label class="relative block">
      <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-muted))]">
        <Search size={16} />
      </span>
      <input
        type="search"
        value={searchString()}
        onInput={(event) => {
          setSearchString(event.currentTarget.value);
          setCurrentPage(1);
        }}
        placeholder="Search Telegram text"
        class="control w-full pl-9"
      />
    </label>
  );
};

export default SearchBox;
