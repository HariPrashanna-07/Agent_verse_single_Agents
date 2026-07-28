import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { scanFolderApi } from '../services/scanApi';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { ProgressBar } from '../components/common/Loader';
import { FolderPlus, UploadCloud, Folder, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

const FolderUpload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { setActiveScan, addToast } = useApp();

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [folderName, setFolderName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFolderSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Infer folder name from first file webkitRelativePath or path
    let folder = 'Uploaded Folder';
    if (files[0].webkitRelativePath) {
      folder = files[0].webkitRelativePath.split('/')[0];
    }

    setFolderName(folder);
    setSelectedFiles(files);
    addToast(`Selected ${files.length} files from folder "${folder}"`, 'info');
  };

  const handleStartScan = async () => {
    if (selectedFiles.length === 0) {
      addToast('Please select a folder first.', 'error');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(10);

      const formData = new FormData();
      formData.append('folderName', folderName);

      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await scanFolderApi(formData, (percent) => {
        setUploadProgress(percent);
      });

      if (response.success) {
        setActiveScan(response);
        addToast(`Successfully scanned ${response.filesScanned || response.files.length} files.`, 'success');
        navigate('/results');
      }
    } catch (error) {
      console.error('Scan Error:', error);
      addToast(`Upload scan failed: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Select Folder to Analyze
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Choose a local folder from your computer. Gemini AI will scan and index every document.
        </p>
      </div>

      {/* Hidden Webkit Directory File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFolderSelect}
        webkitdirectory="true"
        multiple
        className="hidden"
      />

      {/* Drag & Drop Card Box */}
      <Card
        onClick={() => !uploading && fileInputRef.current?.click()}
        className="p-12 text-center border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500/80 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 cursor-pointer group transition-all"
      >
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/50 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Click to Browse Folder
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
          Native browser folder picker supports PDF, DOCX, TXT, MD, JSON, and source code files recursively.
        </p>

        <Button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          variant="secondary"
          icon={FolderPlus}
        >
          Select Folder from Computer
        </Button>
      </Card>

      {/* Selected Folder Summary Card */}
      {selectedFiles.length > 0 && (
        <Card className="p-6 space-y-6 border-indigo-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Folder className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{folderName}</h4>
                <p className="text-xs text-slate-400">{selectedFiles.length} documents ready for scanning</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50">
                <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                Folder Ready
              </span>
            </div>
          </div>

          {/* Upload Progress Bar */}
          {uploading && (
            <ProgressBar
              progress={uploadProgress}
              label={`Uploading and indexing ${selectedFiles.length} files...`}
            />
          )}

          {/* Start Action Button */}
          <div className="flex justify-end pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
            <Button
              onClick={handleStartScan}
              loading={uploading}
              variant="primary"
              size="lg"
              icon={ArrowRight}
            >
              {uploading ? 'Scanning Folder...' : 'Start Gemini Analysis'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default FolderUpload;
