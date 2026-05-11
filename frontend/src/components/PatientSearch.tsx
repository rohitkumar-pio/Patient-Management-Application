import React, { useState } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import './PatientSearch.scss';

interface PatientSearchProps {
  onSearchChange: (searchTerm: string) => void;
  placeholder?: string;
}

const PatientSearch: React.FC<PatientSearchProps> = ({
  onSearchChange,
  placeholder = 'Search by name or phone...',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Call onSearchChange when debounced value changes
  React.useEffect(() => {
    onSearchChange(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearchChange]);

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <div className="patient-search-container">
      {/* Search Icon */}
      <div className="search-icon">
        <svg
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Search Input */}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="patient-search-input"
      />

      {/* Clear Button */}
      {searchTerm && (
        <button
          onClick={handleClear}
          className="search-clear-btn"
          aria-label="Clear search"
        >
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default PatientSearch;
