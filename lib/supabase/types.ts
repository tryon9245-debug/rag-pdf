/** Supabase `public` schema row types (hand-maintained until codegen). */

export type UserRow = {
  id: string;
  name: string | null;
  age: number | null;
  gender: string | null;
  job: string | null;
  created_at: string;
};

export type DocumentRow = {
  id: string;
  user_id: string | null;
  file_name: string | null;
  file_url: string | null;
  extracted_text: string | null;
  created_at: string;
};

export type DocumentInsert = {
  id?: string;
  user_id?: string | null;
  file_name: string;
  file_url: string;
  extracted_text?: string | null;
  created_at?: string;
};

export type DocumentUpdate = Partial<DocumentInsert>;

export type DocumentChunkRow = {
  id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  embedding: number[] | null;
  created_at: string;
};

export type DocumentChunkInsert = {
  id?: string;
  document_id: string;
  chunk_index: number;
  content: string;
  embedding?: number[] | null;
  created_at?: string;
};

export type DocumentChunkUpdate = Partial<DocumentChunkInsert>;

export type Database = {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: Partial<UserRow> & { id?: string };
        Update: Partial<UserRow>;
        Relationships: [];
      };
      documents: {
        Row: DocumentRow;
        Insert: DocumentInsert;
        Update: DocumentUpdate;
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      document_chunks: {
        Row: DocumentChunkRow;
        Insert: DocumentChunkInsert;
        Update: DocumentChunkUpdate;
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
