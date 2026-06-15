import { useState, useEffect, useRef } from "react";

const GEOAPIFY_API_KEY = import.meta.env.REACT_APP_GEOAPIFY_KEY || "e43911e06f084271bc3fe690985ead81";
const AUTOCOMPLETE_URL = "https://api.geoapify.com/v1/geocode/autocomplete";

export const AddressAutocomplete = ({ placeholder, onSelect, initialValue = "" }) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceTimer = useRef(null);
  const containerRef = useRef(null);
  const isInternalChange = useRef(false); // prevent parent sync loops

  // Sync parent’s initialValue only if it’s a genuine external change
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    if (initialValue !== inputValue) {
      setInputValue(initialValue);
    }
  }, [initialValue, inputValue]);

  // Debounced search for suggestions
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (inputValue.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const url = `${AUTOCOMPLETE_URL}?text=${encodeURIComponent(inputValue)}&apiKey=${GEOAPIFY_API_KEY}&limit=5&format=json`;
        const response = await fetch(url);
        const data = await response.json();

        if (data?.features && Array.isArray(data.features)) {
          const formatted = data.features.map(feature => ({
            display_name: feature.properties.formatted,
            lat: feature.geometry.coordinates[1],
            lon: feature.geometry.coordinates[0],
          }));
          setSuggestions(formatted);
          setShowDropdown(formatted.length > 0);
        } else {
          setSuggestions([]);
          setShowDropdown(false);
        }
      } catch (err) {
        console.error("Geoapify fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(debounceTimer.current);
  }, [inputValue]);

  const handleSelect = (suggestion) => {
    isInternalChange.current = true;
    setInputValue(suggestion.display_name);
    setShowDropdown(false);
    onSelect({
      label: suggestion.display_name,
      value: suggestion.display_name,
      coords: { lat: suggestion.lat, lng: suggestion.lon },
    });
  };

  const handleChange = (e) => {
    isInternalChange.current = true;
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    // When user leaves the field, send whatever is in the input as free text
    if (inputValue.trim()) {
      onSelect({
        label: inputValue.trim(),
        value: inputValue.trim(),
        coords: null,
      });
    }
    setShowDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
        handleBlur(); // also capture free text on outside click
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [inputValue]);

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "14px 16px",
          borderRadius: 14,
          border: "1.5px solid #d8eed8",
          background: "#f4f8f4",
          fontSize: 15,
          fontFamily: "'DM Sans',sans-serif",
          outline: "none",
          boxSizing: "border-box",
        }}
        onFocus={() => inputValue.length >= 3 && suggestions.length > 0 && setShowDropdown(true)}
      />
      {isLoading && (
        <div style={{ position: "absolute", right: 12, top: 14, fontSize: 12, color: "#8aaa8a" }}>
          ⌛
        </div>
      )}
      {showDropdown && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "white",
            borderRadius: 12,
            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            marginTop: 4,
            padding: 0,
            listStyle: "none",
            zIndex: 1300,
            maxHeight: 240,
            overflowY: "auto",
            border: "1px solid #e0e8e0",
          }}
        >
          {suggestions.map((s, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(s)}
              style={{
                padding: "10px 14px",
                borderBottom: "1px solid #f0f0f0",
                cursor: "pointer",
                fontSize: 13,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f4f8f4")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
            >
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};