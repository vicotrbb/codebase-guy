import { FileList } from "@/components/file-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Modal } from "@/components/ui/modal";
import {
  Folder,
  Info,
  Search,
  Brain,
  Lightbulb,
  Link,
  GitGraphIcon,
} from "lucide-react";
import { useState } from "react";
import type {
  Message,
  WebSearchResult,
  ChatReference,
  Project,
  File,
} from "@/types";

interface SidebarProps {
  hoveredProjects: Project[] | null;
  selectedMessage: Message | null;
  isStuck?: boolean;
}

interface ModalState {
  isOpen: boolean;
  content: string | null;
  title: string;
}

export function Sidebar({
  hoveredProjects,
  selectedMessage,
  isStuck = false,
}: SidebarProps) {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    content: null,
    title: "",
  });

  const openModal = (content: string, title: string) => {
    setModalState({ isOpen: true, content, title });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, content: null, title: "" });
  };

  return (
    <aside className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full transition-[width] duration-200 ease-in-out">
      <div className="p-6 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <GitGraphIcon className="mr-2 h-5 w-5 text-blue-500" />
          Related Context
        </h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Projects Section */}
          {hoveredProjects && hoveredProjects.length > 0 && (
            <Section
              title="Related Projects"
              icon={<Folder className="h-5 w-5 text-blue-500" />}
            >
              {hoveredProjects.map((project) => (
                <div
                  key={project.id}
                  className="mb-6 bg-white rounded-lg shadow-sm p-4"
                >
                  <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                    <Folder className="mr-2 h-4 w-4 text-blue-500" />
                    {project.name}
                  </h3>
                  <FileList files={project.relatedFiles} />
                </div>
              ))}
            </Section>
          )}

          {/* Prompt Section */}
          {selectedMessage?.prompt && (
            <Section
              title="Prompt"
              icon={<Lightbulb className="h-5 w-5 text-yellow-500" />}
              onClick={() => openModal(selectedMessage.prompt!, "Prompt")}
            >
              <div className="p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {selectedMessage.prompt}
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  Click to view full prompt
                </p>
              </div>
            </Section>
          )}

          {/* Chain of Thought Section */}
          {selectedMessage?.chainOfThought && (
            <Section
              title="Chain of Thought"
              icon={<Brain className="h-5 w-5 text-purple-500" />}
              onClick={() =>
                openModal(selectedMessage.chainOfThought!, "Chain of Thought")
              }
            >
              <div className="p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {selectedMessage.chainOfThought}
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  Click to view full reasoning
                </p>
              </div>
            </Section>
          )}

          {/* Web Search Results Section */}
          {selectedMessage?.webSearch &&
            selectedMessage.webSearch.length > 0 && (
              <Section
                title="Web Search Results"
                icon={<Search className="h-5 w-5 text-green-500" />}
              >
                {selectedMessage.webSearch.map((result, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white rounded-lg mb-2 cursor-pointer hover:bg-gray-50"
                    onClick={() =>
                      openModal(JSON.stringify(result, null, 2), result.title)
                    }
                  >
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                      {result.title}
                    </h4>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {result.content}
                    </p>
                  </div>
                ))}
              </Section>
            )}

          {/* References Section */}
          {selectedMessage?.references &&
            selectedMessage.references.length > 0 && (
              <Section
                title="References"
                icon={<Link className="h-5 w-5 text-indigo-500" />}
              >
                {selectedMessage.references.map((reference, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white rounded-lg mb-2 cursor-pointer hover:bg-gray-50"
                    onClick={() =>
                      openModal(
                        JSON.stringify(reference, null, 2),
                        `Reference - ${reference.referenceType}`
                      )
                    }
                  >
                    <h4 className="text-sm font-medium text-gray-900">
                      {reference.referenceType}
                    </h4>
                    {reference.referenceContent && (
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {reference.referenceContent}
                      </p>
                    )}
                  </div>
                ))}
              </Section>
            )}

          {/* Empty State */}
          {!selectedMessage && !hoveredProjects && (
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Info className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                {isStuck
                  ? "Click the selected message to unpin related files."
                  : "Hover over or click a message to see related files."}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
      >
        <div className="whitespace-pre-wrap font-mono text-sm">
          {modalState.content}
        </div>
      </Modal>
    </aside>
  );
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}

function Section({ title, icon, children, onClick }: SectionProps) {
  return (
    <div
      className={`mb-6 ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <h2 className="text-lg font-semibold text-gray-800 flex items-center mb-3">
        {icon}
        <span className="ml-2">{title}</span>
      </h2>
      {children}
    </div>
  );
}
