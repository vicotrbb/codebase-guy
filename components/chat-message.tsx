"use client";

import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Project, File } from "@/types";

interface ChatMessageProps {
  id: string;
  role: "user" | "assistant";
  content: string;
  relatedProjects?: Project[];
  onHover: (projects: Project[] | null) => void;
  onClick: (id: string) => void;
  isSelected: boolean;
}

export function ChatMessage({
  id,
  role,
  content,
  relatedProjects,
  onHover,
  onClick,
  isSelected,
}: ChatMessageProps) {
  return (
    <div
      className={`p-4 rounded-lg ${
        role === "assistant" ? "bg-white" : "bg-blue-50"
      } ${isSelected ? "ring-2 ring-blue-500" : ""}`}
      onMouseEnter={() => onHover(relatedProjects || null)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(id)}
    >
      {role === "user" ? (
        <p className="text-sm text-blue-800">{content}</p>
      ) : (
        <ReactMarkdown
          className="text-sm text-gray-800 prose max-w-none"
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <div className="relative rounded-lg overflow-hidden my-4">
                  <div className="absolute top-0 right-0 px-4 py-1 text-xs font-medium text-gray-400 bg-gray-800/50 rounded-bl">
                    {match[1]}
                  </div>
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      padding: "2rem 1rem 1rem",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                    }}
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <code
                  className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-800 text-sm"
                  {...props}
                >
                  {children}
                </code>
              );
            },
            // Improve other markdown elements
            h1: ({ children }) => (
              <h1 className="text-xl font-bold text-gray-900 mb-4 mt-6">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-lg font-semibold text-gray-800 mb-3 mt-5">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-base font-medium text-gray-800 mb-2 mt-4">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-gray-700 mb-4 leading-relaxed">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside mb-4 text-gray-700 space-y-1">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside mb-4 text-gray-700 space-y-1">
                {children}
              </ol>
            ),
            li: ({ children }) => <li className="ml-4">{children}</li>,
          }}
        >
          {content}
        </ReactMarkdown>
      )}
    </div>
  );
}
