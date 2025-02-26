"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SendIcon,
  BrainCircuitIcon,
  SearchIcon,
  ZapIcon,
  TicketIcon,
} from "lucide-react";
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
    ticketResolver: boolean;
  }) => void;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [chainOfThought, setChainOfThought] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const [yoloMode, setYoloMode] = useState(false);
  const [ticketResolver, setTicketResolver] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage({
        message,
        chainOfThought: ticketResolver ? true : chainOfThought,
        webSearch: ticketResolver ? true : webSearch,
        yoloMode: ticketResolver ? false : yoloMode,
        ticketResolver,
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
                variant={ticketResolver ? "default" : "outline"}
                onClick={() => setTicketResolver(!ticketResolver)}
              >
                <TicketIcon className="h-4 w-4 mr-2" />
                Ticket Resolver
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Optimized mode for resolving tickets with predefined settings:
                <br />
                - Chain of Thought: Enabled
                <br />
                - Web Search: Enabled
                <br />
                - YOLO Mode: Disabled
                <br />- Best for addressing specific issues or tickets
              </p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant={
                  chainOfThought && !ticketResolver ? "default" : "outline"
                }
                onClick={() =>
                  !ticketResolver && setChainOfThought(!chainOfThought)
                }
                disabled={ticketResolver}
              >
                <BrainCircuitIcon className="h-4 w-4 mr-2" />
                Chain of Thought
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {ticketResolver
                  ? "This option is preset to enabled in Ticket Resolver mode."
                  : "Instruct the model to think through the problem step by step, reasoning about the problem first before any action or response.\n- More costly\n- Slower\n- More accurate"}
              </p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant={webSearch && !ticketResolver ? "default" : "outline"}
                onClick={() => !ticketResolver && setWebSearch(!webSearch)}
                disabled={ticketResolver}
              >
                <SearchIcon className="h-4 w-4 mr-2" />
                Web Search
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {ticketResolver
                  ? "This option is preset to enabled in Ticket Resolver mode."
                  : "Instruct the model to search the web for relevant information.\n- Slower\n- Supports fetching update-to-date information\n- Retrieves information from the web that might not be available on the codebase.\n- Useful for addressing bugs."}
              </p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant={yoloMode && !ticketResolver ? "default" : "outline"}
                onClick={() => !ticketResolver && setYoloMode(!yoloMode)}
                disabled={ticketResolver}
              >
                <ZapIcon className="h-4 w-4 mr-2" />
                YOLO Mode
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {ticketResolver
                  ? "This option is preset to disabled in Ticket Resolver mode."
                  : "Allow the model to perform actions and changes on behalf of the user.\n- Use with caution\n- Can lead to unintended consequences."}
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
