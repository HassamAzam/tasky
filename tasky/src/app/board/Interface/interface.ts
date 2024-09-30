import { ColumnType, TaskType } from "@/types";

export interface ColumnProps {
    column: ColumnType;
    deleteColumn: (id: string) => void;
    updateColumn: (id: string, title: string) => void;
    createTask: (columnId: string) => void;
    tasks: TaskType[];
    deleteTask: (id: string) => void;
    updateTask: (id: string, content: string, columdId: string) => void;
}
  

export  interface CardProps {
    task: TaskType;
    deleteTask: (id: string) => void;
    updateTask: (id: string, content: string, columnId: string) => void;
}
  