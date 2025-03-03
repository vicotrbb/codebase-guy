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

  const hasContent = selectedMessage || hoveredProjects?.length;

  return (
    <aside className="w-80 bg-white border-l border-gray-200 flex flex-col h-full transition-all duration-200 ease-in-out shadow-lg">
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <GitGraphIcon className="mr-2 h-5 w-5 text-blue-600" />
          Message Context
        </h2>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="py-4 space-y-6">
          {!hasContent ? (
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <Info className="mx-auto h-8 w-8 text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 font-medium">
                {isStuck
                  ? "Click the selected message to unpin context"
                  : "Hover over a message to see its context"}
              </p>
            </div>
          ) : (
            <>
              {/* Projects Section */}
              {hoveredProjects && hoveredProjects.length > 0 && (
                <Section
                  title="Related Projects"
                  icon={<Folder className="h-5 w-5 text-blue-600" />}
                >
                  <div className="space-y-3">
                    {hoveredProjects.map((project) => (
                      <div
                        key={project.id}
                        className="bg-gray-50 rounded-lg p-3 transition-all hover:bg-gray-100"
                      >
                        <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                          <Folder className="mr-2 h-4 w-4 text-blue-600" />
                          {project.name}
                        </h3>
                        <FileList files={project.relatedFiles} />
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Prompt Section */}
              {selectedMessage?.prompt && (
                <Section
                  title="Prompt"
                  icon={<Lightbulb className="h-5 w-5 text-amber-600" />}
                  onClick={() => openModal(selectedMessage.prompt!, "Prompt")}
                >
                  <div className="bg-gray-50 rounded-lg p-3 cursor-pointer transition-all hover:bg-gray-100">
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {selectedMessage.prompt}
                    </p>
                    <p className="text-xs text-blue-600 mt-2 font-medium">
                      Click to view full prompt →
                    </p>
                  </div>
                </Section>
              )}

              {/* Chain of Thought Section */}
              {selectedMessage?.chainOfThought && (
                <Section
                  title="Chain of Thought"
                  icon={<Brain className="h-5 w-5 text-purple-600" />}
                  onClick={() =>
                    openModal(
                      selectedMessage.chainOfThought!,
                      "Chain of Thought"
                    )
                  }
                >
                  <div className="bg-gray-50 rounded-lg p-3 cursor-pointer transition-all hover:bg-gray-100">
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {selectedMessage.chainOfThought}
                    </p>
                    <p className="text-xs text-blue-600 mt-2 font-medium">
                      Click to view full reasoning →
                    </p>
                  </div>
                </Section>
              )}

              {/* Web Search Results Section */}
              {selectedMessage?.webSearch &&
                selectedMessage.webSearch.length > 0 && (
                  <Section
                    title="Web Search Results"
                    icon={<Search className="h-5 w-5 text-green-600" />}
                  >
                    <div className="space-y-2">
                      {selectedMessage.webSearch.map((result, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 rounded-lg p-3 cursor-pointer transition-all hover:bg-gray-100"
                          onClick={() =>
                            openModal(
                              JSON.stringify(result, null, 2),
                              result.title
                            )
                          }
                        >
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-1 mb-1">
                            {result.title}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {result.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

              {/* References Section */}
              {selectedMessage?.references &&
                selectedMessage.references.length > 0 && (
                  <Section
                    title="References"
                    icon={<Link className="h-5 w-5 text-indigo-600" />}
                  >
                    <div className="space-y-2">
                      {selectedMessage.references.map((reference, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 rounded-lg p-3 cursor-pointer transition-all hover:bg-gray-100"
                          onClick={() =>
                            openModal(
                              JSON.stringify(reference, null, 2),
                              `Reference - ${reference.referenceType}`
                            )
                          }
                        >
                          <h4 className="text-sm font-medium text-gray-900 mb-1">
                            {reference.referenceType}
                          </h4>
                          {reference.referenceContent && (
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {reference.referenceContent}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </Section>
                )}
            </>
          )}
        </div>
      </ScrollArea>

      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
      >
        <div className="whitespace-pre-wrap font-mono text-sm p-4 bg-gray-50 rounded-lg">
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
    <div className={onClick ? "cursor-pointer group" : ""} onClick={onClick}>
      <h2 className="text-sm font-semibold text-gray-900 flex items-center mb-3">
        {icon}
        <span className="ml-2">{title}</span>
      </h2>
      {children}
    </div>
  );
}
