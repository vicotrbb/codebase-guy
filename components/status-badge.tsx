import type React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { AgentStatus } from "@prisma/client";

const statusVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      status: {
        [AgentStatus.STARTING]: "bg-yellow-100 text-yellow-800",
        [AgentStatus.ONLINE]: "bg-green-100 text-green-800",
        [AgentStatus.STOPPED]: "bg-gray-100 text-gray-800",
        [AgentStatus.ERROR]: "bg-red-100 text-red-800",
      },
    },
    defaultVariants: {
      status: AgentStatus.STOPPED,
    },
  }
);

interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusVariants> {
  status: AgentStatus;
}

export function StatusBadge({ className, status, ...props }: StatusBadgeProps) {
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

function getStatusDotClass(status: AgentStatus) {
  switch (status) {
    case AgentStatus.STARTING:
      return "bg-yellow-400 animate-pulse";
    case AgentStatus.ONLINE:
      return "bg-green-400 animate-ping";
    case AgentStatus.STOPPED:
      return "bg-gray-400 animate-none";
    case AgentStatus.ERROR:
      return "bg-red-400 animate-bounce";
    default:
      return "bg-gray-400";
  }
}
