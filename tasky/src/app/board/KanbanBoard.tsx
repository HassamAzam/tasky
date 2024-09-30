"use client";

import { useState, useMemo, useEffect } from "react";
import { redirect } from "next/navigation";
import { v4 } from "uuid";
import { createPortal } from "react-dom";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";

import {
  addCard,
  deleteColumnFromDb,
  deleteTaskFromDb,
  getCards,
  getColumns,
  sendColumn,
  updateCardFromDb,
  updateColumnNameFromDb,
} from "@/middleware/middleware";

import { getFormattedDate } from "@/utilities/utilties";
import PlusIcon from "@/Icons/PlusIcon";
import { ColumnType, TaskType } from "@/types";
import ColumnContainer from "./ColumnContainer";
import TaskCard from "./Card";
import React from "react";
import Navbar from "./Navbar";
import useDocumentTitle from "../titleHook";

const KanbanBoard = () => {
  useDocumentTitle("Board");

  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [activeColumn, setActiveColumn] = useState<ColumnType | null>(null);
  const [activeTask, setActiveTask] = useState<TaskType | null>(null);

  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  useEffect(() => {
    const email = sessionStorage.getItem("email");
    if (email) {
      setLoggedInUser(email);
    } else {
      redirect("/login");
    }
  }, []);

  const createTask = async (columnId: string) => {
    if (loggedInUser) {
      const newTask: TaskType = {
        id: v4(),
        columnId,
        content: `Task ${tasks.length + 1}`,
        email: loggedInUser,
        time: Date(),
      };

      setTasks((prevTasks) => [...prevTasks, newTask]);
      await addCard(
        newTask.id,
        newTask.columnId,
        newTask.content,
        loggedInUser
      );
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  useEffect(() => {
    if (loggedInUser) {
      const fetchColumns = async () => {
        const columnsFromDb = await getColumns(loggedInUser);
        const taskFromDb = await getCards(loggedInUser);
        if (columnsFromDb) {
          setColumns(columnsFromDb);
          if (taskFromDb) {
            setTasks(taskFromDb);
          }
        }
      };
      fetchColumns();
    }
  }, [loggedInUser]);

  const handleLogout = () => {
    sessionStorage.removeItem("email");
  };

  const createNewColumn = async () => {
    if (!loggedInUser) return;
    const columnToAdd: ColumnType = {
      id: v4(),
      title: `Column ${columns.length + 1}`,
      email: loggedInUser,
    };

    setColumns((prevColumns) => [...prevColumns, columnToAdd]);
    await sendColumn(columnToAdd.id, columnToAdd.email, columnToAdd.title);
  };

  const deleteColumn = async (id: string) => {
    const filteredColumn = columns.filter((col) => col.id !== id);
    setColumns(filteredColumn);
    await deleteColumnFromDb(id);
    const newTasks = tasks.filter((t) => t.columnId !== id);
    setTasks(newTasks);
  };

  const updateTask = async (id: string, content: string, columnId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, content, columnId } : task
      )
    );
    if (loggedInUser) {
      await updateCardFromDb(
        id,
        content,
        loggedInUser,
        columnId,
        getFormattedDate()
      );
    }
  };

  const updateColumn = (id: string, title: string) => {
    if (loggedInUser) {
      updateColumnNameFromDb(id, title);
    }
    setColumns((prevColumns) =>
      prevColumns.map((column) =>
        column.id === id ? { ...column, title } : column
      )
    );
  };

  const deleteTask = async (id: string) => {
    const newTask = tasks.filter((task) => task.id !== id);
    const deletedTask = tasks.filter((task) => task.id === id);

    setTasks(newTask);
    await deleteTaskFromDb(deletedTask[0].id);
  };

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
    } else if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTask(null);
    setActiveColumn(null);

    if (!over) return;
    if (active.data.current?.type === "Column") {
      const activeColumnId = active.id;
      const overColumnId = over.id;
      if (activeColumnId === overColumnId) return;

      setColumns((columns) => {
        const activeColumnIndex = columns.findIndex(
          (col) => col.id === activeColumnId
        );
        const overColumnIndex = columns.findIndex(
          (col) => col.id === overColumnId
        );

        if (activeColumnIndex !== -1 && overColumnIndex !== -1) {
          return arrayMove(columns, activeColumnIndex, overColumnIndex);
        }
        return columns;
      });
    }
    if (active.data.current?.type === "Task") {
      const newTask: TaskType = active.data.current?.task;
      updateTask(newTask.id, newTask.content, newTask.columnId);
      const activeTaskId = active.id;
      const overTaskId = over.id;
      if (activeTaskId === overTaskId) {
        return;
      }
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeTaskId);
        const overIndex = tasks.findIndex((t) => t.id === overTaskId);
        if (tasks[activeIndex]?.columnId && tasks[overIndex]?.columnId) {
          tasks[activeIndex].columnId = tasks[overIndex].columnId;
        }
        return arrayMove(tasks, activeIndex, overIndex);
      });
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";

    if (!isActiveTask) return;

    if (isActiveTask && isOverTask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex]?.columnId && tasks[overIndex]?.columnId) {
          tasks[activeIndex].columnId = tasks[overIndex].columnId;
        }
        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = over.data.current?.type === "Column";
    if (isActiveTask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        if (over.id) {
          tasks[activeIndex].columnId = overId.toString();
        }
        return [...tasks];
      });
    }
  };

  return (
    <>
      <Navbar loggedInUser={loggedInUser} handleLogout={handleLogout} />
      <div className="m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-[40px] bg-[#000000]">
        <DndContext
          onDragOver={onDragOver}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          sensors={sensors}
        >
          <div className="m-auto flex gap-4">
            <div>
              <SortableContext items={columnsId}>
                <div className="flex gap-4">
                  {columns.map((col) => (
                    <ColumnContainer
                      updateTask={updateTask}
                      key={col.id}
                      updateColumn={updateColumn}
                      column={col}
                      deleteColumn={deleteColumn}
                      createTask={createTask}
                      deleteTask={deleteTask}
                      tasks={tasks.filter((task) => task.columnId === col.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
            <button
              title="Click  to add new columns"
              onClick={createNewColumn}
              className="h-[60px] w-[350px] min-w-[350px] cursor-pointer rounded-lg border-2 p-4 ring-rose-500 hover:ring-2 flex gap-2"
              style={{ backgroundColor: "#51074a", borderColor: "#0D1117" }}
            >
              <PlusIcon />
              Add Columns
            </button>
          </div>
          {typeof window !== "undefined" &&
            createPortal(
              <DragOverlay>
                {activeColumn && (
                  <ColumnContainer
                    updateTask={updateTask}
                    updateColumn={updateColumn}
                    deleteColumn={deleteColumn}
                    column={activeColumn}
                    createTask={createTask}
                    deleteTask={deleteTask}
                    tasks={tasks.filter(
                      (task) => task.columnId === activeColumn.id
                    )}
                  />
                )}
                {activeTask && (
                  <TaskCard
                    task={activeTask}
                    deleteTask={deleteTask}
                    updateTask={updateTask}
                  />
                )}
              </DragOverlay>,
              document.body
            )}
        </DndContext>
      </div>
    </>
  );
};

export default KanbanBoard;
