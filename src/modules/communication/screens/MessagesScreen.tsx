import React, { useEffect, useRef, useState } from "react";
import { View, Modal, Pressable, ScrollView, TextInput } from "react-native";
import { MessageSquare, Plus, X, ArrowLeft, Send } from "lucide-react-native";
import { palette, radius, shadows } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Button,
  Select,
  TextField,
  EmptyState,
  Avatar,
} from "@shared/ui";
import { apiErrorMessage } from "@api/apiClient";
import {
  useConversations,
  useMessages,
  useContacts,
  useStartConversation,
  useSendMessage,
} from "@modules/communication/hooks/useComm";

export default function MessagesScreen() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const { data: convos, isLoading, refetch, isRefetching } = useConversations();

  if (openId)
    return <ChatView conversationId={openId} onBack={() => setOpenId(null)} />;

  const list = convos || [];
  return (
    <Screen
      overline="Communication"
      title="Messages"
      subtitle="Two-way messaging with teachers, staff & parents"
      refreshing={isLoading || isRefetching}
      onRefresh={refetch}
      right={
        <Button
          label="New message"
          fullWidth={false}
          icon={<Plus size={16} color="#FFFFFF" strokeWidth={2.4} />}
          onPress={() => setShowNew(true)}
        />
      }
    >
      {list.length === 0 && !isLoading ? (
        <EmptyState
          icon={MessageSquare}
          title="No conversations"
          message="Start a conversation with a teacher, parent or staff member."
        />
      ) : (
        <VStack gap={10}>
          {list.map((c) => (
            <Card key={c.id} onPress={() => setOpenId(c.id)}>
              <HStack align="center" gap={12}>
                <Avatar name={c.otherName || "?"} size={44} />
                <VStack gap={2} flex={1}>
                  <HStack justify="space-between" align="center">
                    <Text variant="label-lg" tone="primary" numberOfLines={1}>
                      {c.otherName}
                    </Text>
                    {c.unread > 0 ? (
                      <View style={styles.badge}>
                        <Text variant="label-sm" style={{ color: "#FFFFFF" }}>
                          {c.unread}
                        </Text>
                      </View>
                    ) : null}
                  </HStack>
                  <Text variant="body-sm" tone="tertiary" numberOfLines={1}>
                    {c.lastMessagePreview || c.subject || "…"}
                  </Text>
                  {c.studentName ? (
                    <Text variant="caption" tone="tertiary">
                      Re: {c.studentName}
                    </Text>
                  ) : null}
                </VStack>
              </HStack>
            </Card>
          ))}
        </VStack>
      )}
      <NewMessageModal
        visible={showNew}
        onClose={() => setShowNew(false)}
        onStarted={(id) => {
          setShowNew(false);
          setOpenId(id);
        }}
      />
    </Screen>
  );
}

