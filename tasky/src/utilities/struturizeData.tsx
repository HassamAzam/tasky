import { ColumnType, ColumnTypeInDb, TaskType, TaskTypeInDb } from "@/types";

export const transformDbDataColumn = (
  dbData: ColumnTypeInDb[]
): ColumnType[] => {
  return dbData.map((item) => ({
    id: item.id,
    title: item.title,
    email: item.userEmail,
  }));
};

export const transformDbDataTask = (dbData: TaskTypeInDb[]): TaskType[] => {
  return dbData.map((item) => ({
    id: item.id,
    columnId: item.column_id,
    content: item.description,
    email: item.email,
    time: item.created_at,
  }));
};
