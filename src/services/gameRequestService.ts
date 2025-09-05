import { supabase } from "../lib/supabase";

const REQUESTS_BUCKET = "requests";

export interface GameRequest {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: "Strategi" | "Aksi" | "Horor" | "Arcade" | "Puzzle";
  file_path: string;
  status: "waiting" | "accepted" | "declined";
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  user?: {
    username: string;
    email: string;
  } | null;
}

export interface CreateGameRequestData {
  title: string;
  description?: string;
  category: "Strategi" | "Aksi" | "Horor" | "Arcade" | "Puzzle";
  file: File;
}

export interface UpdateRequestStatusData {
  status: "accepted" | "declined";
  admin_notes?: string;
}

export const gameRequestService = {
  // Create a new game request
  async createRequest(data: CreateGameRequestData): Promise<GameRequest> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Upload file to requests bucket
    const fileName = `${user.id}/${Date.now()}-${data.file.name}`;
    const { error: uploadError } = await supabase.storage
      .from(REQUESTS_BUCKET)
      .upload(fileName, data.file);

    if (uploadError) throw uploadError;

    // Create database record
    const { data: request, error } = await supabase
      .from("game_requests")
      .insert({
        user_id: user.id,
        title: data.title,
        description: data.description,
        category: data.category,
        file_path: fileName,
      })
      .select()
      .single();

    if (error) throw error;
    return request as GameRequest;
  },

  // Get user's own requests
  async getUserRequests(): Promise<GameRequest[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("game_requests")
        .select(`
          id,
          user_id,
          title,
          description,
          category,
          file_path,
          status,
          admin_notes,
          reviewed_by,
          reviewed_at,
          created_at,
          updated_at,
          users!game_requests_user_id_fkey(username, email)
        `)
        .eq('user_id', user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error('Error fetching user requests:', error);
        throw new Error(`Failed to fetch requests: ${error.message}`);
      }
      return (data || []).map(item => {
        const { users, ...rest } = item;
        return {
          ...rest,
          user: Array.isArray(users) ? users[0] : users
        };
      }) as GameRequest[];
    } catch (err) {
      console.error('Service error in getUserRequests:', err);
      throw err;
    }
  },

  // Get all requests (admin only)
  async getAllRequests(): Promise<GameRequest[]> {
    try {
      const { data, error } = await supabase
        .from("game_requests")
        .select(`
          id,
          user_id,
          title,
          description,
          category,
          file_path,
          status,
          admin_notes,
          reviewed_by,
          reviewed_at,
          created_at,
          updated_at,
          users!game_requests_user_id_fkey(username, email)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error('Error fetching admin requests:', error);
        throw new Error(`Failed to fetch admin requests: ${error.message}`);
      }
      return (data || []).map(item => {
        const { users, ...rest } = item;
        return {
          ...rest,
          user: Array.isArray(users) ? users[0] : users
        };
      }) as GameRequest[];
    } catch (err) {
      console.error('Service error in getAllRequests:', err);
      throw err;
    }
  },

  // Update request status (admin only)
  async updateRequestStatus(
    requestId: string,
    updateData: UpdateRequestStatusData
  ): Promise<GameRequest> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("game_requests")
      .update({
        status: updateData.status,
        admin_notes: updateData.admin_notes,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId)
      .select(`
        id,
        user_id,
        title,
        description,
        category,
        file_path,
        status,
        admin_notes,
        reviewed_by,
        reviewed_at,
        created_at,
        updated_at,
        users!game_requests_user_id_fkey(username, email)
      `)
      .single();

    if (error) {
      console.error('Error updating request status:', error);
      throw new Error(`Failed to update request status: ${error.message}`);
    }
    
    // Automatically delete the uploaded file after review (accepted/declined)
    // This keeps storage clean once the admin has made a decision
    try {
      if (data?.file_path && (updateData.status === 'accepted' || updateData.status === 'declined')) {
        const { error: storageError } = await supabase.storage
          .from(REQUESTS_BUCKET)
          .remove([data.file_path]);
        // Ignore 404-like errors if the file was already removed earlier
        if (storageError) {
          console.warn('Warning: failed to auto-delete request file from storage:', storageError);
        }
      }
    } catch (e) {
      console.warn('Non-fatal: auto-delete storage failed:', e);
    }

    // Transform the data to match GameRequest interface
    const { users, ...rest } = data;
    return {
      ...rest,
      user: Array.isArray(users) ? users[0] : users
    } as GameRequest;
  },

  // Delete request
  async deleteRequest(requestId: string): Promise<void> {
    // First get the request to find the file path
    const { data: request, error: fetchError } = await supabase
      .from("game_requests")
      .select("file_path")
      .eq("id", requestId)
      .single();

    if (fetchError) throw fetchError;

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from(REQUESTS_BUCKET)
      .remove([request.file_path]);

    if (storageError) throw storageError;

    // Delete database record
    const { error } = await supabase
      .from("game_requests")
      .delete()
      .eq("id", requestId);

    if (error) throw error;
  },

  // Manually delete only the request file from storage (admin only)
  async deleteRequestFile(requestId: string): Promise<void> {
    // Get file path for the request
    const { data: request, error: fetchError } = await supabase
      .from('game_requests')
      .select('file_path')
      .eq('id', requestId)
      .single();

    if (fetchError) throw fetchError;

    if (!request?.file_path) {
      // Nothing to delete
      return;
    }

    const { error: storageError } = await supabase.storage
      .from(REQUESTS_BUCKET)
      .remove([request.file_path]);

    if (storageError) throw storageError;
  },

  // Get download URL for request file (admin only)
  async getRequestFileUrl(filePath: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from(REQUESTS_BUCKET)
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) throw error;
    return data.signedUrl;
  },

  // Check if user is admin
  async isUserAdmin(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error) return false;
    return data?.role === "admin";
  },
};
