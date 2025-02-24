"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendIcon, BrainCircuitIcon, SearchIcon, ZapIcon } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (options: {
    message: string;
    chainOfThought: boolean;
    webSearch: boolean;
    yoloMode: boolean;
  }) => void;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [chainOfThought, setChainOfThought] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const [yoloMode, setYoloMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage({
        message,
        chainOfThought,
        webSearch,
        yoloMode,
      });
      setMessage("");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Button
          type="button"
          size="sm"
          variant={chainOfThought ? "default" : "outline"}
          onClick={() => setChainOfThought(!chainOfThought)}
        >
          <BrainCircuitIcon className="h-4 w-4 mr-2" />
          Chain of Thought
        </Button>
        <Button
          type="button"
          size="sm"
          variant={webSearch ? "default" : "outline"}
          onClick={() => setWebSearch(!webSearch)}
        >
          <SearchIcon className="h-4 w-4 mr-2" />
          Web Search
        </Button>
        <Button
          type="button"
          size="sm"
          variant={yoloMode ? "default" : "outline"}
          onClick={() => setYoloMode(!yoloMode)}
        >
          <ZapIcon className="h-4 w-4 mr-2" />
          YOLO Mode
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <Input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about your codebase..."
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <SendIcon className="h-4 w-4" />
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </div>
  );
}
