import React from "react";

interface PaginationProps {
  pageCurrent: number;
  totalPage: number;
  paginate: (pageNumber: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  pageCurrent,
  totalPage,
  paginate,
}) => {
  const PaginList = [];
  const maxPagesToShow = 5;
  let startPage = Math.max(1, pageCurrent - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPage, startPage + maxPagesToShow - 1);

  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    PaginList.push(i);
  }

  return (
    <nav aria-label="Page navigation">
      <ul className="pagination">
        <li className={`page-item ${pageCurrent === 1 ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => pageCurrent > 1 && paginate(pageCurrent - 1)}
          >
            Previous
          </button>
        </li>
        {PaginList.map((page) => (
          <li
            className={`page-item ${pageCurrent === page ? "active" : ""}`}
            key={page}
          >
            <button className="page-link" onClick={() => paginate(page)}>
              {page}
            </button>
          </li>
        ))}
        <li
          className={`page-item ${pageCurrent === totalPage ? "disabled" : ""}`}
        >
          <button
            className="page-link"
            onClick={() => pageCurrent < totalPage && paginate(pageCurrent + 1)}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
