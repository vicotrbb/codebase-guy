"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendIcon, BrainCircuitIcon, SearchIcon, ZapIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant={chainOfThought ? "default" : "outline"}
                onClick={() => setChainOfThought(!chainOfThought)}
              >
                <BrainCircuitIcon className="h-4 w-4 mr-2" />
                Chain of Thought
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Instruct the model to think through the problem step by step,
                reasoning about the problem first before any action or response.
                <br />
                - More costly
                <br />
                - Slower
                <br />- More accurate
              </p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant={webSearch ? "default" : "outline"}
                onClick={() => setWebSearch(!webSearch)}
              >
                <SearchIcon className="h-4 w-4 mr-2" />
                Web Search
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Instruct the model to search the web for relevant information.
                <br />
                - Slower
                <br />
                - Supports fetching update-to-date information
                <br />
                - Retrieves information from the web that might not be available
                on the codebase.
                <br />- Useful for addressing bugs.
              </p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant={yoloMode ? "default" : "outline"}
                onClick={() => setYoloMode(!yoloMode)}
              >
                <ZapIcon className="h-4 w-4 mr-2" />
                YOLO Mode
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Allow the model to perform actions and changes on behalf of the
                user.
                <br />- <strong>Use with caution</strong>
                <br />- Can lead to unintended consequences.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
