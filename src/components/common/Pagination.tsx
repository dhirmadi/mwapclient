import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Always show first page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => onPageChange(1)}
          className="px-3 py-1 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:bg-opacity-50 hover:text-white transition-colors duration-300"
        >
          1
        </button>
      );
      
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis-start" className="px-2 py-1 text-gray-400">
            ...
          </span>
        );
      }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-300 ${
            i === currentPage
              ? 'bg-primary-600 bg-opacity-50 text-white shadow-glow'
              : 'text-gray-300 hover:bg-gray-700 hover:bg-opacity-50 hover:text-white'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Always show last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis-end" className="px-2 py-1 text-gray-400">
            ...
          </span>
        );
      }
      
      pages.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className="px-3 py-1 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:bg-opacity-50 hover:text-white transition-colors duration-300"
        >
          {totalPages}
        </button>
      );
    }
    
    return pages;
  };

  return (
    <div className={`flex items-center justify-center space-x-1 glass-panel py-2 px-4 rounded-lg ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-300 ${
          currentPage === 1
            ? 'text-gray-500 cursor-not-allowed opacity-50'
            : 'text-gray-300 hover:bg-gray-700 hover:bg-opacity-50 hover:text-white'
        }`}
      >
        Previous
      </button>
      
      {renderPageNumbers()}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-300 ${
          currentPage === totalPages
            ? 'text-gray-500 cursor-not-allowed opacity-50'
            : 'text-gray-300 hover:bg-gray-700 hover:bg-opacity-50 hover:text-white'
        }`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;