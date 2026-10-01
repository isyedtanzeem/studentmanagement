import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Printer,
  Edit2,
  Trash2,
  RefreshCw,
  Building2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  QrCode,
  Barcode,
  Layers,
  Sparkles,
  Users,
  Eye,
  Download
} from 'lucide-react';
import { IdCardRecord, IdCardQueryParams, IdCardStats, CollegeBrandingConfig, IdCardLayout } from '../../types/idCard';
import { idCardApi } from '../../api/idCardApi';
import { IdCardRenderer } from './IdCardRenderer';
import { IdCardGeneratorModal } from './IdCardGeneratorModal';
import { IdCardBrandingModal } from './IdCardBrandingModal';
import { IdCardPreviewPrintModal } from './IdCardPreviewPrintModal';

export const IdCardManagementView: React.FC = () => {
  const [cards, setCards] = useState<IdCardRecord[]>([]);
  const [stats, setStats] = useState<IdCardStats>({
    totalGenerated: 0,
    activeCards: 0,
    revokedCards: 0,
    expiredCards: 0,
    totalPrints: 0
  });
  const [branding, setBranding] = useState<CollegeBrandingConfig>({
    collegeName: 'ScholarCore Institute of Technology & Sciences',
    shortName: 'SCITS',
    tagline: 'Autonomous Institution • NAAC A+ Accredited',
    logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=200&q=80',
    principalSignatureUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Kirsch_Signature.png',
    address: 'Campus Drive, Academic Zone 4, Bengaluru, KA - 560103',
    contactPhone: '+91 80 4910 8800',
    contactEmail: 'registrar@scholarcore.edu.in',
    website: 'https://scholarcore.edu.in',
    primaryColor: '#1e1b4b',
    accentColor: '#D4AF37',
    cardHeaderBg: '#0f172a',
    showQrCode: true,
    showBarcode: true,
    showEmergencyPhone: true,
    showBloodGroup: true
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [layoutFilter, setLayoutFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Selection for Batch Actions
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);

  // Modals State
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isBrandingOpen, setIsBrandingOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<IdCardRecord | null>(null);
  const [previewPrintCards, setPreviewPrintCards] = useState<IdCardRecord[]>([]);

  useEffect(() => {
    fetchCards();
  }, [page, limit, search, departmentFilter, statusFilter, layoutFilter]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: IdCardQueryParams = {
        page,
        limit,
        search: search.trim() || undefined,
        department: departmentFilter !== 'ALL' ? departmentFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        layoutTemplate: layoutFilter !== 'ALL' ? layoutFilter : undefined
      };

      const res = await idCardApi.getIdCards(params);
      if (res.success) {
        setCards(res.data);
        setStats(res.stats);
        if (res.branding) setBranding(res.branding);
        setTotalPages(res.pagination.totalPages);
        setTotalItems(res.pagination.totalItems);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch student ID cards list.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCardIds(cards.map(c => c.id));
    } else {
      setSelectedCardIds([]);
    }
  };

  const toggleSelectCard = (id: string) => {
    setSelectedCardIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBatchPrint = () => {
    const selected = cards.filter(c => selectedCardIds.includes(c.id));
    if (selected.length > 0) {
      setPreviewPrintCards(selected);
    }
  };

  const handleRevokeCard = async (card: IdCardRecord) => {
    const reason = prompt(`Enter revocation reason for student ${card.studentName} (${card.cardNumber}):`);
    if (reason) {
      try {
        await idCardApi.revokeCard(card.id, reason);
        fetchCards();
      } catch (err: any) {
        alert(err.message || 'Failed to revoke ID card.');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Active
          </span>
        );
      case 'Revoked':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Revoked
          </span>
        );
      case 'Expired':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Expired
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            Student ID Cards Studio
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate, customize layout templates, print QR/Barcode credentials, & manage official student ID cards
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsBrandingOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-xs transition-all"
          >
            <Building2 className="w-4 h-4 text-amber-500" />
            Branding & Logos
          </button>

          {selectedCardIds.length > 0 && (
            <button
              onClick={handleBatchPrint}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition-all animate-fade-in"
            >
              <Printer className="w-4 h-4" />
              Batch Print ({selectedCardIds.length})
            </button>
          )}

          <button
            onClick={() => {
              setEditingCard(null);
              setIsGeneratorOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            Issue ID Card
          </button>

          <button
            onClick={() => fetchCards()}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 shadow-xs transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Total Cards Issued</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{stats.totalGenerated}</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Active Valid Cards</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">{stats.activeCards}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Total Print Executions</p>
            <p className="text-xl font-bold text-amber-600 mt-1">{stats.totalPrints}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Printer className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Campus Branding</p>
            <p className="text-xs font-bold text-slate-900 mt-1 truncate max-w-[120px]" title={branding.collegeName}>
              {branding.shortName}
            </p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by student name, roll #, card number, or department..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={departmentFilter}
                onChange={e => {
                  setDepartmentFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Departments</option>
                <option value="Computer Science & Engineering">CSE</option>
                <option value="Electronics & Communication">ECE</option>
                <option value="Mechanical Engineering">ME</option>
                <option value="Business Administration">MBA</option>
              </select>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <select
                value={statusFilter}
                onChange={e => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Revoked">Revoked</option>
                <option value="Expired">Expired</option>
              </select>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <select
                value={layoutFilter}
                onChange={e => {
                  setLayoutFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Layout Styles</option>
                <option value="compact-badge">Compact Badge</option>
                <option value="compact-badge-blue">Compact Badge Blue</option>
              </select>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table Rows View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse space-y-4">
              <div className="w-full h-48 bg-slate-100 rounded-2xl"></div>
              <div className="w-3/4 h-5 bg-slate-200 rounded-md"></div>
              <div className="w-1/2 h-4 bg-slate-200 rounded-md"></div>
            </div>
          ))}
        </div>
      ) : cards.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <CreditCard className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No Student ID Cards Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No ID card records match your filter parameters. Issue a new student card or adjust filters.
          </p>
          <button
            onClick={() => {
              setEditingCard(null);
              setIsGeneratorOpen(true);
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
          >
            Issue First ID Card
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID INTERACTIVE PREVIEW CARDS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {cards.map(card => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-2xl border p-4 shadow-xs hover:shadow-md transition-all flex flex-col items-center space-y-3 ${
                selectedCardIds.includes(card.id)
                  ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/10'
                  : 'border-slate-200/90'
              }`}
            >
              {/* Card Header Info Bar */}
              <div className="w-full flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCardIds.includes(card.id)}
                    onChange={() => toggleSelectCard(card.id)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="font-mono text-[10px] font-bold text-slate-500">{card.cardNumber}</span>
                </label>

                {getStatusBadge(card.status)}
              </div>

              {/* Render Card Widget */}
              <div className="p-2 bg-slate-100/60 rounded-2xl border border-slate-200/80 shadow-2xs flex justify-center w-full overflow-x-auto">
                <IdCardRenderer card={card} branding={branding} scale={0.92} />
              </div>

              {/* Card Actions Footer */}
              <div className="w-full pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono text-slate-400">
                  Printed: <strong className="text-slate-700">{card.printCount}x</strong>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPreviewPrintCards([card])}
                    className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1 font-bold text-[11px]"
                    title="Print / Save PDF"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print
                  </button>

                  <button
                    onClick={() => {
                      setEditingCard(card);
                      setIsGeneratorOpen(true);
                    }}
                    className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit Specs"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {card.status === 'Active' && (
                    <button
                      onClick={() => handleRevokeCard(card)}
                      className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Revoke Card"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={cards.length > 0 && selectedCardIds.length === cards.length}
                      onChange={e => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                  </th>
                  <th className="py-3 px-4">Card No & Student</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Layout Style</th>
                  <th className="py-3 px-4">Valid Until</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Prints</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cards.map(card => (
                  <tr key={card.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedCardIds.includes(card.id)}
                        onChange={() => toggleSelectCard(card.id)}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-bold text-slate-900">{card.studentName}</p>
                        <p className="font-mono text-[10px] text-indigo-600 font-bold">{card.cardNumber} • {card.studentRollNo}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-semibold">{card.department}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] uppercase font-bold border">
                        {card.layoutTemplate}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">{card.validUntil}</td>
                    <td className="py-3 px-4">{getStatusBadge(card.status)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{card.printCount}x</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setPreviewPrintCards([card])}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          title="Print / Save PDF"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setEditingCard(card);
                            setIsGeneratorOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {card.status === 'Active' && (
                          <button
                            onClick={() => handleRevokeCard(card)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Revoke"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      {!loading && cards.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-900">{cards.length}</strong> of{' '}
            <strong className="text-slate-900">{totalItems}</strong> student ID cards
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-800">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <IdCardGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => {
          setIsGeneratorOpen(false);
          setEditingCard(null);
        }}
        onSuccess={fetchCards}
        branding={branding}
        cardToEdit={editingCard}
      />

      <IdCardBrandingModal
        isOpen={isBrandingOpen}
        onClose={() => setIsBrandingOpen(false)}
        onSuccess={fetchCards}
        branding={branding}
      />

      <IdCardPreviewPrintModal
        isOpen={previewPrintCards.length > 0}
        onClose={() => setPreviewPrintCards([])}
        cards={previewPrintCards}
        branding={branding}
        onPrintRecorded={fetchCards}
      />
    </div>
  );
};
