import { ChevronLeft, ChevronRight, Download, RotateCcw, Star, Tag, Trash2 } from 'lucide-solid';
import { createEffect, createMemo, For, onCleanup, Show } from 'solid-js';
import { useDeletePage, useGallery, useTotalPages } from './api';
import { contextMenu, currentPage, fullscreenItem, setContextMenu, setCurrentPage, setFullscreenItem } from './state';
import { useGalleryMutations } from '@media/api';
import MediaCard from '@media/MediaCard';
import { searchPreferences } from '@preferences/state';
import FullscreenOverlay from './FullscreenOverlay';

const Gallery = () => {
  const totalPagesQuery = useTotalPages(searchPreferences);
  const totalPages = () => totalPagesQuery.data ?? 1;
  const gallery = useGallery(searchPreferences, currentPage);

  const changePage = (page: number) => {
    const nextPage = Math.max(1, Math.min(page, totalPages()));
    setCurrentPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextPage = () => changePage(currentPage() + 1);
  const previousPage = () => changePage(currentPage() - 1);

  createEffect(() => {
    if (currentPage() > totalPages()) {
      setCurrentPage(totalPages());
    }
  });

  createEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) return;
      if (fullscreenItem()) return;
      if (event.key === 'ArrowRight') nextPage();
      if (event.key === 'ArrowLeft') previousPage();
    };

    window.addEventListener('keydown', onKeyDown);
    onCleanup(() => window.removeEventListener('keydown', onKeyDown));
  });

  return (
    <div id="media-index" class="space-y-4">
      <Pagination
        currentPage={currentPage()}
        totalPages={totalPages()}
        hasPreviousPage={currentPage() > 1}
        hasNextPage={currentPage() < totalPages()}
        previousPage={previousPage}
        nextPage={nextPage}
        changePage={changePage}
        itemIds={gallery.data?.map((item) => item.id) ?? []}
      />

      <Show when={gallery.isLoading}>
        <LoadStatus />
      </Show>

      <Show when={gallery.error}>
        {(error) => <ErrorStatus message={error().message} />}
      </Show>

      <Show when={!gallery.isLoading && !gallery.error && gallery.data?.length === 0}>
        <EmptyStatus />
      </Show>

      <Show when={!gallery.isLoading && !gallery.error && gallery.data && gallery.data.length > 0}>
        <section class="relative">
          <div class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,360px),1fr))] gap-4">
            <For each={gallery.data}>
              {(mediaItem) => <MediaCard itemId={mediaItem.id} />}
            </For>
          </div>
          <UndoButton />
        </section>
      </Show>

      <Pagination
        currentPage={currentPage()}
        totalPages={totalPages()}
        hasPreviousPage={currentPage() > 1}
        hasNextPage={currentPage() < totalPages()}
        previousPage={previousPage}
        nextPage={nextPage}
        changePage={changePage}
        itemIds={gallery.data?.map((item) => item.id) ?? []}
      />

      <Show when={contextMenu()}>
        {(state) => <ContextMenu state={state()} />}
      </Show>

      <Show when={fullscreenItem()}>
        {(item) => <FullscreenOverlay item={item()} onClose={() => setFullscreenItem(null)} />}
      </Show>
    </div>
  );
};

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  previousPage: () => void;
  nextPage: () => void;
  changePage: (page: number) => void;
  itemIds: string[];
};

