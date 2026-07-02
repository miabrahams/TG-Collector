import { createMutation, createQuery, QueryClient, useQueryClient } from '@tanstack/solid-query';
import { Accessor } from 'solid-js';
import { deletePage, getGalleryIds, getGalleryPage, getTotalPages } from '@shared/api/requests';
import queryKeys from '@shared/api/queryKeys';
import { ApiError } from '@shared/types/api';
import { MediaID } from '@shared/types/media';
import { SearchPreferences } from '@shared/types/preferences';

export const useTotalPages = (preferences: Accessor<SearchPreferences>) => {
  return createQuery(() => ({
    queryKey: queryKeys.gallery.numPages(preferences()),
    queryFn: async () => {
      const response = await getTotalPages(preferences());
      return response.totalPages;
    },
  }));
};

export const useGalleryIds = (preferences: Accessor<SearchPreferences>, page: Accessor<number>) => {
  return createQuery(() => ({
    queryKey: queryKeys.gallery.ids(preferences(), page()),
    queryFn: () => getGalleryIds(preferences()),
    staleTime: Infinity,
  }));
};

const fetchGalleryPage = async (
  queryClient: QueryClient,
  preferences: SearchPreferences,
  page: number
) => {
  const gallery = await getGalleryPage(preferences, page);
  gallery.forEach((mediaItem) => {
    queryClient.setQueryData(queryKeys.media.item(mediaItem.id), mediaItem);
  });
  return gallery.map((item) => ({ id: item.id }));
};

const prefetchGalleryPage = (
  queryClient: QueryClient,
  preferences: SearchPreferences,
  page: number
) => {
  if (page < 1) return;

  queryClient.prefetchQuery({
    queryKey: queryKeys.gallery.ids(preferences, page),
    queryFn: () => fetchGalleryPage(queryClient, preferences, page),
  });
};

export const useGallery = (preferences: Accessor<SearchPreferences>, page: Accessor<number>) => {
  const queryClient = useQueryClient();

  return createQuery<MediaID[], ApiError>(() => ({
    queryKey: queryKeys.gallery.ids(preferences(), page()),
    queryFn: async () => {
      prefetchGalleryPage(queryClient, preferences(), page() - 1);
      prefetchGalleryPage(queryClient, preferences(), page() + 1);
      return fetchGalleryPage(queryClient, preferences(), page());
    },
    staleTime: Infinity,
  }));
};

export const useDeletePage = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({ itemIds, preferences, page }: {
      itemIds: string[];
      preferences: SearchPreferences;
      page: number;
    }) => deletePage(itemIds, preferences, page),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
  }));
};
