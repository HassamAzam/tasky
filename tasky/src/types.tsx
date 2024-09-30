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
