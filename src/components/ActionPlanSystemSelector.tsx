"use client";

import { Check, ChevronDown, Search } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type { ActionPlanSystemOption } from "@/lib/action-plan-system-catalog";

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("fr")
    .trim();
}

export default function ActionPlanSystemSelector({
  options,
  value,
  onChange,
}: {
  options: readonly ActionPlanSystemOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedOption = options.find((option) => option.id === value);
  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(query);
    if (!normalizedQuery) return options;

    return options.filter((option) =>
      normalizeSearchValue([option.label, ...option.aliases].join(" ")).includes(
        normalizedQuery,
      ),
    );
  }, [options, query]);

  useEffect(() => {
    function closeOnOutsidePointer(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    window.requestAnimationFrame(() => searchRef.current?.focus());
  }, [isOpen]);

  function selectOption(option: ActionPlanSystemOption) {
    onChange(option.id);
    setQuery("");
    setIsOpen(false);
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setIsOpen(false);
      return;
    }

    if (!filteredOptions.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % filteredOptions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(
        (current) =>
          (current - 1 + filteredOptions.length) % filteredOptions.length,
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const activeOption = filteredOptions[activeIndex];
      if (activeOption) selectOption(activeOption);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full sm:max-w-xs">
      <button
        type="button"
        onClick={() => {
          setActiveIndex(0);
          setIsOpen((current) => !current);
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border bg-dema-paper px-4 text-left text-sm text-brand-blue shadow-[0_10px_28px_rgba(23,35,29,0.035)] outline-none transition ${
          isOpen
            ? "border-dema-forest/30 ring-4 ring-dema-sage/55"
            : "border-dema-line hover:border-dema-forest/20"
        }`}
      >
        <span className="truncate">{selectedOption?.label ?? "Choisir un système"}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-dema-forest transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-40 mt-2 w-full min-w-[18rem] overflow-hidden rounded-[1.35rem] border border-dema-line/80 bg-dema-paper p-2 shadow-[0_22px_52px_rgba(23,35,29,0.12)]">
          <div className="relative m-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dema-forest/45"
              aria-hidden="true"
            />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Rechercher un système…"
              role="combobox"
              aria-label="Rechercher un système métier"
              aria-expanded="true"
              aria-controls="action-plan-system-options"
              aria-autocomplete="list"
              aria-activedescendant={
                filteredOptions[activeIndex]
                  ? `action-plan-system-${filteredOptions[activeIndex].id}`
                  : undefined
              }
              className="min-h-11 w-full rounded-xl bg-dema-sage/55 pl-10 pr-3 text-sm text-brand-blue outline-none placeholder:text-dema-muted/70"
            />
          </div>

          <div
            id="action-plan-system-options"
            role="listbox"
            aria-label="Systèmes métier"
            className="soft-scroll mt-2 max-h-72 overflow-y-auto"
          >
            {filteredOptions.length ? (
              filteredOptions.map((option, index) => {
                const isSelected = option.id === value;
                const isActive = index === activeIndex;

                return (
                  <button
                    key={option.id}
                    id={`action-plan-system-${option.id}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(index)}
                    onFocus={() => setActiveIndex(index)}
                    onClick={() => selectOption(option)}
                    className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm transition ${
                      isActive
                        ? "bg-dema-sage text-brand-blue"
                        : "text-brand-blue/88 hover:bg-dema-sage/65"
                    }`}
                  >
                    <span>{option.label}</span>
                    {isSelected ? (
                      <Check className="h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" />
                    ) : null}
                  </button>
                );
              })
            ) : (
              <p className="px-4 py-6 text-center text-sm text-dema-muted">
                Aucun système trouvé.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
