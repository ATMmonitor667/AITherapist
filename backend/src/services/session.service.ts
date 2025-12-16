// Session Service - Database CRUD

import supabase from "../config/db";
import {
  Session,
  CreateSessionRequest,
  UpdateSessionRequest
} from "../types";

/**
 * Create a new session.
 */
export async function createSession(data: Partial<Session>, userId?: string): Promise<Session | null> {
  try {
    const insertData = {
      ...data,
      ...(userId ? { user_id: userId } : {})
    };

    const { data: session, error } = await supabase
      .from("sessions")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Error creating session:", error);
      return null;
    }

    return session;
  } catch (error) {
    console.error("Session creation error:", error);
    return null;
  }
}

/**
 * Get a session by ID.
 */
export async function getSessionById(id: string, userId?: string): Promise<Session | null> {
  try {
    let query = supabase
      .from("sessions")
      .select("*")
      .eq("id", id);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: session, error } = await query.single();

    if (error) {
      console.error("Error fetching session:", error);
      return null;
    }

    return session;
  } catch (error) {
    console.error("Session fetch error:", error);
    return null;
  }
}

/**
 * Update a session.
 */
export async function updateSession(id: string, data: UpdateSessionRequest): Promise<Session | null> {
  try {
    const { data: session, error } = await supabase
      .from("sessions")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating session:", error);
      return null;
    }

    return session;
  } catch (error) {
    console.error("Session update error:", error);
    return null;
  }
}

/**
 * Get paginated sessions (History).
 */
export async function getSessions(limit: number = 20, offset: number = 0, userId?: string): Promise<Session[]> {
  try {
    let query = supabase
      .from("sessions")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: sessions, error } = await query;

    if (error) {
      console.error("Error fetching sessions:", error);
      return [];
    }

    return sessions || [];
  } catch (error) {
    console.error("Sessions fetch error:", error);
    return [];
  }
}

/**
 * Delete a session.
 */
export async function deleteSession(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("sessions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting session:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Session deletion error:", error);
    return false;
  }
}
