import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Building2, Image as ImageIcon, Phone, Globe, Palette, CheckCircle2, QrCode, Barcode, Shield } from 'lucide-react';
import { CollegeBrandingConfig } from '../../types/idCard';
import { idCardApi } from '../../api/idCardApi';

interface IdCardBrandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  branding: CollegeBrandingConfig;
}

export const IdCardBrandingModal: React.FC<IdCardBrandingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  branding
}) => {
  const [form, setForm] = useState<CollegeBrandingConfig>(branding);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(branding);
  }, [branding, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      await idCardApi.updateBranding(form);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update college branding.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (
    field: 'logoUrl' | 'principalSignatureUrl',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      setError('Please upload a PNG or JPEG image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be 5 MB or smaller.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setForm(current => ({ ...current, [field]: reader.result as string }));
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden my-6"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-slate-950 rounded-xl shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">College Branding & ID Card Config</h2>
              <p className="text-xs text-slate-500">
                Configure institution logo, tagline, header colors, signature seals, and card security elements
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Institution Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
              <Shield className="w-3.5 h-3.5 text-amber-500" />
              Institution Name & Tagline
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">College Full Name</label>
                <input
                  type="text"
                  value={form.collegeName}
                  onChange={e => setForm({ ...form, collegeName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Short Code / Acronym</label>
                <input
                  type="text"
                  value={form.shortName}
                  onChange={e => setForm({ ...form, shortName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tagline / Accreditation</label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={e => setForm({ ...form, tagline: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="Autonomous Institution • NAAC A+"
                />
              </div>
            </div>
          </div>

          {/* Image Assets */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
              Logos & Seal Assets
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">College Logo (PNG/JPEG)</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={e => handleImageUpload('logoUrl', e)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl file:mr-3 file:border-0 file:bg-indigo-600 file:px-3 file:py-1 file:text-white file:rounded-lg file:cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Principal Signature (PNG/JPEG)</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={e => handleImageUpload('principalSignatureUrl', e)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl file:mr-3 file:border-0 file:bg-indigo-600 file:px-3 file:py-1 file:text-white file:rounded-lg file:cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Address & Contact */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
              <Phone className="w-3.5 h-3.5 text-emerald-500" />
              Campus Contact & Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Campus Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={form.contactPhone}
                  onChange={e => setForm({ ...form, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Website URL</label>
                <input
                  type="text"
                  value={form.website}
                  onChange={e => setForm({ ...form, website: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>
            </div>
          </div>

          {/* Display Toggles & Color */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
              <Palette className="w-3.5 h-3.5 text-purple-500" />
              Security Toggles & Header Theme
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <label className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.showQrCode}
                  onChange={e => setForm({ ...form, showQrCode: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-xs font-semibold text-slate-800">QR Code</span>
              </label>

              <label className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.showBarcode}
                  onChange={e => setForm({ ...form, showBarcode: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-xs font-semibold text-slate-800">Barcode</span>
              </label>

              <label className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.showEmergencyPhone}
                  onChange={e => setForm({ ...form, showEmergencyPhone: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-xs font-semibold text-slate-800">Emergency Phone</span>
              </label>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Header Theme Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.cardHeaderBg}
                    onChange={e => setForm({ ...form, cardHeaderBg: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border"
                  />
                  <span className="text-xs font-mono font-bold text-slate-700">{form.cardHeaderBg}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Branding Specs'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
