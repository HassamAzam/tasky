import { ColumnType, TaskType } from "@/types";

interface ColumnDbInterface {
  id: string;
  title: string;
  userEmail: string; // Based on the db column name in your data
}

interface TaskDbInterface {
  id: string;
  column_id: string;
  description: string;
  email: string;
  created_at: string;
}

export const transformDbDataColumn = (
  dbData: ColumnDbInterface[]
): ColumnType[] => {
  return dbData.map((item) => ({
    id: item.id,
    title: item.title,
    email: item.userEmail,
  }));
};

export const transformDbDataTask = (dbData: TaskDbInterface[]): TaskType[] => {
  return dbData.map((item) => ({
    id: item.id,
    columnId: item.column_id,
    content: item.description,
    email: item.email,
    time: item.created_at,
  }));
};
