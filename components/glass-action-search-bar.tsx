"use client";

import { useState } from "react";
import ActionSearchBar, {
  type ActionSearchBarProps,
} from "@/components/kokonutui/action-search-bar";
import GlassSurface from "@/components/GlassSurface";

type GlassActionSearchBarProps = Omit<ActionSearchBarProps, "onOpenChange"> & {
  onOpenChange?: (open: boolean) => void;
};

export default function GlassActionSearchBar({
  className,
  onOpenChange,
  defaultOpen = false,
  ...props
}: GlassActionSearchBarProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <GlassSurface
      width="100%"
      height={open ? "auto" : 46}
      borderRadius={16}
      borderWidth={0.08}
      brightness={58}
      opacity={0.92}
      blur={16}
      backgroundOpacity={0.28}
      saturation={1.15}
      displace={0.35}
      className="glass-search-bar w-full max-w-md"
      style={{
        minHeight: 46,
        alignItems: "stretch",
        justifyContent: "stretch",
      }}
    >
      <ActionSearchBar
        {...props}
        defaultOpen={defaultOpen}
        className={className ?? "h-auto w-full max-w-none"}
        onOpenChange={(next) => {
          setOpen(next);
          onOpenChange?.(next);
        }}
      />
    </GlassSurface>
  );
}
