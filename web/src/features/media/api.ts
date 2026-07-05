import { createMutation, createQuery, QueryClient, useQueryClient } from '@tanstack/solid-query';
import { Accessor } from 'solid-js';
import { deleteItem, getMediaItem, getThumbnail, postFavorite, undoDelete } from '@shared/api/requests';
import queryKeys from '@shared/api/queryKeys';
import { MediaItem } from '@shared/types/media';
import { SearchPreferences } from '@shared/types/preferences';

export const useMediaItem = (itemId: Accessor<string>) => {
  return createQuery(() => ({
    queryKey: queryKeys.media.item(itemId()),
    queryFn: () => getMediaItem(itemId()),
    staleTime: Infinity,
    enabled: !!itemId(),
  }));
};

export const useVideoThumbnail = (itemId: Accessor<string>) => {
  return createQuery(() => ({
    queryKey: queryKeys.media.thumbnail(itemId()),
    queryFn: () => getThumbnail(itemId()),
    staleTime: Infinity,
    retry: 2,
  }));
};

type MutationParams = {
  itemId: string;
  page: number;
  searchPrefs: SearchPreferences;
};

const invalidateGallery = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ['gallery'] });
};

const updatePageItem = (
  queryClient: QueryClient,
  { searchPrefs, page }: Pick<MutationParams, 'searchPrefs' | 'page'>,
  updater: (item: MediaItem) => MediaItem
) => {
  const pageIdKey = queryKeys.gallery.ids(searchPrefs, page);
  const currentPage = queryClient.getQueryData<MediaItem[]>(pageIdKey);

  if (currentPage) {
    queryClient.setQueryData(
      pageIdKey,
      currentPage.map((item) => updater(item))
    );
  }
};

export const optimisticRemove = (
  queryClient: QueryClient,
  { itemId, searchPrefs, page }: MutationParams
) => {
  const pageIdKey = queryKeys.gallery.ids(searchPrefs, page);
  const currentPage = queryClient.getQueryData<MediaItem[]>(pageIdKey);

  if (currentPage) {
    queryClient.setQueryData(
      pageIdKey,
      currentPage.filter((item) => item.id !== itemId)
    );
  }
};

export const optimisticAdd = (
  queryClient: QueryClient,
  mediaItem: MediaItem,
  { searchPrefs, page }: MutationParams
) => {
  const pageIdKey = queryKeys.gallery.ids(searchPrefs, page);
  const currentPage = queryClient.getQueryData<MediaItem[]>(pageIdKey);

  if (currentPage) {
    queryClient.setQueryData(queryKeys.media.item(mediaItem.id), mediaItem);
    queryClient.setQueryData(pageIdKey, [...currentPage, mediaItem]);
  }
};

export const useGalleryMutations = () => {
  const queryClient = useQueryClient();

  const toggleFavorite = createMutation(() => ({
    mutationFn: async (params: MutationParams) => {
      const itemKey = queryKeys.media.item(params.itemId);
      const mediaItem = queryClient.getQueryData<MediaItem>(itemKey);

      if (mediaItem) {
        queryClient.setQueryData(itemKey, {
          ...mediaItem,
          favorite: !mediaItem.favorite,
        });
      }

      updatePageItem(queryClient, params, (item) => {
        if (item.id !== params.itemId) return item;
        return {
          ...item,
          favorite: !item.favorite,
        };
      });

      if (params.searchPrefs.favorites !== 'all') {
        optimisticRemove(queryClient, params);
      }

      return postFavorite(params.itemId);
    },
    onSuccess: (updatedItem, variables) => {
      queryClient.setQueryData(queryKeys.media.item(updatedItem.id), updatedItem);
      updatePageItem(queryClient, variables, (item) => {
        if (item.id !== updatedItem.id) return item;
        return updatedItem;
      });

      if (variables.searchPrefs.favorites !== 'all') {
        invalidateGallery(queryClient);
      }
    },
  }));

  const deleteMediaItem = createMutation(() => ({
    mutationFn: async (params: MutationParams) => {
      optimisticRemove(queryClient, params);
      return deleteItem(params.itemId, params.searchPrefs, params.page);
    },
    onSuccess: (mediaItem, params) => {
      if (mediaItem) {
        optimisticAdd(queryClient, mediaItem, params);
      }
      invalidateGallery(queryClient);
    },
  }));

  const restoreDeletedItem = createMutation(() => ({
    mutationFn: undoDelete,
    onSuccess: (restoredItem) => {
      if (restoredItem) {
        queryClient.setQueryData(queryKeys.media.item(restoredItem.id), restoredItem);
        invalidateGallery(queryClient);
      }
    },
  }));

  return {
    toggleFavorite,
    deleteItem: deleteMediaItem,
    undoDelete: restoreDeletedItem,
  };
};
