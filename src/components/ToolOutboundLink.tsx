"use client";

import type { ComponentPropsWithoutRef } from "react";
import { trackToolOutboundClick } from "@/lib/kit-analytics-client";
import {
  buildToolOutboundUrl,
  type ToolOutboundSurface,
} from "@/lib/tool-outbound-attribution";

type ToolOutboundLinkProps = Omit<
  ComponentPropsWithoutRef<"a">,
  "href" | "rel" | "target"
> & {
  href: string;
  surface: ToolOutboundSurface;
  systemSlug?: string;
  toolSlug: string;
};

export default function ToolOutboundLink({
  children,
  href,
  onClick,
  surface,
  systemSlug,
  toolSlug,
  ...props
}: ToolOutboundLinkProps) {
  const attributedHref = buildToolOutboundUrl(href);
  if (!attributedHref) return null;

  return (
    <a
      {...props}
      href={attributedHref}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => {
        trackToolOutboundClick({ surface, systemSlug, toolSlug });
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}
