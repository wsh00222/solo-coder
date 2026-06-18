import React, { useState, useEffect, useCallback } from 'react';
import { proposalApi, statisticsApi } from '../services/api';
import { ProposalWithVotes, Statistics, CreateProposalRequest, UpdateProposalRequest } from '../types';
import ProposalCard from '../components/ProposalCard';
import Pagination from '../components/Pagination';
import StatisticsPanel from '../components/StatisticsPanel';
import ProposalModal from '../components/ProposalModal';
import { useToast } from '../components/Toast';
import { getStatusText } from '../utils/vote';

const HomePage: React.FC = () => {
  const { showToast } = useToast();
  const [proposals, setProposals] = useState<ProposalWithVotes[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [proposers, setProposers] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [proposerFilter, setProposerFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const pageSize = 4;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const statusParam = statusFilter === 'all' ? undefined : statusFilter;
      const proposerParam = proposerFilter || undefined;

      const [proposalsRes, statsRes, proposersRes] = await Promise.all([
        proposalApi.getProposals(page, pageSize, statusParam, proposerParam),
        statisticsApi.getStatistics(),
        proposalApi.getProposers(),
      ]);

      setProposals(proposalsRes.data);
      setTotal(proposalsRes.total);
      setStatistics(statsRes);
      setProposers(proposersRes);
    } catch (error) {
      console.error('加载数据失败:', error);
      showToast('加载数据失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, proposerFilter, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, proposerFilter]);

  const handleCreateProposal = async (data: CreateProposalRequest | UpdateProposalRequest) => {
    try {
      await proposalApi.createProposal(data as CreateProposalRequest);
      setIsModalOpen(false);
      showToast('提案创建成功！', 'success');
      fetchData();
    } catch (error: any) {
      console.error('创建提案失败:', error);
      showToast(error.response?.data?.error || '创建提案失败', 'error');
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  if (loading && !statistics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">团队提案投票决策工具</h1>
              <p className="text-gray-500 mt-1">让每个声音都被听见，让决策更民主</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              创建新提案
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {statistics && <StatisticsPanel statistics={statistics} />}

        <div className="mt-8 bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800">提案列表</h2>
            <div className="flex flex-wrap gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'open' | 'closed')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">全部状态</option>
                <option value="open">进行中</option>
                <option value="closed">已截止</option>
              </select>

              <select
                value={proposerFilter}
                onChange={(e) => setProposerFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">全部提案人</option>
                {proposers.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {proposals.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">暂无提案</h3>
              <p className="text-gray-500 mb-6">
                {statusFilter !== 'all' || proposerFilter
                  ? '当前筛选条件下没有提案，试试其他筛选条件吧'
                  : '还没有任何提案，点击上方按钮创建第一个提案吧'}
              </p>
              {(statusFilter !== 'all' || proposerFilter) && (
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setProposerFilter('');
                  }}
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  清除筛选条件
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {proposals.map((proposal) => (
                  <ProposalCard key={proposal.id} proposal={proposal} />
                ))}
              </div>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />

              <div className="text-center text-gray-500 mt-4">
                共 {total} 个提案
                {statusFilter !== 'all' && ` · ${getStatusText(statusFilter)}`}
                {proposerFilter && ` · 提案人: ${proposerFilter}`}
              </div>
            </>
          )}
        </div>
      </main>

      <ProposalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProposal}
        mode="create"
      />
    </div>
  );
};

export default HomePage;
