-- Migration: Add chat feature with conversations and messages tables
-- This enables real-time messaging between friends

-- Create conversations table
CREATE TABLE public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1 UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  participant_2 UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant_1, participant_2),
  CHECK (participant_1 != participant_2)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'image', 'file')) DEFAULT 'text',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_conversations_participant_1 ON public.conversations(participant_1);
CREATE INDEX idx_conversations_participant_2 ON public.conversations(participant_2);
CREATE INDEX idx_conversations_last_message_at ON public.conversations(last_message_at);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

-- Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations table
CREATE POLICY "Users can view their own conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = participant_1);

CREATE POLICY "Users can update their own conversations" ON public.conversations
  FOR UPDATE USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- RLS Policies for messages table
CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id 
      AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id 
      AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages" ON public.messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- Function to update conversation last_message_at when a new message is sent
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations 
  SET last_message_at = NEW.created_at, updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update conversation timestamp
CREATE TRIGGER on_message_created
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_conversation_last_message();

-- Triggers for updated_at
CREATE TRIGGER handle_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
