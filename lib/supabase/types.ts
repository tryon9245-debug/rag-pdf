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
  created_at: string;
};

export type DocumentInsert = {
  id?: string;
  user_id?: string | null;
  file_name: string;
  file_url: string;
  created_at?: string;
};

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
        Update: Partial<DocumentInsert>;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
