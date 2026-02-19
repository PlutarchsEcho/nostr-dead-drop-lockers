import { useState } from 'react';
import { useSeoMeta } from '@unhead/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, User } from 'lucide-react';

// Mock conversations
const MOCK_CONVERSATIONS = [
  {
    id: '1',
    pubkey: 'npub1abc123...',
    name: 'CryptoMike',
    lastMessage: 'Can you drop the package at the SF locker?',
    timestamp: '2 min ago',
    unread: true,
  },
  {
    id: '2',
    pubkey: 'npub1def456...',
    name: 'PrivacyPam',
    lastMessage: 'Thanks for the quick delivery!',
    timestamp: '1 hour ago',
    unread: false,
  },
  {
    id: '3',
    pubkey: 'npub1ghi789...',
    name: 'BitcoinBill',
    lastMessage: 'Locker code is 8472',
    timestamp: 'Yesterday',
    unread: false,
  },
];

const Messages = () => {
  useSeoMeta({
    title: 'Messages',
    description: 'Private encrypted messaging on Nostr',
  });

  const [selectedConversation, setSelectedConversation] = useState(MOCK_CONVERSATIONS[0]);
  const [messageInput, setMessageInput] = useState('');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 h-[calc(100vh-80px)]">
        <h1 className="text-2xl font-semibold mb-4">Messages</h1>
        
        <div className="grid md:grid-cols-3 gap-4 h-full">
          {/* Conversation List */}
          <div className="space-y-2">
            {MOCK_CONVERSATIONS.map((conv) => (
              <Card 
                key={conv.id}
                className={`cursor-pointer transition-colors ${
                  selectedConversation?.id === conv.id ? 'border-primary' : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedConversation(conv)}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{conv.name}</p>
                      {conv.unread && <span className="w-2 h-2 bg-primary rounded-full" />}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                    <p className="text-xs text-muted-foreground">{conv.timestamp}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chat Area */}
          <Card className="md:col-span-2 flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                </Avatar>
                <CardTitle className="text-base">{selectedConversation?.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4">
              <div className="flex-1 space-y-4 overflow-y-auto">
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-2 max-w-[80%]">
                    <p className="text-sm">Hey, I saw your locker listing.</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 max-w-[80%]">
                    <p className="text-sm">Hi! Yes, it's available. What do you need to store?</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-2 max-w-[80%]">
                    <p className="text-sm">{selectedConversation?.lastMessage}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Input 
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setMessageInput('');
                    }
                  }}
                />
                <Button size="icon" onClick={() => setMessageInput('')}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Messages;