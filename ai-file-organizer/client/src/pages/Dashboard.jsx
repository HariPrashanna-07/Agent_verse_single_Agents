import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getHistoryApi } from '../services/historyApi';
import StatCard from '../components/dashboard/StatCard';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { SkeletonCard } from '../components/common/Loader';
import { 
  Files, 
  CheckCheck, 
  Copy, 
  HardDrive, 
  Zap, 
  FolderPlus, 
  Sparkles, 
  ArrowRight,
  PieChart,
  History
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { searchQuery, setActiveScan } = useApp();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await getHistoryApi(1, 5);
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = dashboardData?.dashboardStats || {
    totalFiles: 0,
    organizedFiles: 0,
    duplicateFiles: 0,
    totalSize: 0,
    largestCategory: 'N/A',
    averageConfidence: 0,
    categoryBreakdown: {}
  };

  const recentScans = dashboardData?.scans || [];

  // Filter recent scans by global search query
  const filteredScans = recentScans.filter(scan => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return scan.folderName.toLowerCase().includes(query) ||
           scan.status.toLowerCase().includes(query);
  });

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Real-time document intelligence & automated organization metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/upload')}
            variant="primary"
            icon={FolderPlus}
          >
            Upload Folder
          </Button>
        </div>
      </div>

      {/* Top Stat Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <StatCard
            title="Total Files Processed"
            value={stats.totalFiles.toLocaleString()}
            description="Scanned across all sessions"
            icon={Files}
            color="indigo"
          />
          <StatCard
            title="Files Organized"
            value={stats.organizedFiles.toLocaleString()}
            description={`${stats.totalFiles > 0 ? Math.round((stats.organizedFiles / stats.totalFiles) * 100) : 0}% success rate`}
            icon={CheckCheck}
            color="emerald"
          />
          <StatCard
            title="Duplicates Detected"
            value={stats.duplicateFiles.toLocaleString()}
            description="Exact SHA256 & Gemini semantic matches"
            icon={Copy}
            color="amber"
          />
          <StatCard
            title="Total Storage Analyzed"
            value={formatBytes(stats.totalSize)}
            description="Document payload processed"
            icon={HardDrive}
            color="indigo"
          />
          <StatCard
            title="Average AI Confidence"
            value={`${stats.averageConfidence}%`}
            description="Gemini classification score"
            icon={Zap}
            color="emerald"
          />
          <StatCard
            title="Top Dynamic Category"
            value={stats.largestCategory}
            description="Most frequent document type"
            icon={PieChart}
            color="amber"
          />
        </div>
      )}

      {/* Middle Section: Category Distribution & Quick Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Category Breakdown Card */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-500" />
              Dynamic Category Distribution
            </h3>
            <span className="text-xs font-medium text-slate-400">Gemini Categorized</span>
          </div>

          {Object.keys(stats.categoryBreakdown).length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              No categories analyzed yet. Upload a folder to view distribution.
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(stats.categoryBreakdown).map(([category, count]) => {
                const percentage = Math.round((count / (stats.totalFiles || 1)) * 100);
                return (
                  <div key={category} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800 dark:text-slate-200">{category}</span>
                      <span className="text-slate-500 dark:text-slate-400">{count} files ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(5, percentage)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Quick Organize Callout */}
        <Card className="bg-gradient-to-br from-indigo-900/90 to-slate-900 text-white border-indigo-500/30 flex flex-col justify-between p-6">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold tracking-tight mb-2">Smart Folder Scan</h3>
            <p className="text-xs text-indigo-200/80 leading-relaxed mb-6">
              Upload any local directory to let Gemini analyze document context, suggest clean filenames, and generate an approval plan.
            </p>
          </div>
          <Button
            onClick={() => navigate('/upload')}
            variant="primary"
            icon={ArrowRight}
            className="w-full justify-center bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-500/40"
          >
            Start Scan Now
          </Button>
        </Card>
      </div>

      {/* Bottom Section: Recent Scan Sessions Table */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-500" />
            Recent Scan History
          </h3>
          <Button
            onClick={() => navigate('/history')}
            variant="ghost"
            size="sm"
            icon={ArrowRight}
          >
            View All History
          </Button>
        </div>

        {filteredScans.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm">
            No recent scans found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200/60 dark:border-slate-800/60 text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
                  <th className="py-3 px-4">Folder Name</th>
                  <th className="py-3 px-4">Files</th>
                  <th className="py-3 px-4">Duplicates</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                {filteredScans.map((scan) => (
                  <tr key={scan._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      {scan.folderName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {scan.statistics?.totalFiles || 0}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {scan.statistics?.duplicateFiles || 0}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        scan.status === 'organized'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : scan.status === 'previewed'
                          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {scan.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs">
                      {new Date(scan.createdAt).toLocaleDateString()} {new Date(scan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        onClick={() => {
                          setActiveScan(scan);
                          if (scan.status === 'previewed') navigate('/preview');
                          else navigate('/results');
                        }}
                        variant="secondary"
                        size="sm"
                      >
                        View Plan
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
