import { EyeOff, Moon } from 'lucide-solid';
import { darkMode, hideInfo, setDarkMode, setHideInfo } from '@preferences/state';

const ViewOptions = () => {
  return (
    <div class="flex items-center gap-1">
      <button
        type="button"
        class="icon-button"
        classList={{ 'is-active': darkMode() }}
        aria-label="Toggle dark mode"
        title="Toggle dark mode"
        onClick={() => setDarkMode((value) => !value)}
      >
        <Moon size={18} />
      </button>
      <button
        type="button"
        class="icon-button"
        classList={{ 'is-active': hideInfo() }}
        aria-label="Toggle media info"
        title="Toggle media info"
        onClick={() => setHideInfo((value) => !value)}
      >
        <EyeOff size={18} />
      </button>
    </div>
  );
};

export default ViewOptions;
