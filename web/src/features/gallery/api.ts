import { createMutation, createQuery, QueryClient, useQueryClient } from '@tanstack/solid-query';
import { Accessor } from 'solid-js';
import { deletePage, getGalleryIds, getGalleryPage, getTotalPages } from '@shared/api/requests';
import queryKeys from '@shared/api/queryKeys';
import { ApiError } from '@shared/types/api';
import { MediaItem } from '@shared/types/media';
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
  preferences: SearchPreferences,
  page: number
) => {
  return getGalleryPage(preferences, page);
};

const prefetchGalleryPage = (
  queryClient: QueryClient,
  preferences: SearchPreferences,
  page: number
) => {
  if (page < 1) return;

  queryClient.prefetchQuery({
    queryKey: queryKeys.gallery.ids(preferences, page),
    queryFn: () => fetchGalleryPage(preferences, page),
  });
};

export const useGallery = (preferences: Accessor<SearchPreferences>, page: Accessor<number>) => {
  const queryClient = useQueryClient();

  return createQuery<MediaItem[], ApiError>(() => ({
    queryKey: queryKeys.gallery.ids(preferences(), page()),
    queryFn: async () => {
      const currentPreferences = preferences();
      const currentPage = page();
      const gallery = await fetchGalleryPage(currentPreferences, currentPage);

      window.setTimeout(() => {
        prefetchGalleryPage(queryClient, currentPreferences, currentPage - 1);
        prefetchGalleryPage(queryClient, currentPreferences, currentPage + 1);
      }, 0);

      return gallery;
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
