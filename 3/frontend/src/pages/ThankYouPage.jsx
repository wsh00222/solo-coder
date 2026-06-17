import React from 'react';
import { Link } from 'react-router-dom';

/**
 * 回答提交成功后的感谢页
 */
export default function ThankYouPage() {
  return (
    <div className="container">
      <div className="thanks-card">
        <div className="thanks-icon">✓</div>
        <h1>提交成功，感谢您的回答！</h1>
        <p>您的反馈对我们非常重要，我们会认真阅读每一份回答。</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn-outline" style={{ textDecoration: 'none' }}>
            返回首页
          </Link>
          <button
            className="btn-primary"
            onClick={() => window.location.reload()}
          >
            再填一份
          </button>
        </div>
      </div>
    </div>
  );
}
