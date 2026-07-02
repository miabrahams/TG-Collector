import { createSignal } from 'solid-js';
import { MediaItem } from '@shared/types/media';

export type ContextMenuState = {
  x: number;
  y: number;
  item: MediaItem;
};

export const [currentPage, setCurrentPage] = createSignal(1);
export const [fullscreenItem, setFullscreenItem] = createSignal<MediaItem | null>(null);
export const [contextMenu, setContextMenu] = createSignal<ContextMenuState | null>(null);
