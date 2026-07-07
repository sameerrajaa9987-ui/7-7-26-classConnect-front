import React, { useMemo } from "react";
import { BookOpen } from "lucide-react-native";
import { useAuthStore } from "@shared/store/useAuthStore";
import { PERMISSIONS } from "@shared/permissions";
import {
  useCourses,
  useSaveCourse,
  useSubjects,
} from "@modules/academics/hooks/useAcademics";
import {
  CrudScreen,
  CrudRow,
  FieldDef,
} from "@modules/academics/components/CrudScreen";

export default function CoursesScreen() {
  const canWrite = useAuthStore((s) => s.hasPermission)(
    PERMISSIONS.COURSES_MANAGE,
  );
  const { data, isLoading, refetch, isRefetching } = useCourses({ limit: 200 });
  const { data: subjects } = useSubjects({ limit: 200 });
  const mut = useSaveCourse();

  const fields: FieldDef[] = useMemo(
    () => [
      {
        key: "name",
        label: "Course / Class name",
        type: "text",
        placeholder: "Class 8 · Full Stack Development",
        required: true,
      },
      {
        key: "code",
        label: "Code (optional)",
        type: "text",
        placeholder: "auto if blank",
      },
      {
        key: "category",
        label: "Category",
        type: "text",
        placeholder: "Class · Diploma · Coaching",
      },
      {
        key: "durationMonths",
        label: "Duration (months)",
        type: "number",
        placeholder: "12",
      },
      {
        key: "subjectIds",
        label: "Subjects",
        type: "multiselect",
        options: (subjects?.data || []).map((s) => ({
          value: s.id,
          label: s.name,
        })),
      },
      {
        key: "description",
        label: "Description",
        type: "text",
        placeholder: "Optional",
      },
    ],
    [subjects],
  );

  const rows: CrudRow[] = (data?.data || []).map((c) => ({
    id: c.id,
    title: c.name,
    subtitle: `${c.code}${c.category ? ` · ${c.category}` : ""} · ${c.subjectCount} subject${c.subjectCount === 1 ? "" : "s"}`,
    badge: {
      label: c.isActive ? "Active" : "Inactive",
      tone: c.isActive ? "success" : "neutral",
    },
    raw: c,
  }));

  return (
    <CrudScreen
      overline="Academics"
      title="Courses"
      subtitle="Programs, classes & courses your institute offers"
      icon={BookOpen}
      rows={rows}
      loading={isLoading}
      refreshing={isRefetching}
      onRefresh={refetch}
      canWrite={canWrite}
      fields={fields}
      addLabel="Add course"
      emptyForm={{
        name: "",
        code: "",
        category: "",
        durationMonths: "",
        subjectIds: [],
        description: "",
      }}
      toForm={(c) => ({
        name: c.name,
        code: c.code,
        category: c.category,
        durationMonths: String(c.durationMonths || ""),
        subjectIds: (c.subjects || []).map((s: any) => s.subjectId),
        description: c.description,
      })}
      toPayload={(f) => ({
        name: f.name,
        code: f.code || undefined,
        category: f.category || undefined,
        durationMonths: f.durationMonths ? Number(f.durationMonths) : undefined,
        subjectIds: f.subjectIds || [],
        description: f.description || undefined,
      })}
      saving={mut.isPending}
      saveError={mut.error}
      onSave={(v) => mut.mutate(v)}
    />
  );
}