const Pagination = (props: PaginationProps) => {
  const deletePageMutation = useDeletePage();

  const pageNumbers = createMemo(() => {
    const numbers: number[] = [];
    const range = 2;

    for (let page = 1; page <= props.totalPages; page += 1) {
      if (page === 1 || page === props.totalPages || (page >= props.currentPage - range && page <= props.currentPage + range)) {
        numbers.push(page);
      } else if (numbers[numbers.length - 1] !== -1) {
        numbers.push(-1);
      }
    }

    return numbers;
  });

  const clearPage = () => {
    if (props.itemIds.length === 0) return;

    deletePageMutation.mutate({
      itemIds: props.itemIds,
      preferences: searchPreferences(),
      page: props.currentPage,
    });
  };

  return (
    <div class="flex flex-col items-center gap-3 border-t border-[rgb(var(--color-border))] py-4">
      <div class="flex w-full flex-wrap items-center justify-center gap-2">
        <button type="button" class="btn-secondary" disabled={!props.hasPreviousPage} onClick={props.previousPage}>
          <ChevronLeft size={16} />
          Previous
        </button>

        <div class="flex max-w-full items-center gap-2 overflow-x-auto px-1">
          <For each={pageNumbers()}>
            {(page) => (
              <Show
                when={page !== -1}
                fallback={<span class="px-1 text-sm text-[rgb(var(--color-muted))]">...</span>}
              >
                <button
                  type="button"
                  class="page-button"
                  classList={{ 'is-current': props.currentPage === page }}
                  onClick={() => props.changePage(page)}
                  aria-label={`Go to page ${page}`}
                >
                  {page}
                </button>
              </Show>
            )}
          </For>
        </div>

        <button type="button" class="btn-secondary" disabled={!props.hasNextPage} onClick={props.nextPage}>
          Next
          <ChevronRight size={16} />
        </button>

        <button
          type="button"
          class="btn-danger"
          disabled={props.itemIds.length === 0 || deletePageMutation.isPending}
          onClick={() => {
            const ok = window.confirm(`Delete all ${props.itemIds.length} items on this page? Favorite items will be skipped.`);
            if (ok) clearPage();
          }}
        >
          <Trash2 size={16} />
          {deletePageMutation.isPending ? 'Deleting...' : 'Clear Page'}
        </button>
      </div>

      <p class="text-sm text-[rgb(var(--color-muted))]">
        Page {props.currentPage} of {props.totalPages}
      </p>
    </div>
  );
};

const LoadStatus = () => (
  <div class="flex min-h-64 items-center justify-center text-sm text-[rgb(var(--color-muted))]">Loading media...</div>
);

const EmptyStatus = () => (
  <div class="flex min-h-64 items-center justify-center rounded-md border border-dashed border-[rgb(var(--color-border))] text-sm text-[rgb(var(--color-muted))]">
    No media found
  </div>
);

const ErrorStatus = (props: { message: string }) => (
  <div class="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-800">
    <div class="font-semibold">Error loading media</div>
    <p class="mt-1">{props.message}</p>
    <button type="button" class="btn-danger mt-3" onClick={() => window.location.reload()}>
      Retry
    </button>
  </div>
);

const UndoButton = () => {
  const { undoDelete } = useGalleryMutations();

  return (
    <button
      type="button"
      class="fixed bottom-5 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-orange-600 text-white shadow-lg transition hover:scale-105 hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={undoDelete.isPending}
      aria-label="Undo delete"
      onClick={() => undoDelete.mutate()}
    >
      <RotateCcw size={22} />
    </button>
  );
};

const ContextMenu = (props: { state: NonNullable<ReturnType<typeof contextMenu>> }) => {
  let menuRef!: HTMLDivElement;
  const { toggleFavorite, deleteItem } = useGalleryMutations();

  createEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (menuRef && !menuRef.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    onCleanup(() => document.removeEventListener('pointerdown', onPointerDown));
  });

  const run = (action: () => void) => {
    action();
    setContextMenu(null);
  };

  return (
    <div
      ref={menuRef}
      class="fixed z-50 min-w-44 rounded-md border border-zinc-700 bg-zinc-950 p-1 text-sm text-zinc-100 shadow-xl"
      style={{ left: `${props.state.x}px`, top: `${props.state.y}px` }}
    >
      <button type="button" class="context-menu-item" onClick={() => run(() => window.open(`/media/${props.state.item.file_name}`, '_blank'))}>
        <Download size={16} />
        Download
      </button>
      <button
        type="button"
        class="context-menu-item"
        onClick={() => run(() => toggleFavorite.mutate({
          itemId: props.state.item.id,
          page: currentPage(),
          searchPrefs: searchPreferences(),
        }))}
      >
        <Star size={16} />
        Favorite
      </button>
      <button
        type="button"
        class="context-menu-item"
        onClick={() => run(() => deleteItem.mutate({
          itemId: props.state.item.id,
          page: currentPage(),
          searchPrefs: searchPreferences(),
        }))}
      >
        <Trash2 size={16} />
        Delete
      </button>
      <button type="button" class="context-menu-item" onClick={() => run(() => console.log("NOT IMPLEMENTED: 'tags'"))}>
        <Tag size={16} />
        Tags
      </button>
    </div>
  );
};

export default Gallery;
