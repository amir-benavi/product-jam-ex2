import type { Explanation, Picture } from "@shared/schemas/apod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";

/*
 * Talking to /api/apod from the browser. Copied from the shape of
 * client/features/events/hooks.ts.
 */

/** The name the list of pictures is filed under. See eventKeys for why. */
export const apodKeys = {
  pictures: ["apod", "pictures"] as const,
};

/**
 * Up to 20 random pictures. The server picks different ones every time, so
 * the list never goes stale by itself (`staleTime: Infinity`): the pictures
 * only change when the user asks for more, with `refetch()`.
 */
export function usePictures() {
  return useQuery({
    queryKey: apodKeys.pictures,
    queryFn: () => api<Picture[]>("/api/apod"),
    staleTime: Infinity,
  });
}

/**
 * Explains one picture in Hebrew. Each card calls this hook itself, so each
 * card has its own "thinking" and error state.
 *
 *     const explain = useExplain();
 *     explain.mutate("2015-03-14");
 */
export function useExplain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (date: string) =>
      api<Explanation>(`/api/apod/${date}/explain`, { method: "POST" }),
    onSuccess: ({ date, title, summary, tags }) => {
      // Put the answer into the list we already have. Fetching the list again
      // would bring 20 different random pictures.
      queryClient.setQueryData<Picture[]>(apodKeys.pictures, (pictures) =>
        pictures?.map((picture) =>
          picture.date === date
            ? { ...picture, hebrew: { title, summary, tags } }
            : picture,
        ),
      );
    },
  });
}
