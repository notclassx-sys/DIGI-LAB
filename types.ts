
export interface Book {
  id: string;
  title: string;
  description: string;
  price: number;
  pdf_path: string;
  thumbnail_path?: string;
  created_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  book_id: string;
  payment_status: 'pending' | 'completed' | 'failed';
  created_at: string;
  book?: Book;
}

export interface Message {
  id: string;
  sender_id: string;
  sender_email: string;
  recipient_id: string;
  content: string;
  created_at: string;
  is_admin: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
}
