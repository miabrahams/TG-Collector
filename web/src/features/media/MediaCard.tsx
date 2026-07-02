import { Download, Play, Star, Trash2 } from 'lucide-solid';
import { createSignal, Show } from 'solid-js';
import { currentPage, setContextMenu, setFullscreenItem } from '@gallery/state';
import { useGalleryMutations, useMediaItem, useVideoThumbnail } from './api';
import { hideInfo, searchPreferences } from '@preferences/state';
import { MediaItem } from '@shared/types/media';
import styles from './media-card.module.css';

const imageTypes = new Set(['image', 'photo', 'jpeg', 'png', 'gif']);

const isMobileViewport = () => window.matchMedia('(max-width: 768px)').matches;

const MediaCard = (props: { itemId: string }) => {
  const item = useMediaItem(() => props.itemId);
  const [hovering, setHovering] = createSignal(false);

  return (
    <article
      class={`${styles.card} rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-panel))] shadow-sm`}
      classList={{ [styles.cardHover]: hovering() }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onContextMenu={(event) => {
        event.preventDefault();
        if (item.data) {
          setContextMenu({ x: event.clientX, y: event.clientY, item: item.data });
        }
      }}
    >
      <Show when={item.isLoading}>
        <div class="flex aspect-square items-center justify-center text-sm text-[rgb(var(--color-muted))]">Loading...</div>
      </Show>

      <Show when={item.error}>
        {(error) => (
          <div class="flex aspect-square flex-col items-center justify-center gap-3 p-4 text-center text-sm text-red-600">
            <span>Error loading media: {error().message}</span>
            <button type="button" class="btn-secondary" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        )}
      </Show>

      <Show when={item.data}>
        {(mediaItem) => (
          <>
            <MediaPreview item={mediaItem()} />
            <Show when={!hideInfo()}>
              <MediaInfo item={mediaItem()} />
            </Show>
            <MediaActions item={mediaItem()} visible={hovering()} />
          </>
        )}
      </Show>
    </article>
  );
};

const MediaPreview = (props: { item: MediaItem }) => {
  const openFullscreen = () => {
    if (!isMobileViewport()) {
      setFullscreenItem(props.item);
    }
  };

  return (
    <div class="aspect-square overflow-hidden bg-black/5">
      <Show
        when={props.item.MediaType === 'video'}
        fallback={
          <Show
            when={imageTypes.has(props.item.MediaType)}
            fallback={<div class="flex h-full items-center justify-center p-4 text-sm">Unsupported media type: {props.item.MediaType}</div>}
          >
            <img
              src={`/media/${props.item.file_name}`}
              alt={props.item.file_name}
              class={styles.mediaFit}
              loading="lazy"
              onClick={openFullscreen}
            />
          </Show>
        }
      >
        <VideoPreview item={props.item} onOpen={openFullscreen} />
      </Show>
    </div>
  );
};

const VideoPreview = (props: { item: MediaItem; onOpen: () => void }) => {
  let videoRef!: HTMLVideoElement;
  let hoverTimer: number | undefined;
  const [playing, setPlaying] = createSignal(false);
  const thumbnail = useVideoThumbnail(() => props.item.id);

  const play = () => {
    window.clearTimeout(hoverTimer);
    hoverTimer = window.setTimeout(() => {
      videoRef.play().catch(() => undefined);
    }, 250);
  };

  const pause = () => {
    window.clearTimeout(hoverTimer);
    videoRef.pause();
  };

  const togglePlay = (event: MouseEvent) => {
    event.stopPropagation();
    if (videoRef.paused) {
      videoRef.play().catch(() => undefined);
    } else {
      videoRef.pause();
    }
  };

  return (
    <div class="relative h-full w-full" onClick={props.onOpen} onMouseEnter={play} onMouseLeave={pause}>
      <video
        ref={videoRef}
        src={`/media/${props.item.file_name}`}
        poster={thumbnail.isSuccess ? `/thumbnails/${thumbnail.data.fileName}` : undefined}
        class={styles.mediaFit}
        muted
        playsinline
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        class={styles.videoOverlay}
        classList={{ [styles.videoOverlayClear]: playing() }}
        aria-label={playing() ? 'Pause video preview' : 'Play video preview'}
        onClick={togglePlay}
      >
        <Show when={!playing()}>
          <Play size={48} class="text-white" />
        </Show>
      </button>
    </div>
  );
};

const MediaInfo = (props: { item: MediaItem }) => {
  return (
    <div class="space-y-1 p-3">
      <div class="flex items-start justify-between gap-2">
        <h2 class="break-words text-sm font-medium">{props.item.file_name}</h2>
        <Show when={props.item.favorite}>
          <Star size={16} class="shrink-0 fill-yellow-500 text-yellow-500" />
        </Show>
      </div>
      <p class="text-xs text-[rgb(var(--color-muted))]">Channel: {props.item.channelTitle}</p>
      <p class="text-xs text-[rgb(var(--color-muted))]">Date: {new Date(props.item.created_at).toLocaleDateString()}</p>
      <Show when={props.item.TelegramText}>
        <p class="truncate text-xs text-[rgb(var(--color-muted))]">{props.item.TelegramText}</p>
      </Show>
    </div>
  );
};

const MediaActions = (props: { item: MediaItem; visible: boolean }) => {
  const { toggleFavorite, deleteItem } = useGalleryMutations();

  const params = () => ({
    itemId: props.item.id,
    page: currentPage(),
    searchPrefs: searchPreferences(),
  });

  const stop = (event: MouseEvent, action: () => void) => {
    event.stopPropagation();
    action();
  };

  return (
    <div class={styles.actionBar} classList={{ [styles.actionBarVisible]: props.visible }}>
      <Show when={!props.item.favorite}>
        <button
          type="button"
          class="media-icon-button"
          aria-label="Delete media"
          onClick={(event) => stop(event, () => deleteItem.mutate(params()))}
        >
          <Trash2 size={16} />
        </button>
      </Show>
      <button
        type="button"
        class="media-icon-button"
        aria-label="Toggle favorite"
        onClick={(event) => stop(event, () => toggleFavorite.mutate(params()))}
      >
        <Star size={16} classList={{ 'fill-yellow-400 text-yellow-400': props.item.favorite }} />
      </button>
      <button
        type="button"
        class="media-icon-button"
        aria-label="Download media"
        onClick={(event) => stop(event, () => window.open(`/media/${props.item.file_name}`, '_blank'))}
      >
        <Download size={16} />
      </button>
    </div>
  );
};

export default MediaCard;
