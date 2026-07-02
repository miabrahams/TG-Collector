import { createMutation, createQuery, useQueryClient } from '@tanstack/solid-query';
import { getUser, postLogin, postLogout, postRegister } from '@shared/api/requests';
import queryKeys from '@shared/api/queryKeys';

export const useUser = () => {
  return createQuery(() => ({
    queryKey: queryKeys.user.me,
    queryFn: getUser,
    retry: false,
    staleTime: Infinity,
  }));
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({ email, password }: { email: string; password: string }) => postLogin(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me });
    },
  }));
};

export const useRegister = () => {
  return createMutation(() => ({
    mutationFn: ({ email, password }: { email: string; password: string }) => postRegister(email, password),
  }));
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: postLogout,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.user.me, null);
      queryClient.invalidateQueries();
    },
  }));
};
