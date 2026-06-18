import { useState, useEffect } from 'react'

function RecordForm({ categories, record, onSubmit, onCancel }) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('其他')
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (record) {
      setAmount(record.amount.toString())
      setCategory(record.category)
      setDate(record.date)
      setNote(record.note || '')
    } else {
      setAmount('')
      setCategory('其他')
      setDate(new Date().toISOString().split('T')[0])
      setNote('')
    }
    setError('')
  }, [record])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const amountNum = parseFloat(amount)

    if (!amount || amount.trim() === '' || isNaN(amountNum)) {
      setError('请输入有效金额')
      return
    }

    if (amountNum === 0) {
      setError('金额不能为 0')
      return
    }

    try {
      await onSubmit({
        amount: amountNum,
        category: category || '其他',
        date,
        note
      })
    } catch (err) {
      setError(err.message || '提交失败')
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">
          {record ? '编辑记录' : '添加记录'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>金额（正数为收入，负数为支出）</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="请输入金额，如 100.00 或 -50.00"
              autoFocus
            />
            {error && <div className="error-text">{error}</div>}
          </div>

          <div className="form-group">
            <label>类别</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>日期</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>备注（可选）</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="添加备注..."
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onCancel}
            >
              取消
            </button>
            <button type="submit" className="btn-confirm">
              {record ? '保存修改' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RecordForm
