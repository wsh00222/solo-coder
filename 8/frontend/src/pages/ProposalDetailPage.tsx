import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { proposalApi, voteApi, statisticsApi } from '../services/api';
import { ProposalWithVotes, Vote, UpdateProposalRequest, CreateVoteRequest } from '../types';
import VoteProgressBar from '../components/VoteProgressBar';
import ConfirmModal from '../components/ConfirmModal';
import ProposalModal from '../components/ProposalModal';
import { useToast } from '../components/Toast';
import {
  formatDateTime,
  isExpiringSoon,
  getTimeRemaining,
} from '../utils/date';
import { getStatusText, getVoteTypeText } from '../utils/vote';

const ProposalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [proposal, setProposal] = useState<ProposalWithVotes | null>(null);
  const [userVote, setUserVote] = useState<Vote | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [voteType, setVoteType] = useState<'approve' | 'reject' | null>(null);
  const [nickname, setNickname] = useState('');
  const [showVoteForm, setShowVoteForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [voting, setVoting] = useState(false);

  const proposalId = parseInt(id || '0');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [proposalRes, voteRes, votesRes] = await Promise.all([
        proposalApi.getProposalById(proposalId),
        voteApi.getUserVote(proposalId),
        voteApi.getVotesByProposal(proposalId),
      ]);

      setProposal(proposalRes);
      setUserVote(voteRes);
      setVotes(votesRes);
    } catch (error: any) {
      console.error('加载提案详情失败:', error);
      if (error.response?.status === 404) {
        showToast('提案不存在', 'error');
        navigate('/');
      } else {
        showToast('加载提案详情失败', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (proposalId) {
      fetchData();
    }
  }, [proposalId]);

  const handleVote = async () => {
    if (!voteType || voting) return;

    try {
      setVoting(true);
      const data: CreateVoteRequest = {
        voteType,
        nickname: nickname.trim() || undefined,
      };

      await voteApi.createVote(proposalId, data);
      showToast('投票成功，感谢参与！', 'success');
      setShowVoteForm(false);
      setVoteType(null);
      setNickname('');
      fetchData();
      statisticsApi.getStatistics();
    } catch (error: any) {
      console.error('投票失败:', error);
      showToast(error.response?.data?.error || '投票失败', 'error');
    } finally {
      setVoting(false);
    }
  };

  const handleEditProposal = async (data: UpdateProposalRequest) => {
    try {
      await proposalApi.updateProposal(proposalId, data);
      setShowEditModal(false);
      showToast('提案更新成功！', 'success');
      fetchData();
      statisticsApi.getStatistics();
    } catch (error: any) {
      console.error('更新提案失败:', error);
      showToast(error.response?.data?.error || '更新提案失败', 'error');
    }
  };

  const handleDeleteProposal = async () => {
    try {
      await proposalApi.deleteProposal(proposalId);
      showToast('提案删除成功！', 'success');
      navigate('/');
      statisticsApi.getStatistics();
    } catch (error: any) {
      console.error('删除提案失败:', error);
      showToast(error.response?.data?.error || '删除提案失败', 'error');
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('链接已复制', 'success');
    } catch (error) {
      showToast('复制失败，请手动复制', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return null;
  }

  const isOpen = proposal.status === 'open';
  const expiringSoon = isExpiringSoon(proposal.deadline);
  const hasVoted = !!userVote;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回列表
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={copyLink}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                复制链接
              </button>
              {isOpen && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  编辑
                </button>
              )}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                删除
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-100">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {expiringSoon && isOpen && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    即将截止
                  </span>
                )}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isOpen
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {getStatusText(proposal.status)}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {proposal.title}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>提案人: <strong>{proposal.proposer}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>截止时间: <strong>{formatDateTime(proposal.deadline)}</strong></span>
            </div>
            {isOpen && (
              <div className="flex items-center gap-2 text-orange-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{getTimeRemaining(proposal.deadline)}</span>
              </div>
            )}
          </div>

          {proposal.attachmentUrl && (
            <div className="mb-6">
              <a
                href={proposal.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                查看附件
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </a>
            </div>
          )}

          <div className="prose max-w-none mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">提案详情</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {proposal.description}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">投票结果</h3>
            <VoteProgressBar
              approveCount={proposal.approveCount}
              rejectCount={proposal.rejectCount}
              totalVotes={proposal.totalVotes}
            />
          </div>

          {isOpen && !hasVoted && (
            <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50">
              {!showVoteForm ? (
                <div className="text-center">
                  <p className="text-gray-700 mb-4">您还没有对此提案投票，请选择您的立场</p>
                  <button
                    onClick={() => setShowVoteForm(true)}
                    className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
                  >
                    参与投票
                  </button>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                    请选择您的投票
                  </h3>
                  <div className="flex gap-4 mb-4">
                    <button
                      onClick={() => setVoteType('approve')}
                      className={`flex-1 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                        voteType === 'approve'
                          ? 'bg-green-500 text-white shadow-lg scale-105'
                          : 'bg-white text-green-600 border-2 border-green-300 hover:border-green-500'
                      }`}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      赞成
                    </button>
                    <button
                      onClick={() => setVoteType('reject')}
                      className={`flex-1 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                        voteType === 'reject'
                          ? 'bg-red-500 text-white shadow-lg scale-105'
                          : 'bg-white text-red-600 border-2 border-red-300 hover:border-red-500'
                      }`}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      反对
                    </button>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      昵称 <span className="text-gray-400 font-normal">(可选，不填则为匿名)</span>
                    </label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="请输入您的昵称"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowVoteForm(false)}
                      className="flex-1 py-3 text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleVote}
                      disabled={!voteType || voting}
                      className="flex-1 py-3 text-white bg-blue-500 hover:bg-blue-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {voting ? '提交中...' : '确认投票'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {hasVoted && (
            <div className="border-2 border-green-200 rounded-xl p-6 bg-green-50">
              <div className="flex items-center gap-3 text-green-700">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold">您已投票</p>
                  <p className="text-sm">
                    您投了
                    <span
                      className={`font-bold mx-1 ${
                        userVote?.voteType === 'approve'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {getVoteTypeText(userVote?.voteType || 'approve')}
                    </span>
                    票
                    {userVote?.nickname && ` (${userVote.nickname})`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isOpen && (
            <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50 text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-600">该提案已截止，不再接受新投票</p>
            </div>
          )}
        </div>

        {votes.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">投票记录 ({votes.length})</h2>
            <div className="space-y-3">
              {votes.map((vote) => (
                <div
                  key={vote.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        vote.voteType === 'approve'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {vote.voteType === 'approve' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {vote.nickname || '匿名用户'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDateTime(vote.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      vote.voteType === 'approve'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {getVoteTypeText(vote.voteType)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="确认删除"
        message="确定要删除这个提案吗？此操作将同时删除该提案的所有投票记录，且无法恢复。"
        confirmText="确认删除"
        cancelText="取消"
        type="danger"
        onConfirm={handleDeleteProposal}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <ProposalModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditProposal}
        proposal={proposal}
        mode="edit"
      />
    </div>
  );
};

export default ProposalDetailPage;
