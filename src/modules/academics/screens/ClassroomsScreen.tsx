import React from "react";
import { DoorOpen } from "lucide-react-native";
import { useAuthStore } from "@shared/store/useAuthStore";
import { PERMISSIONS } from "@shared/permissions";
import {
  useClassrooms,
  useSaveClassroom,
} from "@modules/academics/hooks/useAcademics";
import {
  CrudScreen,
  CrudRow,
  FieldDef,
} from "@modules/academics/components/CrudScreen";

const FIELDS: FieldDef[] = [
  {
    key: "name",
    label: "Room name",
    type: "text",
    placeholder: "Room 101",
    required: true,
  },
  {
    key: "code",
    label: "Code (optional)",
    type: "text",
    placeholder: "auto if blank",
  },
  {
    key: "type",
    label: "Type",
    type: "select",
    options: [
      { value: "classroom", label: "Classroom" },
      { value: "lab", label: "Lab" },
      { value: "hall", label: "Hall" },
      { value: "auditorium", label: "Auditorium" },
      { value: "other", label: "Other" },
    ],
  },
  { key: "capacity", label: "Capacity", type: "number", placeholder: "40" },
  { key: "building", label: "Building", type: "text", placeholder: "Optional" },
  { key: "floor", label: "Floor", type: "text", placeholder: "Optional" },
];

export default function ClassroomsScreen() {
  const canWrite = useAuthStore((s) => s.hasPermission)(
    PERMISSIONS.BATCHES_MANAGE,
  );
  const { data, isLoading, refetch, isRefetching } = useClassrooms({
    limit: 200,
  });
  const mut = useSaveClassroom();

  const rows: CrudRow[] = (data?.data || []).map((r) => ({
    id: r.id,
    title: r.name,
    subtitle: `${r.code} · ${r.type}${r.capacity ? ` · cap ${r.capacity}` : ""}`,
    badge: {
      label: r.isActive ? "Active" : "Inactive",
      tone: r.isActive ? "success" : "neutral",
    },
    raw: r,
  }));

  return (
    <CrudScreen
      overline="Academics"
      title="Rooms"
      subtitle="Classrooms, labs & halls for scheduling"
      icon={DoorOpen}
      rows={rows}
      loading={isLoading}
      refreshing={isRefetching}
      onRefresh={refetch}
      canWrite={canWrite}
      fields={FIELDS}
      addLabel="Add room"
      emptyForm={{
        name: "",
        code: "",
        type: "classroom",
        capacity: "",
        building: "",
        floor: "",
      }}
      toForm={(r) => ({
        name: r.name,
        code: r.code,
        type: r.type,
        capacity: String(r.capacity || ""),
        building: r.building,
        floor: r.floor,
      })}
      toPayload={(f) => ({
        name: f.name,
        code: f.code || undefined,
        type: f.type || "classroom",
        capacity: f.capacity ? Number(f.capacity) : undefined,
        building: f.building || undefined,
        floor: f.floor || undefined,
      })}
      saving={mut.isPending}
      saveError={mut.error}
      onSave={(v) => mut.mutate(v)}
    />
  );
}
