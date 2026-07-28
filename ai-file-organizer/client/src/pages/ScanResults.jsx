import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { generatePreviewApi } from '../services/scanApi';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { 
  FileText, 
  FileCode, 
  FileCheck, 
  Sparkles, 
  Search, 
  Filter, 
  Copy, 
  ArrowRight,
  FolderOpen
} from 'lucide-react';

const ScanResults = () => {
  const navigate = useNavigate();
  const { activeScan, setActiveScan, setPreviewPlan, addToast, searchQuery } = useApp();
  const [loading, setLoading] = useState(false);
  const [filterExt, setFilterExt] = useState('all');
  const [localSearch, setLocalSearch] = useState('');

  if (!activeScan || !activeScan.files || activeScan.files.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center mx-auto text-slate-400">
          <FolderOpen className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">No Active Scan Session</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Please upload a folder from your computer to view extracted text and scan metadata.
        </p>
        <Button onClick={() => navigate('/upload')} variant="primary">
          Upload Folder
        </Button>
      </div>
    );
  }

  const files = activeScan.files || [];

  // Extensions list for filter pills
  const extensions = Array.from(new Set(files.map(f => f.extension)));

  const combinedSearch = (localSearch || searchQuery).toLowerCase();

  const filteredFiles = files.filter(file => {
    const matchesExt = filterExt === 'all' || file.extension === filterExt;
    const matchesQuery = !combinedSearch ||
      file.originalName.toLowerCase().includes(combinedSearch) ||
      (file.extractedText && file.extractedText.toLowerCase().includes(combinedSearch));
    return matchesExt && matchesQuery;
  });

  const handleGeneratePlan = async () => {
    try {
      setLoading(true);
      addToast('Gemini AI is analyzing document context and detecting duplicates...', 'info');

      const response = await generatePreviewApi(activeScan.scanId || activeScan._id);

      if (response.success) {
        setPreviewPlan(response);
        setActiveScan(response);
        addToast('AI Organization Plan generated successfully!', 'success');
        navigate('/preview');
      }
    } catch (error) {
      console.error('Preview Generation Error:', error);
      addToast(`Plan generation failed: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (ext) => {
    if (['.js', '.py', '.java', '.cpp', '.html', '.css', '.json'].includes(ext)) {
      return <FileCode className="w-5 h-5 text-indigo-500" />;
    }
    return <FileText className="w-5 h-5 text-emerald-500" />;
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Scan Results: {activeScan.folderName}
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Indexed {files.length} documents. Review extracted text before generating the AI plan.
          </p>
        </div>

        <Button
          onClick={handleGeneratePlan}
          loading={loading}
          variant="primary"
          size="lg"
          icon={Sparkles}
          className="shadow-glow"
        >
          {loading ? 'Analyzing with Gemini...' : 'Generate AI Plan'}
        </Button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Extension Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          <button
            onClick={() => setFilterExt('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterExt === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Files ({files.length})
          </button>
          {extensions.map(ext => (
            <button
              key={ext}
              onClick={() => setFilterExt(ext)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase transition-all ${
                filterExt === ext
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {ext} ({files.filter(f => f.extension === ext).length})
            </button>
          ))}
        </div>

        {/* Local Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Filter files..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Scanned Files Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFiles.map((file, idx) => (
          <Card key={file._id || idx} hover={true} className="flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                    {getFileIcon(file.extension)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate" title={file.originalName}>
                      {file.originalName}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono">{formatBytes(file.size)}</p>
                  </div>
                </div>
                {file.isDuplicate && (
                  <Badge variant="duplicate" text={file.duplicateStatus || 'Duplicate'} />
                )}
              </div>

              {/* Text Snippet Preview Box */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/50 font-mono text-[11px] text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                {file.extractedText || '[No readable text extracted]'}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px] text-slate-400">
              <span className="truncate" title={file.hash}>SHA256: {file.hash?.substring(0, 8)}...</span>
              <span className="uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">{file.extension}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ScanResults;
