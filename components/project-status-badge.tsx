import type React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ProjectStatus } from "@prisma/client";

const statusVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      status: {
        [ProjectStatus.SYNCED]: "bg-green-100 text-green-800",
        [ProjectStatus.SYNCING]: "bg-blue-100 text-blue-800",
        [ProjectStatus.ERROR]: "bg-red-100 text-red-800",
      },
    },
    defaultVariants: {
      status: ProjectStatus.SYNCED,
    },
  }
);

interface ProjectStatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusVariants> {
  status: ProjectStatus;
}

export function ProjectStatusBadge({
  className,
  status,
  ...props
}: ProjectStatusBadgeProps) {
  return (
    <span className={cn(statusVariants({ status }), className)} {...props}>
      <span
        className={cn(
          "mr-1 inline-block h-2 w-2 rounded-full",
          getStatusDotClass(status)
        )}
      />
      {status}
    </span>
  );
}

function getStatusDotClass(status: ProjectStatus) {
  switch (status) {
    case ProjectStatus.SYNCED:
      return "bg-green-400 animate-pulse";
    case ProjectStatus.SYNCING:
      return "bg-blue-400 animate-spin";
    case ProjectStatus.ERROR:
      return "bg-red-400 animate-pulse";
    default:
      return "bg-gray-400";
  }
}
