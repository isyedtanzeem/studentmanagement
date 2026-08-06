import React from 'react';
import { IdCardRecord, CollegeBrandingConfig, IdCardLayout } from '../../types/idCard';
import { Shield, Phone, MapPin, Globe, Award, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

interface IdCardRendererProps {
  card: IdCardRecord;
  branding: CollegeBrandingConfig;
  showBackSide?: boolean;
  scale?: number;
  layoutOverride?: IdCardLayout;
}

export const IdCardRenderer: React.FC<IdCardRendererProps> = ({
  card,
  branding,
  showBackSide = false,
  scale = 1,
  layoutOverride
}) => {
  const layout = layoutOverride || card.layoutTemplate || 'portrait-modern';

  // Front Side Renderers
  const renderFront = () => {
    switch (layout) {
      case 'landscape-modern':
        return (
          <div
            className="w-[420px] h-[260px] rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden relative flex flex-col justify-between text-slate-800 select-none bg-white font-sans"
            style={{ transform: scale !== 1 ? `scale(${scale})` : undefined, transformOrigin: 'top left' }}
          >
            {/* Top Brand Header */}
            <div
              className="px-4 py-2.5 flex items-center justify-between border-b border-white/10"
              style={{ backgroundColor: branding.cardHeaderBg || '#0f172a', color: '#ffffff' }}
            >
              <div className="flex items-center gap-2.5">
                {branding.logoUrl ? (
                  <img
                    src={branding.logoUrl}
                    alt="College Logo"
                    className="w-9 h-9 object-contain rounded-lg bg-white/10 p-1 border border-white/20"
                  />
                ) : (
                  <div className="w-9 h-9 bg-amber-500 text-slate-950 font-bold rounded-lg flex items-center justify-center text-xs">
                    {branding.shortName || 'CAMPUS'}
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-black tracking-tight leading-none text-white uppercase">
                    {branding.collegeName}
                  </h4>
                  <p className="text-[9px] text-amber-300 font-medium tracking-wide mt-0.5">
                    {branding.tagline}
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[9px] font-mono font-bold rounded-full border border-amber-400/30">
                OFFICIAL ID
              </span>
            </div>

            {/* Middle Main Info Grid */}
            <div className="p-3.5 flex items-start gap-4 flex-1 bg-gradient-to-br from-slate-50 via-white to-indigo-50/20">
              {/* Photo Box */}
              <div className="flex flex-col items-center shrink-0">
                <div className="w-22 h-26 rounded-xl border-2 border-indigo-600/40 p-0.5 bg-white shadow-md relative overflow-hidden">
                  <img
                    src={card.photoUrl}
                    alt={card.studentName}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 backdrop-blur-xs text-[8px] text-center text-white font-bold py-0.5 font-mono">
                    {card.bloodGroup || 'O+'}
                  </div>
                </div>
                <span className="text-[9px] font-mono text-slate-500 font-bold mt-1">
                  NO: {card.cardNumber}
                </span>
              </div>

              {/* Student Details Column */}
              <div className="flex-1 space-y-1.5 min-w-0">
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight uppercase tracking-tight line-clamp-1">
                    {card.studentName}
                  </h3>
                  <p className="text-[11px] font-bold text-indigo-700 font-mono">
                    ROLL: {card.studentRollNo}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div>
                    <span className="text-[9px] text-slate-400 font-semibold block uppercase">Department</span>
                    <span className="font-bold text-slate-800 line-clamp-1">{card.department}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-semibold block uppercase">Valid Until</span>
                    <span className="font-bold text-emerald-700 font-mono">{card.validUntil}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-semibold block uppercase">DOB</span>
                    <span className="font-bold text-slate-700 font-mono">{card.dob}</span>
                  </div>
                  {branding.showEmergencyPhone && (
                    <div>
                      <span className="text-[9px] text-slate-400 font-semibold block uppercase">Emergency</span>
                      <span className="font-bold text-slate-700 font-mono">{card.emergencyPhone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* QR Code Column */}
              {branding.showQrCode && card.qrCodeData && (
                <div className="shrink-0 flex flex-col items-center justify-center p-1 bg-white border border-slate-200 rounded-xl shadow-2xs">
                  <img src={card.qrCodeData} alt="QR Code" className="w-16 h-16 object-contain" />
                  <span className="text-[7px] font-mono text-slate-400 mt-0.5">VERIFY</span>
                </div>
              )}
            </div>

            {/* Bottom Barcode Footer */}
            <div className="px-3 py-1 bg-slate-900 flex items-center justify-between border-t border-slate-800 text-white">
              <div className="w-36 h-6 overflow-hidden">
                <img src={card.barcodeValue} alt="Barcode" className="w-full h-full object-cover filter invert" />
              </div>
              <div className="flex items-center gap-1.5">
                <img src={branding.principalSignatureUrl} alt="Signature" className="h-5 object-contain filter brightness-200" />
                <span className="text-[8px] text-slate-400 font-mono uppercase">Registrar</span>
              </div>
            </div>
          </div>
        );

      case 'compact-badge':
        return (
          <div
            className="w-[270px] h-[380px] rounded-2xl shadow-xl border border-slate-300 overflow-hidden relative flex flex-col justify-between text-slate-800 select-none bg-white font-sans"
            style={{ transform: scale !== 1 ? `scale(${scale})` : undefined, transformOrigin: 'top left' }}
          >
            {/* Header Badge Strip */}
            <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-3 text-center relative">
              <div className="w-10 h-10 mx-auto mb-1 bg-white p-1 rounded-xl shadow-md border border-emerald-400">
                <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <h4 className="text-xs font-black tracking-wide uppercase">{branding.collegeName}</h4>
              <p className="text-[8px] text-emerald-300 font-mono mt-0.5">{branding.tagline}</p>
            </div>

            {/* Photo & Details */}
            <div className="p-3 text-center flex-1 flex flex-col items-center justify-between bg-slate-50">
              <div className="w-24 h-28 rounded-2xl border-2 border-emerald-600 p-0.5 bg-white shadow-md overflow-hidden relative">
                <img src={card.photoUrl} alt={card.studentName} className="w-full h-full object-cover rounded-xl" />
              </div>

              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase leading-tight line-clamp-1">{card.studentName}</h3>
                <p className="text-[10px] font-mono font-bold text-emerald-700 mt-0.5">{card.studentRollNo}</p>
                <p className="text-[9px] font-semibold text-slate-500 line-clamp-1">{card.department}</p>
              </div>

              <div className="w-full bg-white p-2 rounded-xl border border-slate-200 text-[9px] grid grid-cols-2 gap-1 text-left">
                <div>
                  <span className="text-slate-400 block text-[8px]">VALID UNTIL</span>
                  <span className="font-bold text-slate-800 font-mono">{card.validUntil}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[8px]">BLOOD GRP</span>
                  <span className="font-bold text-rose-600 font-mono">{card.bloodGroup}</span>
                </div>
              </div>

              {branding.showQrCode && card.qrCodeData && (
                <div className="w-12 h-12 bg-white p-0.5 rounded-lg border border-slate-200">
                  <img src={card.qrCodeData} alt="QR" className="w-full h-full object-contain" />
                </div>
              )}
            </div>

            {/* Bottom Bar */}
            <div className="p-1.5 bg-slate-900 text-white text-[8px] text-center font-mono tracking-widest uppercase">
              STUDENT IDENTITY CARD
            </div>
          </div>
        );

      case 'executive-chip':
        return (
          <div
            className="w-[270px] h-[380px] rounded-2xl shadow-xl border border-amber-500/30 overflow-hidden relative flex flex-col justify-between text-white select-none bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 font-sans"
            style={{ transform: scale !== 1 ? `scale(${scale})` : undefined, transformOrigin: 'top left' }}
          >
            {/* Top Gold Header */}
            <div className="p-3 border-b border-amber-500/20 flex items-center gap-2">
              <img src={branding.logoUrl} alt="Logo" className="w-8 h-8 object-contain bg-white/10 p-1 rounded-lg border border-amber-500/40" />
              <div>
                <h4 className="text-[10px] font-black text-amber-300 uppercase tracking-wide leading-tight">{branding.collegeName}</h4>
                <p className="text-[8px] text-slate-400 font-mono">AUTONOMOUS</p>
              </div>
            </div>

            {/* Smart Chip & Photo Row */}
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                {/* Gold Smart Chip Simulation */}
                <div className="w-8 h-6 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 rounded border border-amber-300/80 shadow-inner relative flex items-center justify-center">
                  <div className="w-full h-0.5 bg-amber-700/40 my-0.5" />
                </div>
                <span className="text-[9px] font-mono text-amber-400/80 font-bold tracking-widest">{card.cardNumber}</span>
              </div>

              <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10">
                <div className="w-16 h-20 rounded-lg overflow-hidden border border-amber-400/50 shrink-0">
                  <img src={card.photoUrl} alt={card.studentName} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="text-xs font-black text-amber-200 uppercase line-clamp-1">{card.studentName}</h3>
                  <p className="text-[10px] font-mono text-white font-bold">{card.studentRollNo}</p>
                  <p className="text-[8px] text-slate-300 line-clamp-1">{card.department}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[9px] bg-black/40 p-2 rounded-xl border border-white/5">
                <div>
                  <span className="text-[7px] text-slate-400 block uppercase">Valid Until</span>
                  <span className="font-mono text-amber-300 font-bold">{card.validUntil}</span>
                </div>
                <div>
                  <span className="text-[7px] text-slate-400 block uppercase">Blood Group</span>
                  <span className="font-mono text-rose-400 font-bold">{card.bloodGroup}</span>
                </div>
              </div>
            </div>

            {/* Barcode Footer */}
            <div className="p-2 bg-slate-950 border-t border-amber-500/20 flex items-center justify-between">
              <div className="w-32 h-6 overflow-hidden">
                <img src={card.barcodeValue} alt="Barcode" className="w-full h-full object-cover filter invert" />
              </div>
              <span className="text-[7px] font-mono text-amber-400">AUTHENTICATED</span>
            </div>
          </div>
        );

      case 'portrait-classic':
      case 'portrait-modern':
      default:
        return (
          <div
            className="w-[270px] h-[390px] rounded-2xl shadow-2xl border border-slate-300 overflow-hidden relative flex flex-col justify-between text-slate-800 select-none bg-white font-sans"
            style={{ transform: scale !== 1 ? `scale(${scale})` : undefined, transformOrigin: 'top left' }}
          >
            {/* Top Brand Header */}
            <div
              className="p-3 text-center border-b border-white/20 relative"
              style={{ backgroundColor: branding.cardHeaderBg || '#1e1b4b', color: '#ffffff' }}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                {branding.logoUrl && (
                  <img
                    src={branding.logoUrl}
                    alt="Logo"
                    className="w-7 h-7 object-contain rounded-md bg-white p-0.5"
                  />
                )}
                <h4 className="text-[11px] font-black tracking-tight uppercase leading-tight text-white">
                  {branding.shortName || branding.collegeName}
                </h4>
              </div>
              <p className="text-[8px] text-amber-300 tracking-wider font-semibold uppercase">
                {branding.collegeName}
              </p>
            </div>

            {/* Middle Main Info */}
            <div className="p-3 flex-1 flex flex-col items-center justify-between bg-gradient-to-b from-slate-50 to-white text-center">
              {/* Photo Frame */}
              <div className="w-22 h-26 rounded-xl border-2 border-indigo-600/60 p-0.5 bg-white shadow-md relative overflow-hidden my-1">
                <img
                  src={card.photoUrl}
                  alt={card.studentName}
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute bottom-0 inset-x-0 bg-indigo-900/90 text-white font-mono text-[8px] py-0.5 font-bold">
                  {card.bloodGroup || 'O+'}
                </div>
              </div>

              {/* Name & Roll */}
              <div className="space-y-0.5 w-full">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight line-clamp-1">
                  {card.studentName}
                </h3>
                <p className="text-[11px] font-mono font-black text-indigo-700">
                  ROLL: {card.studentRollNo}
                </p>
                <p className="text-[9px] font-semibold text-slate-600 line-clamp-1">
                  {card.department}
                </p>
              </div>

              {/* Meta Grid Box */}
              <div className="w-full bg-slate-100/80 p-2 rounded-xl border border-slate-200/80 text-[9px] grid grid-cols-2 gap-1.5 text-left">
                <div>
                  <span className="text-[8px] text-slate-400 block uppercase font-medium">Valid Until</span>
                  <span className="font-bold text-emerald-700 font-mono">{card.validUntil}</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-400 block uppercase font-medium">Issued On</span>
                  <span className="font-bold text-slate-700 font-mono">{card.issueDate}</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-400 block uppercase font-medium">DOB</span>
                  <span className="font-bold text-slate-700 font-mono">{card.dob}</span>
                </div>
                {branding.showEmergencyPhone && (
                  <div>
                    <span className="text-[8px] text-slate-400 block uppercase font-medium">Emergency</span>
                    <span className="font-bold text-slate-700 font-mono">{card.emergencyPhone}</span>
                  </div>
                )}
              </div>

              {/* QR and Barcode inline */}
              <div className="w-full flex items-center justify-between pt-1">
                {branding.showQrCode && card.qrCodeData && (
                  <div className="w-10 h-10 p-0.5 bg-white border border-slate-200 rounded-lg shrink-0">
                    <img src={card.qrCodeData} alt="QR" className="w-full h-full object-contain" />
                  </div>
                )}

                <div className="flex-1 px-2 h-7 overflow-hidden">
                  <img src={card.barcodeValue} alt="Barcode" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Bottom Footer Strip */}
            <div
              className="p-1.5 text-[8px] text-center font-mono font-bold tracking-widest uppercase border-t border-slate-200 text-white"
              style={{ backgroundColor: branding.cardHeaderBg || '#0f172a' }}
            >
              STUDENT IDENTITY CARD
            </div>
          </div>
        );
    }
  };

  // Back Side Renderer
  const renderBack = () => {
    return (
      <div
        className={`rounded-2xl shadow-2xl border border-slate-300 overflow-hidden relative flex flex-col justify-between text-slate-800 select-none bg-slate-900 text-white font-sans ${
          layout === 'landscape-modern' ? 'w-[420px] h-[260px]' : 'w-[270px] h-[390px]'
        }`}
        style={{ transform: scale !== 1 ? `scale(${scale})` : undefined, transformOrigin: 'top left' }}
      >
        {/* Top Header */}
        <div className="p-3 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">
              Terms & Emergency Information
            </h4>
          </div>
          <span className="text-[8px] font-mono text-slate-400">ID: {card.cardNumber}</span>
        </div>

        {/* Content Rules */}
        <div className="p-3.5 space-y-2 text-[9px] text-slate-300 flex-1">
          <div className="space-y-1">
            <p className="font-bold text-amber-300 uppercase text-[8px]">Important Instructions:</p>
            <ul className="list-disc list-inside space-y-0.5 text-[8px] text-slate-300 leading-tight">
              <li>This card is non-transferable and must be carried at all times inside campus.</li>
              <li>Loss of card must be reported immediately to the Registrar's Office.</li>
              <li>Misuse of card constitutes a violation of college honor codes.</li>
            </ul>
          </div>

          <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1 text-[8px]">
            <div className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="line-clamp-1">{branding.address}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Phone className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Campus Hotline: {branding.contactPhone}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Globe className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{branding.website}</span>
            </div>
          </div>
        </div>

        {/* Principal Stamp / Signature */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[7px] text-slate-400 uppercase font-mono">Found Return To:</p>
            <p className="text-[8px] text-white font-bold">{branding.shortName} Registrar Office</p>
          </div>

          <div className="text-right">
            {branding.principalSignatureUrl && (
              <img src={branding.principalSignatureUrl} alt="Signature" className="h-6 object-contain filter invert opacity-90 mx-auto" />
            )}
            <p className="text-[7px] text-amber-400 font-mono font-bold uppercase">Issuing Authority</p>
          </div>
        </div>
      </div>
    );
  };

  return showBackSide ? renderBack() : renderFront();
};
