import React from "react";
import { BookMarked } from "lucide-react-native";
import { useAuthStore } from "@shared/store/useAuthStore";
import { PERMISSIONS } from "@shared/permissions";
import {
  useSubjects,
  useSaveSubject,
} from "@modules/academics/hooks/useAcademics";
import {
  CrudScreen,
  CrudRow,
  FieldDef,
} from "@modules/academics/components/CrudScreen";

const FIELDS: FieldDef[] = [
  {
    key: "name",
    label: "Subject name",
    type: "text",
    placeholder: "Mathematics",
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
      { value: "theory", label: "Theory" },
      { value: "practical", label: "Practical" },
      { value: "both", label: "Both" },
    ],
  },
  {
    key: "description",
    label: "Description",
    type: "text",
    placeholder: "Optional",
  },
];

export default function SubjectsScreen() {
  const canWrite = useAuthStore((s) => s.hasPermission)(
    PERMISSIONS.COURSES_MANAGE,
  );
  const { data, isLoading, refetch, isRefetching } = useSubjects({
    limit: 200,
  });
  const mut = useSaveSubject();

  const rows: CrudRow[] = (data?.data || []).map((s) => ({
    id: s.id,
    title: s.name,
    subtitle: `${s.code} · ${s.type}`,
    badge: {
      label: s.isActive ? "Active" : "Inactive",
      tone: s.isActive ? "success" : "neutral",
    },
    raw: s,
  }));

  return (
    <CrudScreen
      overline="Academics"
      title="Subjects"
      subtitle="Subjects taught across your courses & batches"
      icon={BookMarked}
      rows={rows}
      loading={isLoading}
      refreshing={isRefetching}
      onRefresh={refetch}
      canWrite={canWrite}
      fields={FIELDS}
      addLabel="Add subject"
      emptyForm={{ name: "", code: "", type: "theory", description: "" }}
      toForm={(r) => ({
        name: r.name,
        code: r.code,
        type: r.type,
        description: r.description,
      })}
      toPayload={(f) => ({
        name: f.name,
        code: f.code || undefined,
        type: f.type || "theory",
        description: f.description || undefined,
      })}
      saving={mut.isPending}
      saveError={mut.error}
      onSave={(v) => mut.mutate(v)}
    />
  );
}
