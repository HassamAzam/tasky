"use client";

import { useRef, useState } from "react";
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Modal, Button, TextareaAutosize } from "@mui/material";

import { CardProps } from "@/app/board/Interface/interface";
import DeleteIcon from "@/Icons/DeleteIcon";
import { formatTimestamp } from "@/utilities/utilties";

const TaskCard = ({ task, deleteTask, updateTask }: CardProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const taskContent = useRef("");

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const handleSave = () => {
    task.content = taskContent.current;
    updateTask(task.id, task.content, task.columnId);
    setModalOpen(false);
  };

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="
        opacity-30 border-rose-500 
        bg-[#0D1117] p-2.5 h-[100px] min-h-[100px] flex items-center text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative task"
      ></div>
    );
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={handleOpenModal}
        className="bg-[#0D1117] p-2.5 h-[100px] min-h-[100px] flex items-center text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative task"
      >
        <p className="my-auto h-[90%] w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap">
          {task.content}
        </p>
      </div>
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <div className="flex flex-col items-center justify-center h-screen bg-gray-800 bg-opacity-80">
          <div className="bg-[#0D1117] p-5 rounded-lg text-white w-[90%] max-w-[400px]">
            <h3 className="text-xl mb-4">Edit Task</h3>
            <TextareaAutosize
              className="w-full p-2 bg-transparent border border-gray-600 rounded-md focus:outline-none text-white"
              minRows={3}
              onChange={(e) => (taskContent.current = e.target.value)}
              placeholder="Enter Task Content"
              defaultValue={task.content}
            />
            <p className="mt-2 text-gray-400">Last Updated By: {task.email}</p>
            <p className="mt-2 text-gray-400">
              Last Updated on: {formatTimestamp(task.time)}
            </p>
            <div className="flex justify-end mt-4 gap-2">
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                title="Click to save changes"
              >
                Save
              </Button>
              <Button
                title="Click to delete the Icon"
                variant="contained"
                color="secondary"
                onClick={() => deleteTask(task.id)}
              >
                <DeleteIcon /> Delete
              </Button>
              <Button
                title="Click To close without saving"
                variant="outlined"
                color="inherit"
                onClick={handleCloseModal}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TaskCard;
