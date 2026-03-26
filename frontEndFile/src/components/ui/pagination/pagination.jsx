// components/ui/Pagination.jsx
import React from "react";
import Button from "../Button/button";
import styles from "./pagination.module.css";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const handlePrev = () => currentPage > 1 && onPageChange(currentPage - 1);
  const handleNext = () => currentPage < totalPages && onPageChange(currentPage + 1);

  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }

    return pages;
  };

  return (
    <div className={styles.paginationContainer}>
      <Button onClick={handlePrev} disabled={currentPage === 1} className={styles.navButton}>
        Prev
      </Button>
      {getPageNumbers().map((p, idx) =>
        p === "..." ? (
          <span key={idx} className={styles.ellipsis}>
            ...
          </span>
        ) : (
          <Button
            key={idx}
            variant={p === currentPage ? "primary" : "secondary"}
            onClick={() => onPageChange(p)}
            disabled={p === currentPage}
            className={styles.pageButton}
          >
            {p}
          </Button>
        )
      )}
      <Button onClick={handleNext} disabled={currentPage === totalPages} className={styles.navButton}>
        Next
      </Button>
    </div>
  );
};

export default Pagination;