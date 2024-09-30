export type ColumnType = {
  id: string;
  title: string;
  email: string;
};

export type TaskType = {
  id: string;
  columnId: string;
  content: string;
  email: string;
  time: string;
};

export type ColumnTypeInDb = {
  id: string;
  title: string;
  created_at: string;
  userEmail: string;
};
export type TaskTypeInDb = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  email: string;
  updatedBy: string;
  order: number;
  column_id: string;
};
