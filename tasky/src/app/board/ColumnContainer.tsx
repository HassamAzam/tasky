"use client";

import { useMemo } from "react";

import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import DeleteIcon from "@/Icons/DeleteIcon";
import { ColumnProps } from "./Interface/interface";
import PlusIcon from "@/Icons/PlusIcon";
import TaskCard from "./Card";

import { useRef } from "react";

const ColumnContainer = (props: ColumnProps) => {
  const {
    column,
    deleteColumn,
    updateColumn,
    createTask,
    tasks,
    deleteTask,
    updateTask,
  } = props;

  const taskId = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    backgroundColor: "#161D22",
    borderColor: "#0D1117",
  };

  const columnNameRef = useRef<HTMLInputElement>(null);

  const handleCreateTask = () => {
    createTask(column.id);
  };

  const handleUpdateColumn = () => {
    if (columnNameRef.current) {
      updateColumn(column.id, columnNameRef.current.value);
    }
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="w-[350px] max-h-[500px] rounded-md h-[500px] flex flex-col opacity-40 border-2 border-rose-500"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-[350px] max-h-[900px] rounded-md h-[600px] flex flex-col"
    >
      <div
        {...attributes}
        {...listeners}
        className="text-md h-[60px] cursor-grab rounded-md rounded-b-none p-3 font-bold border-4 flex items-center justify-between"
        style={{
          backgroundColor: "#0D1117",
          borderColor: "#161D22",
        }}
      >
        <div className="flex gap-2">
          <div
            className="flex justify-center items-center px-2 py-1 text-sm rounded-full"
            style={{ backgroundColor: "#0D1117" }}
          >
            {tasks.length}
          </div>
          <input
            ref={columnNameRef}
            className="bg-black focus:border-rose-500 border rounded outline-none px-2"
            defaultValue={column.title}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleUpdateColumn();
              }
            }}
            onBlur={handleUpdateColumn}
          />
        </div>
        <button
          onClick={() => deleteColumn(column.id)}
          className="store-gray-500 hover:stroke-black rounded px-1 py-2"
        >
          <DeleteIcon />
        </button>
      </div>
      <div className="flex flex-grow flex-col gap-3 p-2 overflow-x-hidden overflow-y-auto">
        <SortableContext items={taskId}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              deleteTask={deleteTask}
              updateTask={updateTask}
            />
          ))}
        </SortableContext>
      </div>
      <button
        className="flex gap-2 items-center border-2 rounded-md p-4 border-[#161D22] hover:bg-[#0D1117] hover:text-rose-500 active:bg-black"
        onClick={handleCreateTask}
        style={{ backgroundColor: "#0D1117" }}
      >
        <PlusIcon /> Add Task
      </button>
    </div>
  );
};

export default ColumnContainer;
