import { FileList } from "@/components/file-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Folder, Info } from "lucide-react";

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

interface SidebarProps {
  hoveredProjects: Project[] | null;
  isStuck?: boolean;
}

export function Sidebar({ hoveredProjects, isStuck = false }: SidebarProps) {
  return (
    <aside
      className={`w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full transition-[width] duration-200 ease-in-out`}
    >
      <div className="p-6 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <Folder className="mr-2 h-5 w-5 text-blue-500" />
          Related Projects
        </h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3">
          {hoveredProjects ? (
            hoveredProjects.map((project) => (
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
            ))
          ) : (
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
    </aside>
  );
}
