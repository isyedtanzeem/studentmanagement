import React, { useState, useEffect } from 'react';
import { Student, StudentFeeStructure, FeePaymentTransaction } from '../../types/student';
import {
  X,
  CreditCard,
  Receipt,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Printer,
  Download,
  Building2,
  QrCode,
  ShieldCheck,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Wallet
} from 'lucide-react';

interface StudentFeesModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStudent?: (updatedStudent: Student) => void;
}

export const StudentFeesModal: React.FC<StudentFeesModalProps> = ({
  student,
  isOpen,
  onClose,
  onUpdateStudent
}) => {
  const [activeTab, setActiveTab] = useState<'breakdown' | 'payments' | 'new_payment'>('breakdown');
  const [selectedReceipt, setSelectedReceipt] = useState<FeePaymentTransaction | null>(null);

  // Form states for collecting payment
  const [paymentSemester, setPaymentSemester] = useState<number>(4);
  const [paymentAmount, setPaymentAmount] = useState<number>(65000);
  const [paymentMode, setPaymentMode] = useState<FeePaymentTransaction['paymentMode']>('UPI');
  const [transactionRef, setTransactionRef] = useState<string>(`UPI-${Date.now().toString().slice(-8)}`);
  const [paymentFeeType, setPaymentFeeType] = useState<string>('Tuition & Examination Fee');
  const [paymentRemarks, setPaymentRemarks] = useState<string>('Paid via online banking gateway.');

  // Default seed fee structure generator
  const generateSeedFeeStructures = (st: Student): StudentFeeStructure[] => {
    if (st.feeStructures && st.feeStructures.length > 0) {
      return st.feeStructures;
    }

    const currentSem = st.semester || st.currentSemester || 4;
    const startYear = st.enrollmentYear || 2024;

    const list: StudentFeeStructure[] = [];
    for (let s = 1; s <= 8; s++) {
      const yearOffset = Math.floor((s - 1) / 2);
      const isCompleted = s < currentSem;
      const isCurrent = s === currentSem;

      const tuition = 65000;
      const exam = 3500;
      const libLab = 4500;
      const hostel = s % 2 === 1 ? 12000 : 0;
      const total = tuition + exam + libLab + hostel;

      let paid = 0;
      let status: StudentFeeStructure['status'] = 'Unpaid';

      if (isCompleted) {
        paid = total;
        status = 'Paid';
      } else if (isCurrent) {
        paid = Math.round(total * 0.7); // partially paid or fully
        status = paid >= total ? 'Paid' : 'Partially Paid';
      } else {
        paid = 0;
        status = 'Unpaid';
      }

      const yearString = `${startYear + yearOffset}-${startYear + yearOffset + 1}`;
      const dueMonth = (s % 2 !== 0) ? '08-15' : '01-15';

      list.push({
        id: `fee-sem-${st.id}-${s}`,
        semester: s,
        academicYear: yearString,
        tuitionFee: tuition,
        examFee: exam,
        libraryLabFee: libLab,
        hostelFee: hostel,
        totalFee: total,
        paidAmount: paid,
        dueAmount: Math.max(0, total - paid),
        dueDate: `${startYear + yearOffset}-${dueMonth}`,
        status
      });
    }

    return list;
  };

  // Default seed payment transactions generator
  const generateSeedPayments = (st: Student, feeList: StudentFeeStructure[]): FeePaymentTransaction[] => {
    if (st.feePayments && st.feePayments.length > 0) {
      return st.feePayments;
    }

    const currentSem = st.semester || st.currentSemester || 4;
    const payments: FeePaymentTransaction[] = [];

    feeList.forEach((fee, idx) => {
      if (fee.paidAmount > 0) {
        payments.push({
          id: `pay-${st.id}-${fee.semester}-1`,
          receiptNo: `REC-2026-${8800 + fee.semester * 12 + idx}`,
          paymentDate: fee.dueDate,
          amountPaid: fee.paidAmount,
          paymentMode: fee.semester % 2 === 0 ? 'UPI' : 'NetBanking',
          transactionRef: `TXN9842${fee.semester}0${st.studentId.slice(-3)}`,
          feeType: `Semester ${fee.semester} Academic Fee Installment`,
          semester: fee.semester,
          status: 'Completed',
          collectedBy: 'Finance & Accounts Bureau',
          remarks: 'Institutional fee clearance received & verified.'
        });
      }
    });

    return payments;
  };

  const [feeStructures, setFeeStructures] = useState<StudentFeeStructure[]>([]);
  const [payments, setPayments] = useState<FeePaymentTransaction[]>([]);

  useEffect(() => {
    if (student) {
      const fees = generateSeedFeeStructures(student);
      const payList = generateSeedPayments(student, fees);
      setFeeStructures(fees);
      setPayments(payList);

      const activeSem = student.semester || student.currentSemester || 4;
      setPaymentSemester(activeSem);
      const currFee = fees.find(f => f.semester === activeSem);
      if (currFee && currFee.dueAmount > 0) {
        setPaymentAmount(currFee.dueAmount);
      } else {
        setPaymentAmount(65000);
      }
    }
  }, [student?.id, student?.semester]);

  if (!isOpen || !student) return null;

  // Calculate totals
  const totalFeeAmount = feeStructures.reduce((acc, f) => acc + f.totalFee, 0);
  const totalPaidAmount = feeStructures.reduce((acc, f) => acc + f.paidAmount, 0);
  const totalDueAmount = Math.max(0, totalFeeAmount - totalPaidAmount);

  const overallFeeStatus: 'Paid' | 'Partially Paid' | 'Overdue' | 'Unpaid' =
    totalDueAmount === 0
      ? 'Paid'
      : totalPaidAmount > 0
      ? 'Partially Paid'
      : 'Unpaid';

  // Record a payment submit
  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentAmount || paymentAmount <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    const newReceiptNo = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTransaction: FeePaymentTransaction = {
      id: `pay-${Date.now()}`,
      receiptNo: newReceiptNo,
      paymentDate: new Date().toISOString().slice(0, 10),
      amountPaid: Number(paymentAmount),
      paymentMode,
      transactionRef: transactionRef || `TXN${Date.now().toString().slice(-8)}`,
      feeType: paymentFeeType || `Semester ${paymentSemester} Fee`,
      semester: Number(paymentSemester),
      status: 'Completed',
      collectedBy: 'Admissions & Accounts Officer',
      remarks: paymentRemarks || 'Payment recorded via fee portal.'
    };

    const updatedPayments = [newTransaction, ...payments];

    // Update fee structure for that semester
    const updatedFeeStructures = feeStructures.map(f => {
      if (f.semester === Number(paymentSemester)) {
        const newPaid = f.paidAmount + Number(paymentAmount);
        const newDue = Math.max(0, f.totalFee - newPaid);
        return {
          ...f,
          paidAmount: newPaid,
          dueAmount: newDue,
          status: (newDue === 0 ? 'Paid' : 'Partially Paid') as StudentFeeStructure['status']
        };
      }
      return f;
    });

    const newTotalPaid = updatedFeeStructures.reduce((a, b) => a + b.paidAmount, 0);
    const newTotalDue = Math.max(0, totalFeeAmount - newTotalPaid);

    const updatedStudent: Student = {
      ...student,
      feeStructures: updatedFeeStructures,
      feePayments: updatedPayments,
      totalFeeAmount,
      totalPaidAmount: newTotalPaid,
      totalDueAmount: newTotalDue,
      feeStatus: newTotalDue === 0 ? 'Paid' : 'Partially Paid'
    };

    setFeeStructures(updatedFeeStructures);
    setPayments(updatedPayments);

    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }

    // Open receipt modal for preview & printing
    setSelectedReceipt(newTransaction);
    setActiveTab('payments');

    alert(`Payment of ₹${paymentAmount.toLocaleString('en-IN')} successfully recorded under Receipt ${newReceiptNo}!`);
  };

  const studentName = student.fullName || (student as any).name || 'Student';
  const studentIdStr = student.studentId || student.id || '2024CSE1001';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col my-6">
        
        {/* Top Bar Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{studentName}</h3>
                <span className="px-2.5 py-0.5 rounded-md bg-slate-200 text-slate-800 font-mono text-[11px] font-bold">
                  {studentIdStr}
                </span>
                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono ${
                  overallFeeStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                  overallFeeStatus === 'Partially Paid' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  Fee Clearance: {overallFeeStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>{student.department}</span>
                <span>•</span>
                <span>Net Outstanding Due: <strong className="text-rose-600 font-bold font-mono">₹{totalDueAmount.toLocaleString('en-IN')}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('new_payment')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Collect / Record Payment</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Summary KPI Cards Row */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Course Program Fee</span>
            <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
              ₹{totalFeeAmount.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">8 Semesters Program Fee</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Amount Paid</span>
            <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">
              ₹{totalPaidAmount.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Verified Ledger Received</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Balance Pending / Due</span>
            <div className="text-2xl font-black text-rose-600 mt-1 font-mono">
              ₹{totalDueAmount.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Remaining Outstanding</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Receipts Issued</span>
            <div className="text-2xl font-black text-blue-700 mt-1 font-mono">
              {payments.length} Receipts
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Official Payment Vouchers</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 bg-white border-b border-slate-200 flex items-center gap-4 text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('breakdown')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'breakdown'
                ? 'border-blue-600 text-blue-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Semester Fee Structure & Status</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'payments'
                ? 'border-blue-600 text-blue-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payment History & Receipts Ledger ({payments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('new_payment')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'new_payment'
                ? 'border-emerald-600 text-emerald-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Record / Collect Fee</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 max-h-[460px] overflow-y-auto space-y-6">
          
          {/* TAB 1: Semester Fee Breakdown */}
          {activeTab === 'breakdown' && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-mono text-[11px]">
                      <th className="p-3 pl-4">Semester</th>
                      <th className="p-3">Tuition Fee</th>
                      <th className="p-3">Exam Fee</th>
                      <th className="p-3">Lib/Lab Fee</th>
                      <th className="p-3">Hostel/Other</th>
                      <th className="p-3">Total Fee</th>
                      <th className="p-3">Amount Paid</th>
                      <th className="p-3">Balance Due</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right pr-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-mono">
                    {feeStructures.map(f => (
                      <tr key={f.semester} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 pl-4 font-bold text-blue-700">Sem {f.semester}</td>
                        <td className="p-3">₹{f.tuitionFee.toLocaleString('en-IN')}</td>
                        <td className="p-3">₹{f.examFee.toLocaleString('en-IN')}</td>
                        <td className="p-3">₹{f.libraryLabFee.toLocaleString('en-IN')}</td>
                        <td className="p-3">₹{(f.hostelFee || 0).toLocaleString('en-IN')}</td>
                        <td className="p-3 font-bold text-slate-900">₹{f.totalFee.toLocaleString('en-IN')}</td>
                        <td className="p-3 font-bold text-emerald-700">₹{f.paidAmount.toLocaleString('en-IN')}</td>
                        <td className={`p-3 font-bold ${f.dueAmount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                          ₹{f.dueAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            f.status === 'Paid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            f.status === 'Partially Paid' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}>
                            {f.status}
                          </span>
                        </td>
                        <td className="p-3 text-right pr-4">
                          {f.dueAmount > 0 ? (
                            <button
                              onClick={() => {
                                setPaymentSemester(f.semester);
                                setPaymentAmount(f.dueAmount);
                                setActiveTab('new_payment');
                              }}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                            >
                              Pay ₹{f.dueAmount.toLocaleString('en-IN')}
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-sans">Cleared ✓</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Payment Receipts History Ledger */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-mono text-[11px]">
                      <th className="p-3 pl-4">Receipt No</th>
                      <th className="p-3">Payment Date</th>
                      <th className="p-3">Semester</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Payment Mode</th>
                      <th className="p-3">Txn Reference</th>
                      <th className="p-3">Amount Paid</th>
                      <th className="p-3 text-right pr-4">Receipt Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-mono">
                    {payments.length > 0 ? (
                      payments.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 pl-4 font-bold text-blue-700">{p.receiptNo}</td>
                          <td className="p-3 text-slate-600">{p.paymentDate}</td>
                          <td className="p-3 font-bold text-slate-900">Sem {p.semester}</td>
                          <td className="p-3 font-sans font-semibold text-slate-800">{p.feeType}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded text-[10px] font-bold">
                              {p.paymentMode}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500 text-[11px] font-mono">{p.transactionRef}</td>
                          <td className="p-3 font-bold text-emerald-700">₹{p.amountPaid.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-right pr-4">
                            <button
                              onClick={() => setSelectedReceipt(p)}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 justify-end ml-auto cursor-pointer"
                            >
                              <Printer className="w-3 h-3 text-blue-600" />
                              <span>View Receipt</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                          No payment transaction vouchers logged for this student yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Collect / Record Fee Payment Form */}
          {activeTab === 'new_payment' && (
            <form onSubmit={handleRecordPaymentSubmit} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-5 text-xs">
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-emerald-600" />
                    <span>Collect / Record Student Fee Payment</span>
                  </h4>
                  <p className="text-slate-500 text-[11px]">Generate official receipt voucher and update student financial ledger</p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
                  Instant Verification
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Target Semester</label>
                  <select
                    value={paymentSemester}
                    onChange={e => {
                      const semNum = Number(e.target.value);
                      setPaymentSemester(semNum);
                      const f = feeStructures.find(s => s.semester === semNum);
                      if (f && f.dueAmount > 0) {
                        setPaymentAmount(f.dueAmount);
                      }
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => {
                      const f = feeStructures.find(item => item.semester === s);
                      return (
                        <option key={s} value={s}>
                          Semester {s} {f ? `(Due: ₹${f.dueAmount.toLocaleString('en-IN')})` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Amount Paid (₹ INR)</label>
                  <input
                    type="number"
                    min="100"
                    step="500"
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Payment Channel / Mode</label>
                  <select
                    value={paymentMode}
                    onChange={e => setPaymentMode(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="NetBanking">NetBanking / NEFT / RTGS</option>
                    <option value="Credit/Debit Card">Credit / Debit Card</option>
                    <option value="Demand Draft">Demand Draft (DD)</option>
                    <option value="Cash">Cash at Accounts Desk</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Transaction Ref / UTR / DD Number</label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={e => setTransactionRef(e.target.value)}
                    placeholder="e.g. UPI-984210491823"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Fee Category / Description</label>
                  <input
                    type="text"
                    value={paymentFeeType}
                    onChange={e => setPaymentFeeType(e.target.value)}
                    placeholder="e.g. Tuition & Examination Fee"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Accounts Officer Remarks</label>
                <input
                  type="text"
                  value={paymentRemarks}
                  onChange={e => setPaymentRemarks(e.target.value)}
                  placeholder="e.g. Paid online via Razorpay gateway. Verified in bank statement."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('breakdown')}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Payment & Generate Receipt</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ScholarCore Audit & Accounts Billing Ledger Engine</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Official Downloadable / Printable Fee Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col my-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Bar */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="font-bold text-sm">Official Fee Payment Receipt Voucher</h4>
                  <p className="text-[10px] text-slate-400 font-mono">{selectedReceipt.receiptNo} • {studentName}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Receipt Body */}
            <div className="p-6 bg-white space-y-4 max-h-[500px] overflow-y-auto">
              <div className="border-2 border-slate-900 p-6 rounded-xl space-y-4 relative bg-slate-50/50">
                
                {/* Header */}
                <div className="text-center border-b-2 border-slate-900 pb-3">
                  <h2 className="text-base font-black text-slate-900 tracking-wider uppercase">SCHOLARCORE ACADEMIC INSTITUTION</h2>
                  <p className="text-xs font-bold text-slate-700">OFFICIAL FEE PAYMENT RECEIPT</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Finance & Accounts Bureau • Receipt Voucher #{selectedReceipt.receiptNo}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-white p-3 rounded-lg border border-slate-300">
                  <div>
                    <span className="text-slate-400 block text-[9px]">STUDENT NAME</span>
                    <span className="font-bold text-slate-900">{studentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">ROLL / ENROLLMENT NO</span>
                    <span className="font-bold text-blue-700">{studentIdStr}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">DEPARTMENT</span>
                    <span className="font-bold text-slate-800">{student.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">PAYMENT DATE</span>
                    <span className="font-bold text-slate-900">{selectedReceipt.paymentDate}</span>
                  </div>
                </div>

                {/* Payment Breakdown Table */}
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b-2 border-slate-900 text-slate-900">
                      <th className="py-1">Description / Category</th>
                      <th className="py-1">Semester</th>
                      <th className="py-1 text-right">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-2 font-bold">{selectedReceipt.feeType}</td>
                      <td className="py-2">Semester {selectedReceipt.semester}</td>
                      <td className="py-2 text-right font-bold text-emerald-700">₹{selectedReceipt.amountPaid.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Transaction Meta Box */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 space-y-1 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Amount Paid:</span>
                    <span className="text-lg font-black text-emerald-800">₹{selectedReceipt.amountPaid.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Payment Mode:</span>
                    <span className="font-bold text-slate-800">{selectedReceipt.paymentMode}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Transaction UTR / Ref:</span>
                    <span className="font-bold text-slate-800">{selectedReceipt.transactionRef}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Status:</span>
                    <span className="font-bold text-emerald-700">✓ Completed & Verified</span>
                  </div>
                </div>

                {/* Signatures & Verification */}
                <div className="pt-4 flex items-end justify-between text-[10px] text-slate-500 font-mono">
                  <div className="text-center">
                    <div className="h-6 border-b border-slate-400 mb-1"></div>
                    <span>Finance Officer Seal</span>
                  </div>

                  <QrCode className="w-12 h-12 text-slate-800 p-1 bg-white border border-slate-300 rounded" />

                  <div className="text-center">
                    <div className="h-6 border-b border-slate-400 mb-1"></div>
                    <span>System Authorized Registrar</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">ScholarCore Official Receipt Voucher</span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
