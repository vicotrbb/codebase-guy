import type React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      status: {
        SYNC: "bg-green-100 text-green-800",
        SYNCING: "bg-blue-100 text-blue-800",
        UNSYNC: "bg-red-100 text-red-800",
      },
    },
    defaultVariants: {
      status: "UNSYNC",
    },
  },
)

interface ProjectStatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof statusVariants> {
  status: "SYNC" | "SYNCING" | "UNSYNC"
}

export function ProjectStatusBadge({ className, status, ...props }: ProjectStatusBadgeProps) {
  return (
    <span className={cn(statusVariants({ status }), className)} {...props}>
      <span className={cn("mr-1 inline-block h-2 w-2 rounded-full", getStatusDotClass(status))} />
      {status}
    </span>
  )
}

function getStatusDotClass(status: "SYNC" | "SYNCING" | "UNSYNC") {
  switch (status) {
    case "SYNC":
      return "bg-green-400 animate-pulse"
    case "SYNCING":
      return "bg-blue-400 animate-spin"
    case "UNSYNC":
      return "bg-red-400 animate-pulse"
    default:
      return "bg-gray-400"
  }
}