function ChatView({
  conversationId,
  onBack,
}: {
  conversationId: string;
  onBack: () => void;
}) {
  const { data, isLoading } = useMessages(conversationId);
  const send = useSendMessage();
  const [text, setText] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
  }, [data?.messages?.length]);

  const submit = () => {
    if (!text.trim()) return;
    send.mutate(
      { id: conversationId, body: text.trim() },
      { onSuccess: () => setText("") },
    );
  };

  return (
    <Screen
      overline="Messages"
      title={data?.conversation.otherName || "Chat"}
      subtitle={
        data?.conversation.studentName
          ? `Re: ${data.conversation.studentName}`
          : data?.conversation.subject
      }
      scroll={false}
    >
      <Pressable onPress={onBack} hitSlop={6} style={{ marginBottom: 12 }}>
        <HStack gap={6} align="center">
          <ArrowLeft size={18} color={palette.text.link} strokeWidth={2} />
          <Text variant="label" tone="link">
            All messages
          </Text>
        </HStack>
      </Pressable>
      <View style={{ flex: 1 }}>
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 12, gap: 8 }}
          showsVerticalScrollIndicator={false}
        >
          {(data?.messages || []).map((m) => (
            <View
              key={m.id}
              style={{
                alignSelf: m.mine ? "flex-end" : "flex-start",
                maxWidth: "80%",
              }}
            >
              <View
                style={{
                  padding: 12,
                  borderRadius: radius.lg,
                  backgroundColor: m.mine
                    ? palette.cobalt[600]
                    : palette.surface.primary,
                  borderWidth: m.mine ? 0 : 1,
                  borderColor: palette.border.default,
                }}
              >
                <Text
                  variant="body-sm"
                  style={{ color: m.mine ? "#FFFFFF" : palette.text.primary }}
                >
                  {m.body}
                </Text>
              </View>
              <Text
                variant="caption"
                tone="tertiary"
                style={{ marginTop: 3, textAlign: m.mine ? "right" : "left" }}
              >
                {new Date(m.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          ))}
          {isLoading ? (
            <Text variant="body-sm" tone="tertiary">
              Loading…
            </Text>
          ) : null}
        </ScrollView>
        <HStack
          gap={8}
          align="center"
          style={{
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: palette.border.default,
          }}
        >
          <View style={{ flex: 1 }}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Type a message…"
              placeholderTextColor={palette.text.tertiary}
              onSubmitEditing={submit}
              style={{
                borderWidth: 1,
                borderColor: palette.border.default,
                borderRadius: radius.md,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 15,
                color: palette.text.primary,
                backgroundColor: palette.surface.primary,
              }}
            />
          </View>
          <Pressable
            onPress={submit}
            disabled={send.isPending}
            style={{
              width: 48,
              height: 48,
              borderRadius: radius.md,
              backgroundColor: palette.cobalt[600],
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Send size={20} color="#FFFFFF" strokeWidth={2} />
          </Pressable>
        </HStack>
      </View>
    </Screen>
  );
}

function NewMessageModal({
  visible,
  onClose,
  onStarted,
}: {
  visible: boolean;
  onClose: () => void;
  onStarted: (id: string) => void;
}) {
  const { data: contacts } = useContacts();
  const start = useStartConversation();
  const [toUserId, setToUserId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  useEffect(() => {
    if (!visible) {
      setToUserId(null);
      setSubject("");
      setBody("");
    }
  }, [visible]);
  const submit = () => {
    if (!toUserId || !body.trim()) return;
    start.mutate(
      { toUserId, subject: subject || undefined, body },
      { onSuccess: (d) => onStarted(d.conversation.id) },
    );
  };
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <HStack
            align="center"
            justify="space-between"
            style={{ marginBottom: 16 }}
          >
            <Text variant="h3" tone="primary">
              New message
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={20} color={palette.text.tertiary} strokeWidth={2} />
            </Pressable>
          </HStack>
          {start.error ? (
            <View style={styles.err}>
              <Text variant="body-sm" tone="danger">
                {apiErrorMessage(start.error)}
              </Text>
            </View>
          ) : null}
          <VStack gap={14}>
            <Select
              label="To"
              placeholder="Select a person"
              value={toUserId}
              options={(contacts || []).map((c) => ({
                value: c.id,
                label: `${c.name} · ${c.roleLabel || c.role}`,
              }))}
              onChange={setToUserId}
            />
            <TextField
              label="Subject (optional)"
              value={subject}
              onChangeText={setSubject}
            />
            <TextField
              label="Message"
              value={body}
              onChangeText={setBody}
              placeholder="Type your message…"
            />
          </VStack>
          <Button
            label="Send message"
            size="lg"
            loading={start.isPending}
            onPress={submit}
            style={{ marginTop: 18 }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = {
  badge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: palette.danger.text,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: 20,
  },
  sheet: {
    width: "100%" as const,
    maxWidth: 460,
    backgroundColor: palette.surface.primary,
    borderRadius: radius.xl,
    padding: 22,
    ...shadows.lg,
  },
  err: {
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: palette.danger.bg,
    borderWidth: 1,
    borderColor: palette.danger.border,
    marginBottom: 14,
  },
};
