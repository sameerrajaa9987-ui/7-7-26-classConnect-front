export interface Announcement {
  id: string;
  title: string;
  body: string;
  tone: "info" | "success" | "warning" | "danger";
  audience: "all" | "role" | "batch" | "students";
  roleTarget: string;
  batchName: string;
  recipientCount: number | null;
  createdByName: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  roleLabel: string;
}

export interface Conversation {
  id: string;
  subject: string;
  studentName: string;
  otherName: string;
  otherRole: string;
  lastMessagePreview: string;
  lastMessageAt: string;
  unread: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  body: string;
  mine: boolean;
  createdAt: string;
}
