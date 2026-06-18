import React from 'react';
import { Link } from 'react-router-dom';
import { ProposalWithVotes } from '../types';
import { formatDateTime, isExpiringSoon } from '../utils/date';
import { getStatusText } from '../utils/vote';
import VoteProgressBar from './VoteProgressBar';

interface ProposalCardProps {
  proposal: ProposalWithVotes;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ proposal }) => {
  const expiringSoon = isExpiringSoon(proposal.deadline);
  const isOpen = proposal.status === 'open';

  return (
    <Link
      to={`/proposals/${proposal.id}`}
      className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 group"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
            {proposal.title}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            {expiringSoon && isOpen && (
              <div className="flex items-center gap-1 text-orange-500" title="即将截止">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            )}
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                isOpen
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {getStatusText(proposal.status)}
            </span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {proposal.description}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>{proposal.proposer}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{formatDateTime(proposal.deadline)}</span>
          </div>
        </div>

        <VoteProgressBar
          approveCount={proposal.approveCount}
          rejectCount={proposal.rejectCount}
          totalVotes={proposal.totalVotes}
        />
      </div>
    </Link>
  );
};

export default ProposalCard;
