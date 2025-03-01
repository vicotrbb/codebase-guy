"use client";

import { useState } from "react";
import { ChatMessage } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { Sidebar } from "@/components/sidebar";
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
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredProjects, setHoveredProjects] = useState<Project[] | null>(
    null
  );
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );

  const handleSendMessage = async (options: {
    message: string;
    chainOfThought: boolean;
    webSearch: boolean;
    agenticMode: boolean;
  }) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: Date.now().toString(), role: "user", content: options.message },
    ]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      const data = await response.json();
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message,
          relatedProjects: data.relatedProjects,
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
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

  return (
    <div className="flex h-full bg-gray-100">
      <Sidebar
        hoveredProjects={hoveredProjects}
        isStuck={!!selectedMessageId}
      />
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
    </div>
  );
}
