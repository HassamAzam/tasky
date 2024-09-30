"use server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { redirect } from "next/navigation";

import { supabaseKey, supabaseUrl } from "@/settings/settings";
import {
  transformDbDataColumn,
  transformDbDataTask,
} from "@/utilities/struturizeData";

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase URL or key is not defined in the environment variables."
  );
}
const supabase = createClient(supabaseUrl, supabaseKey);
export async function fetchUsers() {
  const { data: error } = await supabase.from("users").select("*");

  if (error) {
    return;
  }
}

export async function insertUser(userObj: {
  name: string | undefined;
  email: string | undefined;
  password: string | undefined;
}) {
  const { data: error } = await supabase
    .from("users")
    .insert([
      {
        id: uuidv4(),
        email: userObj.email,
        username: userObj.name,
        password: userObj.password,
      },
    ])
    .select();
  if (error)
  {
    return;
  }

  redirect("/Login");
}

export async function authenticateUser(userObj: {
  email: string | undefined;
  password: string | undefined;
}) {
  const { data: users } = await supabase
    .from("users")
    .select("*")
    .eq("email", userObj.email)
    .eq("password",userObj.password);
  if (users) {
  
    if (users) {
      return userObj.email;
    } else {
      return "";
    }
  }
}

export async function getColumns(email: string) {
  const { data: columns } = await supabase
    .from("columns")
    .select("*")
    .eq("userEmail", email);

  if (columns) {
    const columnStruturizedData = transformDbDataColumn(columns);
    return columnStruturizedData;
  }
}
export async function getCards(email: string) {
  const { data: cards, error } = await supabase
    .from("cards")
    .select("*")
    .eq("email", email);
  if (cards) {
    const taskStruturizedData = transformDbDataTask(cards);
    return taskStruturizedData;
  }
  if (error)
  {
    throw error
  }
}

export async function sendColumn(
  columnId: string,
  email: string,
  columnTitle: string
) {
  const { error } = await supabase
    .from("columns")
    .insert([{ id: columnId, userEmail: email, title: columnTitle }])
    .select();
  if (error) {
    throw error;
  }
}

export async function addCard(
  cardId: string,
  columnId: string,
  cardDescription: string,
  email: string
) {
  const { data: error } = await supabase
    .from("cards")
    .insert([
      {
        id: cardId,
        column_id: columnId,
        description: cardDescription,
        email: email,
      },
    ])
    .select();
  if (error) {
    return
  }
}

export const updateCardFromDb = async (
  cardId: string,
  cardDescription: string,
  email: string,
  columndId: string,
  date: string
) => {
  const { data: error } = await supabase
    .from("cards")
    .update({
      description: cardDescription,
      updatedBy: email,
      column_id: columndId,
      created_at: date,
    })
    .eq("id", cardId)
    .select();
  if (error) {
  return
  }
};
export const updateColumnNameFromDb = async (
  columnId: string,
  columnTitle: string
) => {
  const { data: error } = await supabase
    .from("columns")
    .update({ title: columnTitle })
    .eq("id", columnId)
    .select();
  if (error) {
    return;
  }
};
export const deleteColumnFromDb = async (columnId: string) => {
  const { data: error } = await supabase
    .from("columns")
    .delete()
    .eq("id", columnId);
  if (error) {
    return;
  } 
};
export const deleteTask = async (taskId: string) => {
  const { data: error } = await supabase
    .from("cards")
    .delete()
    .eq("id", taskId);
  if (error) {
    return;
  }
};
