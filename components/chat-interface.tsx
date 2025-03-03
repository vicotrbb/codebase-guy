"use client";

import { useState, useEffect } from "react";
import { ChatMessage } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { Sidebar } from "@/components/sidebar";
import { ChatList } from "@/components/chat-list";
import { ScrollArea } from "@/components/ui/scroll-area";

interface File {
  name: string;
  path: string;
  absolutePath: string;
}

interface Project {
  id: number;
  name: string;
  relatedFiles?: File[];
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  relatedProjects?: Project[];
  createdAt?: Date;
}

interface Chat {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredProjects, setHoveredProjects] = useState<Project[] | null>(
    null
  );
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const loadChats = async () => {
    try {
      const response = await fetch("/api/chats");
      if (!response.ok) throw new Error("Failed to load chats");
      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.error("Error loading chats:", error);
    }
  };

  useEffect(() => {
    const initializeChat = async () => {
      try {
        await loadChats();
        if (chats.length > 0) {
          setCurrentChatId(chats[0].id);
        } else {
          const response = await fetch("/api/chats", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "New Chat" }),
          });
          const chat = await response.json();
          setCurrentChatId(chat.id);
          setChats([chat]);
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
      }
    };

    if (!currentChatId) {
      initializeChat();
    }
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      if (!currentChatId) return;

      try {
        const response = await fetch(`/api/chats/${currentChatId}/messages`);
        if (!response.ok) throw new Error("Failed to load messages");

        const messages = await response.json();
        setMessages(
          messages.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            relatedProjects: msg.relatedProjects,
            createdAt: new Date(msg.createdAt),
          }))
        );
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };

    loadMessages();
  }, [currentChatId]);

  const handleSendMessage = async (options: {
    message: string;
    chainOfThought: boolean;
    webSearch: boolean;
    agenticMode: boolean;
  }) => {
    if (!currentChatId) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: options.message,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      await fetch(`/api/chats/${currentChatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "user",
          content: options.message,
        }),
      });

      const aiResponse = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });

      if (!aiResponse.ok) throw new Error("Failed to fetch response");

      const data = await aiResponse.json();

      await fetch(`/api/chats/${currentChatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "assistant",
          content: data.message,
          relatedProjects: data.relatedProjects,
        }),
      });

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message,
          relatedProjects: data.relatedProjects,
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, there was an error processing your request.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageClick = (messageId: string) => {
    if (selectedMessageId === messageId) {
      setSelectedMessageId(null);
      setHoveredProjects(null);
    } else {
      setSelectedMessageId(messageId);
      const clickedMessage = messages.find((m) => m.id === messageId);
      setHoveredProjects(clickedMessage?.relatedProjects || null);
    }
  };

  const handleMessageHover = (projects: Project[] | null) => {
    if (!selectedMessageId) {
      setHoveredProjects(projects);
    }
  };

  const handleNewChat = async () => {
    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New Chat" }),
      });
      const chat = await response.json();
      setChats((prev) => [chat, ...prev]);
      setCurrentChatId(chat.id);
      setMessages([]);
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  return (
    <div className="flex h-full bg-gray-100">
      <ChatList
        chats={chats}
        currentChatId={currentChatId}
        onChatSelect={setCurrentChatId}
        onNewChat={handleNewChat}
      />
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 px-6 py-4">
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  id={message.id}
                  role={message.role}
                  content={message.content}
                  relatedProjects={message.relatedProjects}
                  onHover={handleMessageHover}
                  onClick={handleMessageClick}
                  isSelected={selectedMessageId === message.id}
                />
              ))}
              {isLoading && (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="max-w-3xl mx-auto">
              <ChatInput onSendMessage={handleSendMessage} />
            </div>
          </div>
        </div>
        <Sidebar
          hoveredProjects={hoveredProjects}
          isStuck={!!selectedMessageId}
        />
      </div>
    </div>
  );
}
