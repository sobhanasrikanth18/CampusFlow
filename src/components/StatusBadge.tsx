import React from 'react';
import { OutpassStatus, HostelLeaveStatus } from '../types';

interface StatusBadgeProps {
  status: OutpassStatus | HostelLeaveStatus | 'registered' | 'checked_in' | 'checked_out';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'pending_mentor':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'approved_mentor':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'approved_hod':
      case 'approved':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'rejected_mentor':
      case 'rejected_hod':
      case 'rejected':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      case 'used':
      case 'checked_out':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
      case 'registered':
      case 'checked_in':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'pending_mentor':
        return 'Pending Mentor Review';
      case 'approved_mentor':
        return 'Mentor Approved (Pending HOD)';
      case 'approved_hod':
      case 'approved':
        return 'Approved (QR Generated)';
      case 'rejected_mentor':
        return 'Rejected by Mentor';
      case 'rejected_hod':
        return 'Rejected by HOD';
      case 'used':
        return 'Pass Utilized (Gate Checked)';
      case 'pending_warden':
        return 'Pending Warden Review';
      case 'registered':
        return 'Registered Visitor';
      case 'checked_in':
        return 'Visitor Checked In';
      case 'checked_out':
        return 'Checked Out';
      default:
        return String(status).replace('_', ' ');
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${getBadgeStyle()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {getLabel()}
    </span>
  );
};
