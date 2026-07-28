import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getHistoryApi } from '../services/historyApi';
import { undoScanApi } from '../services/organizeApi';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { SkeletonCard } from '../components/common/Loader';
import { History, RotateCcw, Folder, ChevronDown, ChevronUp, Search, Calendar, Files } from 'lucide-react';

const HistoryPage = () => {
  const { addToast, searchQuery } = useApp();
  const [loading, setLoading] = useState(true);
  const [scans, setScans] = useState([]);
  const [expandedScanId, setExpandedScanId] = useState(null);
  const [undoingId, setUndoingId] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getHistoryApi(1, 20);
      setScans(data.scans || []);
    } catch (err) {
      console.error('Failed to fetch scan history:', err);
      addToast('Failed to load scan history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async (scanId) => {
    try {
      setUndoingId(scanId);
      addToast(`Reverting organization for scan ${scanId.substring(0, 8)}...`, 'info');

      const response = await undoScanApi(scanId);

      if (response.success) {
        addToast(`Scan organization reverted successfully. Restored ${response.revertedCount} files.`, 'success');
        fetchHistory();
      }
    } catch (error) {
      console.error('Undo Error:', error);
      addToast(`Undo operation failed: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setUndoingId(null);
    }
  };

  const filteredScans = scans.filter(scan => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return scan.folderName.toLowerCase().includes(query) ||
           scan.status.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200/60 dark:border-slate-800/60">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Scan & Organization History
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
          Timeline audit log of all previous scanning sessions with 1-Click Rollback support.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredScans.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          No scan history available. Upload a folder to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredScans.map((scan) => {
            const isExpanded = expandedScanId === scan._id;
            const isOrganized = scan.status === 'organized';

            return (
              <Card key={scan._id} className="p-6 transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                      <Folder className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {scan.folderName}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                          scan.status === 'organized'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                            : scan.status === 'undone'
                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {scan.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(scan.createdAt).toLocaleDateString()} {new Date(scan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Files className="w-3.5 h-3.5" />
                          {scan.statistics?.totalFiles || 0} files ({scan.statistics?.duplicateFiles || 0} duplicates)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {isOrganized && (
                      <Button
                        onClick={() => handleUndo(scan._id)}
                        loading={undoingId === scan._id}
                        variant="danger"
                        size="sm"
                        icon={RotateCcw}
                      >
                        Undo Organization
                      </Button>
                    )}

                    <Button
                      onClick={() => setExpandedScanId(isExpanded ? null : scan._id)}
                      variant="ghost"
                      size="sm"
                      icon={isExpanded ? ChevronUp : ChevronDown}
                    >
                      {isExpanded ? 'Hide Files' : 'Details'}
                    </Button>
                  </div>
                </div>

                {/* Expandable Details Drawer */}
                {isExpanded && scan.files && (
                  <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2 animate-in fade-in">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Scan Document Manifest ({scan.files.length})
                    </h4>
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                      {scan.files.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 text-xs">
                          <div className="truncate pr-4">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{file.originalName}</span>
                            {file.suggestedName && file.suggestedName !== file.originalName && (
                              <span className="text-indigo-500 font-mono ml-2">→ {file.suggestedName}</span>
                            )}
                          </div>
                          <Badge variant="category" text={file.category} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
