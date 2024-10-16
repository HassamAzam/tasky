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
import { ContainerType } from "@/utilities/Enums";
import PlusIcon from "@/Icons/PlusIcon";
import { ColumnType, TaskType } from "@/types";
import ColumnContainer from "@/app/board/ColumnContainer";
import TaskCard from "@/app/board/Card";
import React from "react";
import Navbar from "@/app/board/Navbar";
import useDocumentTitle from "@/app/titleHook";

const KanbanBoard = () => {
  useDocumentTitle("Board");
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [activeColumn, setActiveColumn] = useState<ColumnType | null>(null);
  const [activeTask, setActiveTask] = useState<TaskType | null>(null);

  useEffect(() => {
    const email = sessionStorage.getItem("loggedInUser");
    if (email) {
      setLoggedInUser(email);
    } else {
      redirect("/login");
    }
  }, []);

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

  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const createTask = async (columnId: string) => {
    if (loggedInUser) {
      const newTask: TaskType = {
        id: v4(),
        columnId,
        content: `Task ${tasks.length + 1}`,
        email: loggedInUser,
        time: Date(),
      };
      await addCard(
        newTask.id,
        newTask.columnId,
        newTask.content,
        loggedInUser
      );
      setTasks((prevTasks) => [...prevTasks, newTask]);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  const handleLogout = () => {
    sessionStorage.removeItem("loggedInUser");
  };

  const createNewColumn = async () => {
    if (!loggedInUser) return;
    const columnToAdd: ColumnType = {
      id: v4(),
      title: `Column ${columns.length + 1}`,
      email: loggedInUser,
    };
    await sendColumn(columnToAdd.id, columnToAdd.email, columnToAdd.title);
    setColumns((prevColumns) => [...prevColumns, columnToAdd]);
  };

  const deleteColumn = async (id: string) => {
    await deleteColumnFromDb(id);
    const filteredColumn = columns.filter((col) => col.id !== id);
    setColumns(filteredColumn);
    const newTasks = tasks.filter((t) => t.columnId !== id);
    setTasks(newTasks);
  };

  const updateTask = async (id: string, content: string, columnId: string) => {
    if (loggedInUser) {
      await updateCardFromDb(
        id,
        content,
        loggedInUser,
        columnId,
        getFormattedDate()
      );
    }
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, content, columnId } : task
      )
    );
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

  const deleteTask = (cardId: string) => {
    const newTask = tasks.filter((task) => task.id !== cardId);
    setTasks(newTask);
    const [{ id }]: TaskType[] = tasks.filter((task) => task.id === cardId);
    deleteTaskFromDb(id);
  };
  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === ContainerType.Column) {
      setActiveColumn(event.active.data.current.column);
    } else if (event.active.data.current?.type === ContainerType.Task) {
      setActiveTask(event.active.data.current.task);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    const newTask = active.data.current?.task;
    if (newTask) {
      updateTask(newTask.id, newTask.content, newTask.columnId);
    }

    setActiveTask(null);
    setActiveColumn(null);

    if (!over) return;
    if (active.data.current?.type === ContainerType.Column) {
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
    if (active.data.current?.type === ContainerType.Task) {
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

    const isActiveTask = active.data.current?.type === ContainerType.Task;
    const isOverTask = over.data.current?.type === ContainerType.Task;

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

    const isOverAColumn = over.data.current?.type === ContainerType.Column;
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
