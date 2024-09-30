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

export const fetchUsers = async () => {
  try {
    await supabase.from("users").select("*");
  } catch (e) {
    return e;
  }
};

export const insertUser = async (userObj: {
  name: string | undefined;
  email: string | undefined;
  password: string | undefined;
}) => {
  try {
    await supabase
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
    redirect("/login");
  } catch (e) {
    return e;
  }
};

export const authenticateUser = async (userObj: {
  email: string | undefined;
  password: string | undefined;
}) => {
  try {
    const { data: users } = await supabase
      .from("users")
      .select("*")
      .eq("email", userObj.email)
      .eq("password", userObj.password);
    if (users) {
      if (users) {
        return userObj.email;
      }
    }
  } catch (e) {
    throw e;
  }
};

export const getColumns = async (email: string) => {
  try {
    const { data: columns } = await supabase
      .from("columns")
      .select("*")
      .eq("userEmail", email);

    if (columns) {
      const columnStruturizedData = transformDbDataColumn(columns);
      return columnStruturizedData;
    }
  } catch (e) {
    throw e;
  }
};

export const getCards = async (email: string) => {
  try {
    const { data: cards, error } = await supabase
      .from("cards")
      .select("*")
      .eq("email", email);

    if (cards) {
      const taskStruturizedData = transformDbDataTask(cards);
      return taskStruturizedData;
    }

    if (error) {
      throw error;
    }
  } catch (e) {
    throw e;
  }
};

export const sendColumn = async (
  columnId: string,
  email: string,
  columnTitle: string
) => {
  try {
    const { error } = await supabase
      .from("columns")
      .insert([{ id: columnId, userEmail: email, title: columnTitle }])
      .select();

    if (error) {
      throw error;
    }
  } catch (e) {
    throw e;
  }
};

export const addCard = async (
  cardId: string,
  columnId: string,
  cardDescription: string,
  email: string
) => {
  try {
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
      return;
    }
  } catch (e) {
    throw e;
  }
};

export const updateCardFromDb = async (
  cardId: string,
  cardDescription: string,
  email: string,
  columndId: string,
  date: string
) => {
  try {
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
      return;
    }
  } catch (e) {
    throw e;
  }
};

export const updateColumnNameFromDb = async (
  columnId: string,
  columnTitle: string
) => {
  try {
    const { data: error } = await supabase
      .from("columns")
      .update({ title: columnTitle })
      .eq("id", columnId)
      .select();

    if (error) {
      return;
    }
  } catch (e) {
    throw e;
  }
};

export const deleteColumnFromDb = async (columnId: string) => {
  try {
    const { data: error } = await supabase
      .from("columns")
      .delete()
      .eq("id", columnId);

    if (error) {
      return;
    }
  } catch (e) {
    throw e;
  }
};

export const deleteTaskFromDb = async (taskId: string) => {
  try {
    const { data: error } = await supabase
      .from("cards")
      .delete()
      .eq("id", taskId);

    if (error) {
      return;
    }
  } catch (e) {
    throw e;
  }
};
