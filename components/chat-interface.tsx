"use client";

import { useState, useEffect } from "react";
import { ChatMessage } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { Sidebar } from "@/components/sidebar";
import { ChatList } from "@/components/chat-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message, Project } from "@/types";

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
  const [isNewChat, setIsNewChat] = useState(false);
  const [hoveredMessage, setHoveredMessage] = useState<Message | null>(null);
  const [isMessageStuck, setIsMessageStuck] = useState(false);

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
    loadChats();
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
            prompt: msg.prompt,
            chainOfThought: msg.chainOfThought,
            references: msg.references,
            webSearch: msg.webSearch,
            createdAt: new Date(msg.createdAt),
          }))
        );
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };

    loadMessages();
  }, [currentChatId]);

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setIsNewChat(true);
  };

  const handleSendMessage = async (options: {
    message: string;
    chainOfThought: boolean;
    webSearch: boolean;
    agenticMode: boolean;
    ticketResolver: boolean;
  }) => {
    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: options.message,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let chatId = currentChatId;

      // Create new chat if this is the first message
      if (!chatId) {
        const chatResponse = await fetch("/api/chats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firstMessage: options.message }),
        });

        if (!chatResponse.ok) throw new Error("Failed to create chat");
        const newChat = await chatResponse.json();
        chatId = newChat.id;
        setCurrentChatId(chatId);
        setChats((prev) => [newChat, ...prev]);
        setIsNewChat(false);
      }

      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "user",
          message: options.message,
          chainOfThought: options.chainOfThought,
          webSearch: options.webSearch,
          agenticMode: options.agenticMode,
          ticketResolver: options.ticketResolver,
        }),
      });

      if (!response.ok) throw new Error("Failed to process message");

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: data.assistantMessage.id,
          role: "assistant",
          content: data.assistantMessage.content,
          relatedProjects: data.relatedProjects,
          prompt: data.assistantMessage.prompt,
          chainOfThought: data.assistantMessage.chainOfThought,
          references: data.assistantMessage.references,
          webSearch: data.assistantMessage.webSearch,
          createdAt: new Date(data.assistantMessage.createdAt),
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
    const clickedMessage = messages.find((m) => m.id === messageId);

    if (selectedMessageId === messageId) {
      setSelectedMessageId(null);
      setHoveredMessage(null);
      setIsMessageStuck(false);
    } else {
      setSelectedMessageId(messageId);
      setHoveredMessage(clickedMessage || null);
      setIsMessageStuck(true);
    }
  };

  const handleMessageHover = (message: Message | null) => {
    if (!isMessageStuck) {
      setHoveredMessage(message);
    }
  };

  return (
    <div className="flex h-full bg-gray-100">
      <ChatList
        chats={chats}
        currentChatId={currentChatId}
        onChatSelect={(id) => {
          setCurrentChatId(id);
          setIsNewChat(false);
        }}
        onNewChat={handleNewChat}
        isNewChat={isNewChat}
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
                  onHover={(projects) =>
                    handleMessageHover(projects ? message : null)
                  }
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
          hoveredProjects={hoveredMessage?.relatedProjects || null}
          selectedMessage={hoveredMessage}
          isStuck={isMessageStuck}
        />
      </div>
    </div>
  );
}
