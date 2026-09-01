"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function getElementsOutsideDialog(dialog: HTMLElement) {
  const elements = new Set<HTMLElement>();
  let current: HTMLElement | null = dialog;

  while (current && current !== document.body) {
    const parentElement: HTMLElement | null = current.parentElement;
    if (!parentElement) break;

    for (const sibling of parentElement.children) {
      if (sibling instanceof HTMLElement && sibling !== current) {
        elements.add(sibling);
      }
    }
    current = parentElement;
  }

  return [...elements];
}

export function useAccessibleDialog(input: {
  isOpen?: boolean;
  inertBodySiblings?: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const isOpen = input.isOpen ?? true;
  const onCloseRef = useRef(input.onClose);

  useEffect(() => {
    onCloseRef.current = input.onClose;
  }, [input.onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const dialog = dialogRef.current;
    if (!dialog) return;
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    const previousBodyOverscroll = document.body.style.overscrollBehavior;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousHtmlOverscroll =
      document.documentElement.style.overscrollBehavior;
    const inertBodySiblings = input.inertBodySiblings
      ? getElementsOutsideDialog(dialog)
          .map((element) => ({
            element,
            inert: element.inert,
            ariaHidden: element.getAttribute("aria-hidden"),
          }))
      : [];

    function isTopmostDialog() {
      const dialogs = Array.from(
        document.querySelectorAll<HTMLElement>('[role="dialog"]'),
      );
      return dialogs.at(-1) === dialog;
    }

    function getFocusableElements() {
      return Array.from(
        dialog?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [],
      ).filter(
        (element) =>
          element.getAttribute("aria-hidden") !== "true" &&
          !element.hasAttribute("disabled"),
      );
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (!dialog || !isTopmostDialog()) return;

      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements.at(-1);

      if (!firstFocusable || !lastFocusable) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === lastFocusable
      ) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }

    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
    for (const sibling of inertBodySiblings) {
      sibling.element.inert = true;
      sibling.element.setAttribute("aria-hidden", "true");
    }
    document.addEventListener("keydown", handleKeyDown);

    const focusFrame = window.requestAnimationFrame(() => {
      const initialFocus =
        dialog.querySelector<HTMLElement>("[data-dialog-initial-focus]") ??
        getFocusableElements()[0] ??
        dialog;
      initialFocus.focus();
    });

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousBodyOverscroll;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.documentElement.style.overscrollBehavior = previousHtmlOverscroll;
      for (const sibling of inertBodySiblings) {
        sibling.element.inert = sibling.inert;
        if (sibling.ariaHidden === null) {
          sibling.element.removeAttribute("aria-hidden");
        } else {
          sibling.element.setAttribute("aria-hidden", sibling.ariaHidden);
        }
      }
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [input.inertBodySiblings, isOpen]);

  return dialogRef;
}
