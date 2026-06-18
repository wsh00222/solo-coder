import { useState, useEffect, useMemo } from 'react'
import Summary from './components/Summary'
import Toolbar from './components/Toolbar'
import RecordsList from './components/RecordsList'
import RecordForm from './components/RecordForm'
import ConfirmModal from './components/ConfirmModal'

const CATEGORIES = ['餐饮', '交通', '购物', '工资', '娱乐', '医疗', '教育', '其他']

function App() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('全部')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deletingIds, setDeletingIds] = useState([])

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (categoryFilter && categoryFilter !== '全部') {
        params.append('category', categoryFilter)
      }
      if (startDate) {
        params.append('startDate', startDate)
      }
      if (endDate) {
        params.append('endDate', endDate)
      }

      const res = await fetch(`/api/records?${params.toString()}`)
      const data = await res.json()
      setRecords(data)
    } catch (err) {
      console.error('获取记录失败:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [categoryFilter, startDate, endDate])

  const summary = useMemo(() => {
    let filteredRecords = records

    if (!startDate && !endDate) {
      const now = new Date()
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      filteredRecords = records.filter(r => r.date.startsWith(currentMonth))
    }

    const income = filteredRecords
      .filter(r => r.amount > 0)
      .reduce((sum, r) => sum + r.amount, 0)

    const expense = filteredRecords
      .filter(r => r.amount < 0)
      .reduce((sum, r) => sum + Math.abs(r.amount), 0)

    return {
      income,
      expense,
      balance: income - expense
    }
  }, [records, startDate, endDate])

  const handleAdd = () => {
    setEditingRecord(null)
    setShowForm(true)
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    setShowForm(true)
  }

  const handleDelete = (record) => {
    setDeleteTarget(record)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return

    setDeletingIds(prev => [...prev, deleteTarget.id])

    setTimeout(async () => {
      try {
        const res = await fetch(`/api/records/${deleteTarget.id}`, {
          method: 'DELETE'
        })
        if (res.ok) {
          setRecords(prev => prev.filter(r => r.id !== deleteTarget.id))
        }
      } catch (err) {
        console.error('删除失败:', err)
      } finally {
        setDeletingIds(prev => prev.filter(id => id !== deleteTarget.id))
        setDeleteTarget(null)
      }
    }, 300)
  }

  const handleSubmit = async (formData) => {
    try {
      let res
      if (editingRecord) {
        res = await fetch(`/api/records/${editingRecord.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      } else {
        res = await fetch('/api/records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      }

      if (res.ok) {
        setShowForm(false)
        setEditingRecord(null)
        fetchRecords()
      } else {
        const data = await res.json()
        throw new Error(data.error || '操作失败')
      }
    } catch (err) {
      throw err
    }
  }

  const handleResetFilters = () => {
    setCategoryFilter('全部')
    setStartDate('')
    setEndDate('')
  }

  return (
    <div className="app">
      <div className="header">
        <h1>💰 我的记账本</h1>
      </div>

      <Summary summary={summary} />

      <Toolbar
        categories={CATEGORIES}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        onAdd={handleAdd}
        onReset={handleResetFilters}
      />

      <RecordsList
        records={records}
        loading={loading}
        deletingIds={deletingIds}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showForm && (
        <RecordForm
          categories={CATEGORIES}
          record={editingRecord}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false)
            setEditingRecord(null)
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="确认删除"
          message="确定要删除这条记录吗？此操作不可撤销。"
          detail={`${deleteTarget.category}  ${deleteTarget.amount > 0 ? '+' : ''}${deleteTarget.amount.toFixed(2)}`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          danger
        />
      )}
    </div>
  )
}

export default App
