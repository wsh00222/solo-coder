import { useState, useEffect, useMemo } from 'react';
import Statistics from '../components/Statistics.jsx';
import FilterBar from '../components/FilterBar.jsx';
import BookCard from '../components/BookCard.jsx';
import Pagination from '../components/Pagination.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import BookForm from '../components/BookForm.jsx';
import Toast from '../components/Toast.jsx';
import { initBooks, fetchBooks, createBook } from '../api/books.js';
import '../styles/pages/BookListPage.css';

const PAGE_SIZE = 6;

function BookListPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadBooks = async () => {
    try {
      setLoading(true);
      await initBooks();
      const data = await fetchBooks();
      setBooks(data);
    } catch (error) {
      showToast('加载书籍失败：' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, genreFilter, sortField, sortOrder]);

  const filteredBooks = useMemo(() => {
    let result = [...books];

    if (statusFilter) {
      result = result.filter(b => b.status === statusFilter);
    }

    if (genreFilter) {
      result = result.filter(b => b.genre === genreFilter);
    }

    if (sortField) {
      result.sort((a, b) => {
        let valueA = a[sortField];
        let valueB = b[sortField];

        if (sortField === 'title') {
          valueA = valueA.toLowerCase();
          valueB = valueB.toLowerCase();
        }

        if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [books, statusFilter, genreFilter, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredBooks.length / PAGE_SIZE);
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleAddBook = async (bookData) => {
    try {
      const newBook = await createBook(bookData);
      setBooks(prev => [...prev, newBook]);
      setShowAddModal(false);
      showToast('书籍添加成功！');
    } catch (error) {
      showToast('添加失败：' + error.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">正在加载书籍...</p>
      </div>
    );
  }

  return (
    <div className="book-list-page">
      <Statistics books={books} />
      <FilterBar
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        genreFilter={genreFilter}
        setGenreFilter={setGenreFilter}
        sortField={sortField}
        setSortField={setSortField}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        onAddBook={() => setShowAddModal(true)}
      />

      {books.length === 0 ? (
        <EmptyState onAddBook={() => setShowAddModal(true)} />
      ) : filteredBooks.length === 0 ? (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>没有找到匹配的书籍</h3>
          <p>试试调整筛选条件吧</p>
        </div>
      ) : (
        <>
          <div className="books-grid">
            {paginatedBooks.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          <div className="results-footer">
            <span className="results-count">
              当前筛选下共 <strong>{filteredBooks.length}</strong> 本书籍
            </span>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="📚 添加新书"
      >
        <BookForm
          onSubmit={handleAddBook}
          onCancel={() => setShowAddModal(false)}
          submitText="添加书籍"
        />
      </Modal>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
}

export default BookListPage;
