"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { suggestAuLocations } from "@/lib/auLocations";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  tabIndex?: number;
  id?: string;
  name?: string;
  /** Extra content before the input (e.g. MapPin icon) */
  leading?: ReactNode;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
};

type MenuPos = { top: number; left: number; width: number };

export default function LocationSuggestInput({
  value,
  onChange,
  onSelect,
  placeholder = "Suburb / postcode",
  className = "",
  inputClassName = "",
  tabIndex,
  id,
  name,
  leading,
  onKeyDown,
}: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPos, setMenuPos] = useState<MenuPos | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [suggestions, setSuggestions] = useState(() =>
    suggestAuLocations(value, 8),
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setSuggestions(suggestAuLocations(value, 8));
    setActiveIndex(0);
  }, [value]);

  const hasQuery = value.trim().length > 0;
  const canShowSuggestions = open && hasQuery && suggestions.length > 0;

  const updateMenuPos = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 6,
      left: rect.left,
      width: Math.max(rect.width, 220),
    });
  }, []);

  useLayoutEffect(() => {
    if (!canShowSuggestions) {
      setMenuPos(null);
      return;
    }
    updateMenuPos();
    window.addEventListener("resize", updateMenuPos);
    window.addEventListener("scroll", updateMenuPos, true);
    return () => {
      window.removeEventListener("resize", updateMenuPos);
      window.removeEventListener("scroll", updateMenuPos, true);
    };
  }, [canShowSuggestions, suggestions.length, updateMenuPos]);

  useEffect(() => {
    function onDocPointer(e: MouseEvent) {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (listRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDocPointer);
    return () => document.removeEventListener("mousedown", onDocPointer);
  }, []);

  function pick(label: string) {
    onChange(label);
    onSelect?.(label);
    setOpen(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (canShowSuggestions) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % suggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex(
          (i) => (i - 1 + suggestions.length) % suggestions.length,
        );
        return;
      }
      if (e.key === "Enter" && suggestions[activeIndex]) {
        e.preventDefault();
        pick(suggestions[activeIndex].label);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
    }
    onKeyDown?.(e);
  }

  const showMenu =
    canShowSuggestions && mounted && menuPos;

  return (
    <div ref={rootRef} className={`location-suggest ${className}`.trim()}>
      <div className="location-suggest-field">
        {leading}
        <input
          id={id}
          name={name}
          type="text"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            open && suggestions[activeIndex]
              ? `${listId}-${activeIndex}`
              : undefined
          }
          tabIndex={tabIndex}
          placeholder={placeholder}
          className={inputClassName}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            updateMenuPos();
          }}
          onKeyDown={handleKeyDown}
        />
      </div>

      {showMenu
        ? createPortal(
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              className="location-suggest-list location-suggest-list--portal"
              aria-label="Location suggestions"
              style={{
                top: menuPos.top,
                left: menuPos.left,
                width: menuPos.width,
              }}
            >
              {suggestions.map((item, index) => (
                <li key={item.label} role="presentation">
                  <button
                    type="button"
                    id={`${listId}-${index}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    className={`location-suggest-option${
                      index === activeIndex ? " is-active" : ""
                    }`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      pick(item.label);
                    }}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>,
            document.body,
          )
        : null}
    </div>
  );
}
