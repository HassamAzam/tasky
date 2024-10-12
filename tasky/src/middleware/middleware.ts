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

const checkExistence = async (userEmail: string | undefined) => {
  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", userEmail);

    if (error) {
      throw new Error(error.message);
    }

    return users?.length > 0;
  } catch (e) {
    throw e;
  }
};

export const fetchUsers = async () => {
  try {
    const { data: users, error } = await supabase.from("users").select("*");

    if (error) {
      throw new Error(error.message);
    }

    return users;
  } catch (e) {
    throw e;
  }
};

export const insertUser = async (userObj: {
  name: string | undefined;
  email: string | undefined;
  password: string | undefined;
}) => {
  const ifExists = await checkExistence(userObj.email);
  if (ifExists) {
    return false;
  } else {
    try {
      const { error } = await supabase
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

      if (error) {
        throw new Error(error.message);
      }

      redirect("/Login");
      return true;
    } catch (e) {
      throw e;
    }
  }
};

export const authenticateUser = async (userObj: {
  email: string | undefined;
  password: string | undefined;
}) => {
  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", userObj.email);

    if (error) {
      throw new Error(error.message);
    }

    if (users?.length) {
      const { password } = users[0];
      return password === userObj.password ? userObj.email : "";
    } else {
      return "";
    }
  } catch (e) {
    throw e;
  }
};

export const getColumns = async (email: string) => {
  try {
    const { data: columns, error } = await supabase
      .from("columns")
      .select("*")
      .eq("userEmail", email);

    if (error) {
      throw new Error(error.message);
    }

    return transformDbDataColumn(columns);
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

    if (error) {
      throw new Error(error.message);
    }

    return transformDbDataTask(cards);
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
    const { data: columns, error } = await supabase
      .from("columns")
      .insert([{ id: columnId, userEmail: email, title: columnTitle }])
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return columns;
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
    const { data: cards, error } = await supabase
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
      throw new Error(error.message);
    }

    return cards;
  } catch (e) {
    throw e;
  }
};

export const updateCardFromDb = async (
  cardId: string,
  cardDescription: string,
  email: string,
  columnId: string,
  date: string
) => {
  try {
    const { data: cards, error } = await supabase
      .from("cards")
      .update({
        description: cardDescription,
        updatedBy: email,
        column_id: columnId,
        created_at: date,
      })
      .eq("id", cardId)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return cards;
  } catch (e) {
    throw e;
  }
};

export const updateColumnNameFromDb = async (
  columnId: string,
  columnTitle: string
) => {
  try {
    const { data, error } = await supabase
      .from("columns")
      .update({ title: columnTitle })
      .eq("id", columnId)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (e) {
    throw e;
  }
};

export const deleteColumnFromDb = async (columnId: string) => {
  try {
    const { error } = await supabase.from("columns").delete().eq("id", columnId);

    if (error) {
      throw new Error(error.message);
    }
  } catch (e) {
    throw e;
  }
};

export const deleteTaskFromDb = async (taskId: string) => {
  try {
    const { error } = await supabase.from("cards").delete().eq("id", taskId);

    if (error) {
      throw new Error(error.message);
    }
  } catch (e) {
    throw e;
  }
};
