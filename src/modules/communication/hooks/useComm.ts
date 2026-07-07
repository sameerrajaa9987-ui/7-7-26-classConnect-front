import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { commApi } from "@modules/communication/api/commApi";

export const useAnnouncements = () =>
  useQuery({
    queryKey: ["announcements"],
    queryFn: () => commApi.listAnnouncements(),
  });
export const useCreateAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (b: any) => commApi.createAnnouncement(b),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
};

export const useContacts = () =>
  useQuery({ queryKey: ["contacts"], queryFn: () => commApi.contacts() });
export const useConversations = () =>
  useQuery({
    queryKey: ["conversations"],
    queryFn: () => commApi.conversations(),
    refetchInterval: 20000,
  });
export const useMessages = (id?: string) =>
  useQuery({
    queryKey: ["messages", id],
    queryFn: () => commApi.messages(id!),
    enabled: !!id,
    refetchInterval: 8000,
  });
export const useStartConversation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (b: any) => commApi.start(b),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations"] }),
  });
};
export const useSendMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; body: string }) => commApi.send(v.id, v.body),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["messages", v.id] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};
export const useUnreadMessages = () =>
  useQuery({
    queryKey: ["msg-unread"],
    queryFn: () => commApi.unread(),
    refetchInterval: 30000,
  });
