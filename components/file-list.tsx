"use client";

import { File } from "@/types";
import { useState } from "react";
import { FileIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProtocolModal } from "@/components/protocol-modal";

interface FileListProps {
  files?: File[];
}

export function FileList({ files = [] }: FileListProps) {
  const [modalFilePath, setModalFilePath] = useState<string | null>(null);

  if (!files || files.length === 0) {
    return <p className="text-sm text-gray-500 italic">No related files.</p>;
  }

  const handleFileClick = (absolutePath: string | null) => {
    if (!absolutePath) return;

    try {
      window.location.href = `file://${encodeURIComponent(absolutePath)}`;
    } catch (error) {
      console.error("Failed to open file:", error);
      setModalFilePath(absolutePath);
    }
  };

  return (
    <>
      <ScrollArea className="h-[200px] pr-4">
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li
              key={index}
              className="flex items-start space-x-2 text-sm group hover:bg-gray-50 rounded-md p-1 transition-colors duration-150 cursor-pointer"
              onClick={() => handleFileClick(file.absolutePath)}
            >
              <FileIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-700 truncate group-hover:text-blue-600 transition-colors duration-150">
                  {file.name}
                </p>
                <p className="text-gray-400 text-xs truncate">{file.path}</p>
              </div>
            </li>
          ))}
        </ul>
      </ScrollArea>
      <ProtocolModal
        isOpen={!!modalFilePath}
        filePath={modalFilePath ?? ""}
        onClose={() => setModalFilePath(null)}
      />
    </>
  );
}
