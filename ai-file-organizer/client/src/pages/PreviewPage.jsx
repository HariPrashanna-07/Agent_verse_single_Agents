import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { organizeFilesApi } from '../services/organizeApi';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Folder, 
  FileText, 
  AlertTriangle,
  Info,
  Check,
  RotateCcw
} from 'lucide-react';

const PreviewPage = () => {
  const navigate = useNavigate();
  const { activeScan, setActiveScan, previewPlan, setPreviewPlan, addToast, searchQuery } = useApp();
  const [organizing, setOrganizing] = useState(false);
  const [filesState, setFilesState] = useState([]);
  const [editFile, setEditFile] = useState(null);

  useEffect(() => {
    const currentData = previewPlan || activeScan;
    if (currentData && currentData.files) {
      setFilesState(currentData.files);
    }
  }, [previewPlan, activeScan]);

  const currentScan = previewPlan || activeScan;

  if (!currentScan || !filesState || filesState.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">No AI Plan Ready</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Please upload a folder and generate an AI Organization Plan first.
        </p>
        <Button onClick={() => navigate('/upload')} variant="primary">
          Upload Folder
        </Button>
      </div>
    );
  }

  // Toggle single file approval
  const handleToggleApprove = (id) => {
    setFilesState(prev => prev.map(file => {
      if (file._id === id) {
        return { ...file, approved: !file.approved };
      }
      return file;
    }));
  };

  // Bulk Approve / Reject
  const handleBulkApprove = (status) => {
    setFilesState(prev => prev.map(file => ({ ...file, approved: status })));
  };

  // Save Modal Edits
  const handleSaveModalEdit = (updatedFile) => {
    setFilesState(prev => prev.map(f => f._id === updatedFile._id ? updatedFile : f));
    setEditFile(null);
    addToast(`Updated suggestions for ${updatedFile.originalName}`, 'success');
  };

  // Execute Organization Request
  const handleExecuteOrganize = async () => {
    const approvedList = filesState.filter(f => f.approved);
    if (approvedList.length === 0) {
      addToast('Please approve at least one file to organize.', 'error');
      return;
    }

    try {
      setOrganizing(true);
      addToast(`Organizing ${approvedList.length} files into category subfolders...`, 'info');

      const response = await organizeFilesApi(currentScan.scanId || currentScan._id, filesState);

      if (response.success) {
        addToast(`Successfully organized ${response.organizedFiles} files!`, 'success');
        setActiveScan(null);
        setPreviewPlan(null);
        navigate('/history');
      }
    } catch (error) {
      console.error('Organize Error:', error);
      addToast(`Organization failed: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setOrganizing(false);
    }
  };

  const approvedCount = filesState.filter(f => f.approved).length;

  const filteredFiles = filesState.filter(file => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return file.originalName.toLowerCase().includes(query) ||
           file.suggestedName.toLowerCase().includes(query) ||
           file.category.toLowerCase().includes(query) ||
           file.summary.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-xs font-semibold uppercase tracking-wider">
              Gemini AI Proposal Plan
            </span>
            <span className="text-xs font-medium text-slate-400">Scan ID: {currentScan._id?.substring(0, 8)}...</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Organization Plan Review
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Review Gemini AI's suggested categories, filenames, and duplicate warnings before modifying files.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => handleBulkApprove(true)}
            variant="secondary"
            size="sm"
          >
            Approve All
          </Button>
          <Button
            onClick={() => handleBulkApprove(false)}
            variant="ghost"
            size="sm"
          >
            Reject All
          </Button>
          <Button
            onClick={handleExecuteOrganize}
            loading={organizing}
            variant="primary"
            size="lg"
            icon={ArrowRight}
            className="shadow-glow"
          >
            {organizing ? 'Organizing Files...' : `Apply Plan (${approvedCount}/${filesState.length})`}
          </Button>
        </div>
      </div>

      {/* Main Diff Proposal Table / Cards */}
      <div className="space-y-4">
        {filteredFiles.map((file) => {
          const isApproved = file.approved !== false;

          return (
            <Card
              key={file._id}
              className={`p-5 transition-all duration-200 border ${
                isApproved
                  ? 'border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90'
                  : 'border-slate-200/40 dark:border-slate-900/40 opacity-60 bg-slate-50/50 dark:bg-slate-950/50'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Checkbox & File Diff View */}
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {/* Approve / Reject Checkbox */}
                  <button
                    onClick={() => handleToggleApprove(file._id)}
                    className={`mt-1 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                      isApproved
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                        : 'border-slate-300 dark:border-slate-700 bg-transparent text-transparent hover:border-slate-400'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </button>

                  <div className="space-y-3 min-w-0 flex-1">
                    {/* Visual Diff Flow: Original Name -> Target Category -> Suggested Name */}
                    <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base font-semibold">
                      <span className="text-slate-500 dark:text-slate-400 font-mono text-xs sm:text-sm truncate max-w-[200px]" title={file.originalName}>
                        📄 {file.originalName}
                      </span>
                      <ArrowRight className="w-4 h-4 text-indigo-500 shrink-0" />
                      <Badge variant="category" text={file.category} />
                      <ArrowRight className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="text-indigo-600 dark:text-indigo-400 font-mono text-xs sm:text-sm font-bold truncate max-w-[240px]" title={file.suggestedName}>
                        {file.suggestedName}
                      </span>
                    </div>

                    {/* Summary & Rationale */}
                    <div className="space-y-1">
                      {file.summary && (
                        <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-1">
                          <span className="font-semibold text-slate-400">Summary:</span> {file.summary}
                        </p>
                      )}
                      {file.reason && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 italic">
                          <span className="font-semibold text-slate-400 not-italic">AI Reason:</span> {file.reason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Metadata Badges & Edit Button */}
                <div className="flex items-center gap-3 shrink-0 self-end lg:self-center">
                  {file.isDuplicate && (
                    <Badge variant="duplicate" text={file.duplicateStatus || 'Duplicate'} title={file.duplicateReason} />
                  )}

                  <Button
                    onClick={() => setEditFile({ ...file })}
                    variant="ghost"
                    size="sm"
                    icon={Edit3}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Edit File Modal Dialog */}
      {editFile && (
        <Modal
          isOpen={!!editFile}
          onClose={() => setEditFile(null)}
          title={`Edit AI Suggestions: ${editFile.originalName}`}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Suggested Filename
              </label>
              <input
                type="text"
                value={editFile.suggestedName}
                onChange={(e) => setEditFile({ ...editFile, suggestedName: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category Folder
              </label>
              <input
                type="text"
                value={editFile.category}
                onChange={(e) => setEditFile({ ...editFile, category: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
              <Button onClick={() => setEditFile(null)} variant="ghost" size="sm">
                Cancel
              </Button>
              <Button onClick={() => handleSaveModalEdit(editFile)} variant="primary" size="sm">
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PreviewPage;
