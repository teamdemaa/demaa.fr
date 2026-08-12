"use client";

import { useCallback, useEffect, useState } from "react";
import {
  buildActionPlanAppHref,
  parseActionPlanAppContext,
  type ActionPlanAppContext,
} from "@/lib/action-plan-app-context";

export function useActionPlanAppContext(
  initialContext: ActionPlanAppContext,
) {
  const [context, setContext] = useState(initialContext);

  useEffect(() => {
    function restoreContext() {
      setContext(parseActionPlanAppContext(new URLSearchParams(window.location.search)));
    }

    window.addEventListener("popstate", restoreContext);
    return () => window.removeEventListener("popstate", restoreContext);
  }, []);

  const navigate = useCallback((
    nextContext: ActionPlanAppContext,
    mode: "push" | "replace" = "push",
  ) => {
    setContext(nextContext);
    const href = buildActionPlanAppHref({
      context: nextContext,
      pathname: window.location.pathname,
      search: window.location.search,
    });
    window.history[mode === "replace" ? "replaceState" : "pushState"](
      null,
      "",
      href,
    );
  }, []);

  return { context, navigate };
}
