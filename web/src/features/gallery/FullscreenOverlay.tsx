import { X } from 'lucide-solid';
import { createEffect, onCleanup, Show } from 'solid-js';
import { MediaItem } from '@shared/types/media';

const FullscreenOverlay = (props: { item: MediaItem; onClose: () => void }) => {
  createEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') props.onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    onCleanup(() => document.removeEventListener('keydown', onKeyDown));
  });

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" onClick={props.onClose}>
      <button
        type="button"
        class="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
        aria-label="Close fullscreen view"
        onClick={props.onClose}
      >
        <X size={24} />
      </button>
      <Show
        when={props.item.MediaType === 'video'}
        fallback={
          <img
            src={`/media/${props.item.file_name}`}
            alt={props.item.file_name}
            class="max-h-[90vh] max-w-full rounded-md object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        }
      >
        <video
          src={`/media/${props.item.file_name}`}
          class="max-h-[90vh] max-w-full rounded-md"
          controls
          autoplay
          onClick={(event) => event.stopPropagation()}
        />
      </Show>
    </div>
  );
};

export default FullscreenOverlay;
