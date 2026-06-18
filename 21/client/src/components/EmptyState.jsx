import '../styles/components/EmptyState.css';

function EmptyState({ onAddBook }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">📚</div>
      <h2 className="empty-state-title">书架空空如也</h2>
      <p className="empty-state-desc">
        开始收藏你的第一本书吧！记录下书名、作者、评分和阅读状态，
        打造属于你的私人书库。
      </p>
      <div className="empty-state-tips">
        <div className="tip-item">
          <span className="tip-icon">💡</span>
          <span>按类型分类整理（小说/科技/生活）</span>
        </div>
        <div className="tip-item">
          <span className="tip-icon">⭐</span>
          <span>为读过的书打星评分</span>
        </div>
        <div className="tip-item">
          <span className="tip-icon">📖</span>
          <span>标记想读、在读、读完状态</span>
        </div>
      </div>
      <button className="btn btn-primary btn-large" onClick={onAddBook}>
        ➕ 添加我的第一本书
      </button>
    </div>
  );
}

export default EmptyState;
