"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { PlusCircle, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Chat {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatListProps {
  chats: Chat[];
  currentChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  isNewChat: boolean;
}

export function ChatList({
  chats,
  currentChatId,
  onChatSelect,
  onNewChat,
  isNewChat,
}: ChatListProps) {
  return (
    <div className="w-64 border-r border-gray-200 bg-gray-50 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <Button
          onClick={onNewChat}
          className="w-full justify-start"
          variant="outline"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {isNewChat && (
            <Button variant="secondary" className="w-full justify-start">
              <MessageCircle className="mr-2 h-4 w-4" />
              <div className="flex flex-col items-start text-left">
                <span className="text-sm truncate">New Chat</span>
                <span className="text-xs text-gray-500">Just now</span>
              </div>
            </Button>
          )}
          {chats.map((chat) => (
            <Button
              key={chat.id}
              variant={currentChatId === chat.id ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => onChatSelect(chat.id)}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              <div className="flex flex-col items-start text-left">
                <span className="text-sm truncate">{chat.name}</span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(chat.updatedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
