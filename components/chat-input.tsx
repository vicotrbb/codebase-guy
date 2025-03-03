"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SendIcon,
  BrainCircuitIcon,
  SearchIcon,
  ZapIcon,
  TicketIcon,
  FileIcon,
  FolderIcon,
  GlobeIcon,
  BotIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChatReference, ChatReferenceType } from "@/types";
import { usePublicSettings } from "@/lib/providers/SettingsProvider";

interface Project {
  id: string;
  name: string;
}

interface FileReference {
  id: string;
  name: string;
  path: string;
  projectName: string;
}

interface ChatInputProps {
  onSendMessage: (options: {
    message: string;
    chainOfThought: boolean;
    webSearch: boolean;
    agenticMode: boolean;
    ticketResolver: boolean;
    references?: ChatReference[];
  }) => void;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const settings = usePublicSettings();
  const [message, setMessage] = useState("");
  const [chainOfThought, setChainOfThought] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const [agenticMode, setAgenticMode] = useState(false);
  const [ticketResolver, setTicketResolver] = useState(false);

  // Reference related states
  const [isReferenceDropdownOpen, setIsReferenceDropdownOpen] = useState(false);
  const [referenceType, setReferenceType] = useState<ChatReferenceType | null>(
    null
  );
  const [referenceQuery, setReferenceQuery] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [references, setReferences] = useState<ChatReference[]>([]);
  const [mentionMatches, setMentionMatches] = useState<
    { start: number; end: number }[]
  >([]);
  const [fileResults, setFileResults] = useState<FileReference[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isUrlInputActive, setIsUrlInputActive] = useState(false);
  const [tempUrl, setTempUrl] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [typeFilterQuery, setTypeFilterQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const REFERENCE_TYPE_LABELS = {
    [ChatReferenceType.FILE]: "File",
    [ChatReferenceType.PROJECT]: "Project",
    [ChatReferenceType.WEB]: "Web",
    [ChatReferenceType.AGENT]: "Agent",
  };

  const REFERENCE_TYPE_ICONS = {
    [ChatReferenceType.FILE]: <FileIcon className="h-4 w-4" />,
    [ChatReferenceType.PROJECT]: <FolderIcon className="h-4 w-4" />,
    [ChatReferenceType.WEB]: <GlobeIcon className="h-4 w-4" />,
    [ChatReferenceType.AGENT]: <BotIcon className="h-4 w-4" />,
  };

  // Reset dropdown state when closed
  useEffect(() => {
    if (!isReferenceDropdownOpen) {
      setReferenceType(null);
      setTypeFilterQuery("");
      setHighlightedIndex(0);
      setIsUrlInputActive(false);
      setTempUrl("");
    }
  }, [isReferenceDropdownOpen]);

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  // Check for @ mentions
  useEffect(() => {
    const atSymbolRegex = /@\w*/g;
    const matches: { start: number; end: number }[] = [];
    let match;

    while ((match = atSymbolRegex.exec(message)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    setMentionMatches(matches);

    // Check if cursor is inside an @ mention
    const isInsideMatch = matches.some(
      (match) => cursorPosition > match.start && cursorPosition <= match.end
    );

    // If cursor position is right after @, show dropdown
    const atPosition = message.lastIndexOf("@", cursorPosition - 1);

    if (
      atPosition !== -1 &&
      cursorPosition > atPosition &&
      !message.substring(atPosition + 1, cursorPosition).includes(" ")
    ) {
      if (!isReferenceDropdownOpen) {
        // Reset state when opening dropdown
        setReferenceType(null);
        setHighlightedIndex(0);
        setTypeFilterQuery("");
      }

      setIsReferenceDropdownOpen(true);
      setReferenceQuery(message.substring(atPosition + 1, cursorPosition));
      setTypeFilterQuery(message.substring(atPosition + 1, cursorPosition));
    } else if (!isInsideMatch && isReferenceDropdownOpen) {
      setIsReferenceDropdownOpen(false);
    }
  }, [message, cursorPosition]);

  // Filter reference types based on user input
  const filteredReferenceTypes = Object.entries(REFERENCE_TYPE_LABELS)
    .filter(
      ([type, label]) =>
        typeFilterQuery === "" ||
        label.toLowerCase().includes(typeFilterQuery.toLowerCase())
    )
    .map(([type, label]) => ({
      type: type as unknown as ChatReferenceType,
      label,
    }));

  // Search for files based on query
  useEffect(() => {
    if (referenceType === ChatReferenceType.FILE && referenceQuery) {
      const searchFiles = async () => {
        try {
          const res = await fetch(
            `/api/references/files?query=${encodeURIComponent(referenceQuery)}`
          );
          if (res.ok) {
            const data = await res.json();
            setFileResults(data);
            setHighlightedIndex(0); // Reset highlighted index when results change
          }
        } catch (error) {
          console.error("Error searching files:", error);
        }
      };

      // Debounce the search
      const debounceTimer = setTimeout(searchFiles, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [referenceType, referenceQuery]);

  // Auto-focus URL input when Web reference type is selected
  useEffect(() => {
    if (isUrlInputActive && urlInputRef.current) {
      urlInputRef.current.focus();
    }
  }, [isUrlInputActive]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    setCursorPosition(e.target.selectionStart || 0);
  };

  const handleCursorChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    setCursorPosition(e.currentTarget.selectionStart || 0);
  };

  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTypeFilterQuery(e.target.value);
    setHighlightedIndex(0);
  };

  const goBackToTypeSelection = () => {
    setReferenceType(null);
    setIsUrlInputActive(false);
    setHighlightedIndex(0);
    // Focus the type filter input after going back
    setTimeout(() => {
      const typeFilterInput = dropdownRef.current?.querySelector(
        'input[placeholder="Filter types..."]'
      ) as HTMLInputElement;
      if (typeFilterInput) {
        typeFilterInput.focus();
      }
    }, 0);
  };

  const selectReferenceType = (type: ChatReferenceType) => {
    setReferenceType(type);
    setHighlightedIndex(0);
    setReferenceQuery(""); // Reset query when changing type

    if (type === ChatReferenceType.WEB) {
      setIsUrlInputActive(true);
    } else {
      setIsUrlInputActive(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!isReferenceDropdownOpen) return;

    // Determine the current list of selectable items
    let itemsCount = 0;
    if (!referenceType) {
      itemsCount = filteredReferenceTypes.length;
    } else if (referenceType === ChatReferenceType.FILE) {
      itemsCount = fileResults.length;
    } else if (referenceType === ChatReferenceType.PROJECT) {
      itemsCount = projects.length;
    } else if (referenceType === ChatReferenceType.WEB && isUrlInputActive) {
      return; // Let the URL input handle its own keyboard events
    }

    if (itemsCount === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prevIndex) => (prevIndex + 1) % itemsCount);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(
          (prevIndex) => (prevIndex - 1 + itemsCount) % itemsCount
        );
        break;
      case "Enter":
        e.preventDefault();
        if (!referenceType) {
          if (filteredReferenceTypes.length > 0) {
            selectReferenceType(filteredReferenceTypes[highlightedIndex].type);
          }
        } else if (referenceType === ChatReferenceType.FILE) {
          if (fileResults.length > 0) {
            const file = fileResults[highlightedIndex];
            addReference(ChatReferenceType.FILE, file.path, file.name);
          }
        } else if (referenceType === ChatReferenceType.PROJECT) {
          if (projects.length > 0) {
            const project = projects[highlightedIndex];
            addReference(ChatReferenceType.PROJECT, project.id, project.name);
          }
        }
        break;
      case "Escape":
        e.preventDefault();
        if (referenceType) {
          goBackToTypeSelection();
        } else {
          setIsReferenceDropdownOpen(false);
        }
        break;
      case "Backspace":
        // If the global backspace is captured (not in an input field), go back to reference type selection
        if (referenceType) {
          e.preventDefault();
          goBackToTypeSelection();
        }
        break;
    }
  };

  // Handle backspace in specific input fields
  const handleBackspaceInInput = (
    e: KeyboardEvent<HTMLInputElement>,
    isEmpty: boolean
  ) => {
    if (e.key === "Backspace" && isEmpty && referenceType) {
      e.preventDefault();
      goBackToTypeSelection();
    }
  };

  const addReference = (
    type: ChatReferenceType,
    target: string,
    label: string
  ) => {
    // Find the @ symbol position
    const atPosition = message.lastIndexOf("@", cursorPosition - 1);
    if (atPosition === -1) return;

    // Create a new reference
    const newReference: ChatReference = {
      referenceType: type,
      referenceTarget: target,
    };

    setReferences([...references, newReference]);

    // Replace @query with @type:target
    const beforeAt = message.substring(0, atPosition);
    const afterQuery = message.substring(cursorPosition);
    const referenceText = `@${REFERENCE_TYPE_LABELS[type]}:${label}`;

    const newMessage = beforeAt + referenceText + afterQuery;
    setMessage(newMessage);

    // Update cursor position
    setTimeout(() => {
      if (inputRef.current) {
        const newPosition = atPosition + referenceText.length;
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newPosition, newPosition);
        setCursorPosition(newPosition);
      }
    }, 0);

    // Close the dropdown
    setIsReferenceDropdownOpen(false);
  };

  const addWebReference = () => {
    if (tempUrl) {
      addReference(ChatReferenceType.WEB, tempUrl, tempUrl);
      setTempUrl("");
      setIsUrlInputActive(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage({
        message,
        chainOfThought: ticketResolver ? true : chainOfThought,
        webSearch: ticketResolver ? false : webSearch,
        agenticMode: ticketResolver ? true : agenticMode,
        ticketResolver,
        references: references.length > 0 ? references : undefined,
      });
      setMessage("");
      setReferences([]);
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
                - Web Search: Disabled
                <br />
                - Agentic Mode: Enabled
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
                disabled={ticketResolver || !settings.webSearchEnabled}
              >
                <SearchIcon className="h-4 w-4 mr-2" />
                Web Search
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {!settings.webSearchEnabled
                  ? "Web search is disabled in settings"
                  : ticketResolver
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
                variant={agenticMode && !ticketResolver ? "default" : "outline"}
                onClick={() => !ticketResolver && setAgenticMode(!agenticMode)}
                disabled={ticketResolver || !settings.agenticModeEnabled}
              >
                <ZapIcon className="h-4 w-4 mr-2" />
                Agentic Mode
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {!settings.agenticModeEnabled
                  ? "Agentic mode is disabled in settings"
                  : ticketResolver
                  ? "This option is preset to enabled in Ticket Resolver mode."
                  : "Allow the model to perform actions and changes on behalf of the user.\n- Use with caution\n- Can lead to unintended consequences."}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex items-center space-x-2 relative"
      >
        <div className="flex-1 relative" onKeyDown={handleKeyDown}>
          <Input
            ref={inputRef}
            type="text"
            value={message}
            onChange={handleInputChange}
            onClick={handleCursorChange}
            onKeyUp={handleCursorChange}
            onKeyDown={(e) => {
              // Prevent arrow keys from moving cursor when dropdown is open
              if (
                isReferenceDropdownOpen &&
                (e.key === "ArrowUp" ||
                  e.key === "ArrowDown" ||
                  e.key === "Enter" ||
                  e.key === "Escape")
              ) {
                e.preventDefault();
              }
              handleCursorChange(e);
            }}
            placeholder="Ask about your codebase... (Type @ to reference)"
            className="flex-1"
          />

          {isReferenceDropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute left-0 right-0 bottom-full mb-1 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 overflow-hidden border border-gray-200 dark:border-gray-700"
              style={{ maxHeight: "300px" }}
            >
              {!referenceType ? (
                <div className="p-1">
                  <div className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                    Select reference type
                  </div>
                  <Input
                    type="text"
                    placeholder="Filter types..."
                    value={typeFilterQuery}
                    onChange={handleTypeFilterChange}
                    className="mb-1 h-8"
                    autoFocus
                  />
                  <div className="max-h-48 overflow-y-auto">
                    {filteredReferenceTypes.map((item, index) => (
                      <div
                        key={item.type}
                        className={`flex items-center px-2 py-1.5 text-sm cursor-pointer ${
                          highlightedIndex === index
                            ? "bg-gray-100 dark:bg-gray-700"
                            : ""
                        }`}
                        onClick={() => selectReferenceType(item.type)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                      >
                        <div className="mr-2 text-gray-500 dark:text-gray-400">
                          {REFERENCE_TYPE_ICONS[item.type]}
                        </div>
                        <div>{item.label}</div>
                      </div>
                    ))}
                    {filteredReferenceTypes.length === 0 && (
                      <div className="px-2 py-2 text-sm text-gray-500">
                        No matching reference types
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-1">
                  <div className="flex items-center justify-between px-2 py-1">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <span className="mr-1">
                        {REFERENCE_TYPE_ICONS[referenceType]}
                      </span>
                      <span>{REFERENCE_TYPE_LABELS[referenceType]}</span>
                    </div>
                    <button
                      type="button"
                      className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      onClick={goBackToTypeSelection}
                    >
                      Back
                    </button>
                  </div>

                  {referenceType === ChatReferenceType.FILE && (
                    <>
                      <Input
                        type="text"
                        placeholder="Search files..."
                        value={referenceQuery}
                        onChange={(e) => setReferenceQuery(e.target.value)}
                        onKeyDown={(e) =>
                          handleBackspaceInInput(e, referenceQuery === "")
                        }
                        className="mb-1 h-8"
                        autoFocus
                      />
                      <div className="max-h-48 overflow-y-auto">
                        {fileResults.length > 0 ? (
                          fileResults.map((file, index) => (
                            <div
                              key={file.id}
                              className={`flex items-start px-2 py-1.5 text-sm cursor-pointer ${
                                highlightedIndex === index
                                  ? "bg-gray-100 dark:bg-gray-700"
                                  : ""
                              }`}
                              onClick={() =>
                                addReference(
                                  ChatReferenceType.FILE,
                                  file.path,
                                  file.name
                                )
                              }
                              onMouseEnter={() => setHighlightedIndex(index)}
                            >
                              <FileIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                              <div className="overflow-hidden">
                                <div className="font-medium truncate">
                                  {file.name}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {file.path}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-2 py-2 text-sm text-gray-500">
                            {referenceQuery
                              ? "No files found"
                              : "Type to search for files"}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {referenceType === ChatReferenceType.PROJECT && (
                    <div className="max-h-48 overflow-y-auto">
                      {projects.length > 0 ? (
                        projects.map((project, index) => (
                          <div
                            key={project.id}
                            className={`flex items-center px-2 py-1.5 text-sm cursor-pointer ${
                              highlightedIndex === index
                                ? "bg-gray-100 dark:bg-gray-700"
                                : ""
                            }`}
                            onClick={() =>
                              addReference(
                                ChatReferenceType.PROJECT,
                                project.id,
                                project.name
                              )
                            }
                            onMouseEnter={() => setHighlightedIndex(index)}
                          >
                            <FolderIcon className="h-4 w-4 mr-2 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                            <div>{project.name}</div>
                          </div>
                        ))
                      ) : (
                        <div className="px-2 py-2 text-sm text-gray-500">
                          No projects found
                        </div>
                      )}
                    </div>
                  )}

                  {referenceType === ChatReferenceType.WEB && (
                    <div className="p-1">
                      <Input
                        ref={urlInputRef}
                        type="url"
                        placeholder="Enter URL"
                        value={tempUrl}
                        onChange={(e) => setTempUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && tempUrl) {
                            e.preventDefault();
                            addWebReference();
                          } else if (e.key === "Backspace" && tempUrl === "") {
                            e.preventDefault();
                            goBackToTypeSelection();
                          }
                        }}
                        className="mb-1 h-8"
                        autoFocus
                      />
                      <Button
                        onClick={addWebReference}
                        disabled={!tempUrl}
                        className="w-full h-8 text-sm"
                        size="sm"
                      >
                        Add URL
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <Button type="submit" size="icon">
          <SendIcon className="h-4 w-4" />
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </div>
  );
}
