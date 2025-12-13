import React from 'react';
import { TestStatus } from '../types';
import { CheckCircle, XCircle, MinusCircle, AlertTriangle } from 'lucide-react';

interface Props {
  status: TestStatus;
  mini?: boolean;
}

export const StatusBadge: React.FC<Props> = ({ status, mini = false }) => {
  switch (status) {
    case TestStatus.PASS:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 font-medium ${mini ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
          {!mini && <CheckCircle size={14} />}
          PASS
        </span>
      );
    case TestStatus.FAIL:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-100 text-rose-800 font-medium ${mini ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
          {!mini && <XCircle size={14} />}
          FAIL
        </span>
      );
    case TestStatus.NOT_RUN:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-800 font-medium ${mini ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
          {!mini && <MinusCircle size={14} />}
          NOT RUN
        </span>
      );
    case TestStatus.FLAKY:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-800 font-medium ${mini ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
          {!mini && <AlertTriangle size={14} />}
          FLAKY
        </span>
      );
    default:
      return null;
  }
};
