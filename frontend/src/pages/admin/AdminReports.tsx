import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { MdCancel, MdDelete, MdVisibility } from 'react-icons/md';
import Avatar from '../../components/common/Avatar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface Report {
  _id: string;
  reporter: {
    username: string;
    avatar?: string;
  };
  targetType: string;
  targetId: any;
  reason: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function AdminReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'pending' | 'resolved' | 'dismissed'>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/reports?status=${status}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setReports(data.reports);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  }, [user, status]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleResolve = async (reportId: string, action: 'dismissed' | 'deleted' | 'banned', reason: string = '') => {
    if (!user) return;
    setActionLoading(reportId);
    try {
      await axios.put(`${API_URL}/reports/${reportId}/resolve`, {
        action,
        reason
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setReports(prev => prev.filter(r => r._id !== reportId));
    } catch (err) {
      console.error('Failed to resolve report:', err);
      alert('Gagal menyelesaikan laporan');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && reports.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-black mb-1">Queue Laporan Komunitas</h2>
          <p className="text-sm text-black">Tinjau dan tangani konten yang dilaporkan oleh user.</p>
        </div>
        
        <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100">
          {(['pending', 'resolved', 'dismissed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                status === s 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reports.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-gray-100">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
            <h3 className="text-lg font-bold text-gray-900">Antrean Bersih!</h3>
            <p className="text-gray-400 text-sm">Tidak ada laporan {status} saat ini.</p>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report._id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
              <div className="p-6 flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      src={report.reporter.avatar} 
                      size="md" 
                      alt={report.reporter.username} 
                      username={report.reporter.username} 
                    />
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{report.reporter.username}</h4>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Melaporkan {report.targetType}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-red-50 text-red-500 text-[10px] font-black rounded-full uppercase">
                    {report.reason}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 italic text-sm text-gray-600">
                  {report.description ? `"${report.description}"` : "Tidak ada keterangan tambahan."}
                </div>

                {report.targetId && (
                  <div className="p-4 bg-white border border-gray-200 rounded-2xl relative">
                     <span className="absolute -top-2 left-4 px-2 py-0.5 bg-gray-200 text-gray-500 text-[9px] font-bold rounded uppercase">Isi Konten</span>
                     <p className="text-xs text-gray-700 line-clamp-3 leading-relaxed pt-1">
                      {report.targetId.title || report.targetId.content || "Konten tidak dapat dimuat."}
                     </p>
                  </div>
                )}
              </div>

              {status === 'pending' && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleResolve(report._id, 'dismissed')}
                    disabled={actionLoading === report._id}
                    className="flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-500 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-100 transition-all disabled:opacity-50"
                  >
                    <MdCancel /> Tolak
                  </button>
                  <button 
                    onClick={() => handleResolve(report._id, 'deleted', 'Konten melanggar aturan')}
                    disabled={actionLoading === report._id}
                    className="flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl text-xs font-bold hover:bg-amber-100 transition-all disabled:opacity-50"
                  >
                    <MdVisibility /> Sembunyikan
                  </button>
                  <button 
                    onClick={() => {
                        if(confirm('Hapus konten ini secara permanen?')) 
                            handleResolve(report._id, 'deleted', 'Konten dihapus oleh moderator')
                    }}
                    disabled={actionLoading === report._id}
                    className="flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-500 border border-red-100 rounded-xl text-xs font-bold hover:bg-red-100 transition-all disabled:opacity-50"
                  >
                    <MdDelete /> Hapus
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
