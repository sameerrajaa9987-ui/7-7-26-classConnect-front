import { apiClient } from "@api/apiClient";
import {
  Announcement,
  Contact,
  Conversation,
  Message,
} from "@modules/communication/types";

const g = <T>(p: string, params?: any) =>
  apiClient.get<{ data: T }>(p, { params }).then((r) => r.data.data);

export const commApi = {
  listAnnouncements: () =>
    apiClient
      .get<{ data: Announcement[] }>("/communication/announcements")
      .then((r) => r.data.data),
  createAnnouncement: (body: any) =>
    apiClient
      .post<{ data: Announcement }>("/communication/announcements", body)
      .then((r) => r.data.data),
  updateAnnouncement: (id: string, body: any) =>
    apiClient
      .patch<{ data: Announcement }>(`/communication/announcements/${id}`, body)
      .then((r) => r.data.data),
  removeAnnouncement: (id: string) =>
    apiClient
      .delete(`/communication/announcements/${id}`)
      .then((r) => r.data.data),

  contacts: () => g<Contact[]>("/communication/contacts"),
  conversations: () => g<Conversation[]>("/communication/conversations"),
  messages: (id: string) =>
    g<{ conversation: Conversation; messages: Message[] }>(
      `/communication/conversations/${id}`,
    ),
  start: (body: any) =>
    apiClient
      .post<{ data: { conversation: Conversation; message: Message } }>(
        "/communication/conversations",
        body,
      )
      .then((r) => r.data.data),
  send: (id: string, body: string) =>
    apiClient
      .post<{ data: Message }>(`/communication/conversations/${id}/messages`, {
        body,
      })
      .then((r) => r.data.data),
  unread: () =>
    g<{ unread: number }>("/communication/unread").then((d) => d.unread),
};
