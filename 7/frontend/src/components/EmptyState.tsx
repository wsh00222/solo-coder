import React from 'react';

interface EmptyStateProps {
  onCreateClick: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onCreateClick }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-32 h-32 mb-8 relative">
        <div className="absolute inset-0 bg-blue-100 rounded-full opacity-50 animate-pulse" />
        <div className="absolute inset-4 bg-blue-200 rounded-full opacity-70" />
        <div className="absolute inset-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-200">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
        还没有任何习惯
      </h2>
      <p className="text-gray-500 mb-8 text-center max-w-md">
        开始养成好习惯吧！创建你的第一个习惯，每天打卡坚持下去，
        见证自己的成长和改变。
      </p>

      <button
        onClick={onCreateClick}
        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold shadow-lg shadow-blue-200 hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        创建第一个习惯
      </button>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl">
        <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center mb-3 text-white shadow-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">每日打卡</h3>
          <p className="text-sm text-gray-600">简单一键打卡，追踪每日完成情况</p>
        </div>

        <div className="p-5 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border border-purple-100">
          <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center mb-3 text-white shadow-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">数据可视化</h3>
          <p className="text-sm text-gray-600">热力图展示打卡记录，直观了解进度</p>
        </div>

        <div className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-100">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center mb-3 text-white shadow-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">连续激励</h3>
          <p className="text-sm text-gray-600">追踪连续打卡天数，保持动力坚持</p>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
