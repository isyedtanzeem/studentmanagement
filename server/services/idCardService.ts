import QRCode from 'qrcode';
import { dbStore, IdCardRecord, CollegeBrandingConfig } from '../config/db';
import { DashboardModel } from '../models/Dashboard';
import { generateBarcodeSvg } from '../utils/barcodeGenerator';

export interface IdCardQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: string;
  layoutTemplate?: string;
}

export class IdCardService {
  constructor() {
    DashboardModel.seedDataIfEmpty();
    this.seedInitialCardsIfEmpty();
    this.migrateLegacyLayouts();
  }

  private migrateLegacyLayouts() {
    for (const card of dbStore.idCards.values()) {
      if (card.layoutTemplate === 'compact-badge' || card.layoutTemplate === 'compact-badge-blue') continue;

      dbStore.idCards.set(card.id, {
        ...card,
        layoutTemplate: 'compact-badge'
      });
    }
  }

  public async seedInitialCardsIfEmpty() {
    if (dbStore.idCards.size > 0) return;

    const students = Array.from(dbStore.students.values());
    const bloodGroups = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-'];
    const layouts: IdCardRecord['layoutTemplate'][] = [
      'compact-badge',
      'compact-badge-blue'
    ];

    for (let i = 0; i < Math.min(students.length, 12); i++) {
      const student = students[i];
      const bg = bloodGroups[i % bloodGroups.length];
      const layout = layouts[i % layouts.length];
      
      const cardNumber = `IDC-${student.enrollmentYear}-${1000 + i + 1}`;
      const qrContent = JSON.stringify({
        cardNo: cardNumber,
        studentId: student.studentId,
        name: student.fullName,
        dept: student.department,
        issued: `${student.enrollmentYear}-08-01`,
        valid: `${student.enrollmentYear + 4}-06-30`,
        verifyUrl: `https://scholarcore.edu.in/verify/idcard/${cardNumber}`
      });

      let qrDataUrl = '';
      try {
        qrDataUrl = await QRCode.toDataURL(qrContent, { margin: 1, width: 180, color: { dark: '#0f172a', light: '#ffffff' } });
      } catch (err) {
        qrDataUrl = '';
      }

      const barcodeValue = generateBarcodeSvg(student.studentId, 45);

      const card: IdCardRecord = {
        id: `card-${Date.now()}-${i}`,
        cardNumber,
        studentDbId: student.id,
        studentRollNo: student.studentId,
        studentName: student.fullName,
        department: student.department,
        enrollmentYear: student.enrollmentYear,
        validUntil: `30 JUN ${student.enrollmentYear + 4}`,
        issueDate: `01 AUG ${student.enrollmentYear}`,
        dob: student.dateOfBirth || '15/08/2003',
        bloodGroup: bg,
        emergencyPhone: student.guardianPhone || '+91 98765 43210',
        address: student.address || 'Bengaluru, Karnataka',
        photoUrl: student.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(student.fullName)}`,
        qrCodeData: qrDataUrl,
        barcodeValue,
        status: 'Active',
        layoutTemplate: layout,
        printCount: Math.floor(Math.random() * 3) + 1,
        createdAt: new Date().toISOString()
      };

      dbStore.idCards.set(card.id, card);
    }
  }

  public getIdCards(params: IdCardQueryParams) {
    DashboardModel.seedDataIfEmpty();
    let cardList = Array.from(dbStore.idCards.values());

    // Search filter
    if (params.search && params.search.trim() !== '') {
      const q = params.search.toLowerCase().trim();
      cardList = cardList.filter(
        c =>
          c.studentName.toLowerCase().includes(q) ||
          c.studentRollNo.toLowerCase().includes(q) ||
          c.cardNumber.toLowerCase().includes(q) ||
          c.department.toLowerCase().includes(q)
      );
    }

    // Department filter
    if (params.department && params.department !== 'ALL') {
      cardList = cardList.filter(c => c.department === params.department);
    }

    // Status filter
    if (params.status && params.status !== 'ALL') {
      cardList = cardList.filter(c => c.status === params.status);
    }

    // Layout filter
    if (params.layoutTemplate && params.layoutTemplate !== 'ALL') {
      cardList = cardList.filter(c => c.layoutTemplate === params.layoutTemplate);
    }

    // Sort newest created first
    cardList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Pagination
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 9);
    const totalItems = cardList.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedCards = cardList.slice(startIndex, startIndex + limit);

    // Stats calculation
    const allCards = Array.from(dbStore.idCards.values());
    const stats = {
      totalGenerated: allCards.length,
      activeCards: allCards.filter(c => c.status === 'Active').length,
      revokedCards: allCards.filter(c => c.status === 'Revoked').length,
      expiredCards: allCards.filter(c => c.status === 'Expired').length,
      totalPrints: allCards.reduce((acc, c) => acc + (c.printCount || 0), 0)
    };

    return {
      cards: paginatedCards,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit
      },
      stats,
      branding: dbStore.brandingConfig
    };
  }

  public getIdCardById(id: string): IdCardRecord {
    const card = dbStore.idCards.get(id);
    if (!card) {
      throw new Error(`ID Card record with ID ${id} not found.`);
    }
    return card;
  }

  public async generateCard(
    payload: {
      studentDbId: string;
      validUntil?: string;
      bloodGroup?: string;
      emergencyPhone?: string;
      photoUrl?: string;
      layoutTemplate?: IdCardRecord['layoutTemplate'];
    },
    user: any
  ): Promise<IdCardRecord> {
    const student = dbStore.students.get(payload.studentDbId);
    if (!student) {
      throw new Error('Selected student profile does not exist.');
    }

    // Check if card already exists for this student
    const existing = Array.from(dbStore.idCards.values()).find(
      c => c.studentDbId === payload.studentDbId && c.status === 'Active'
    );

    const cardNumber = existing
      ? existing.cardNumber
      : `IDC-${student.enrollmentYear}-${Math.floor(1000 + Math.random() * 9000)}`;

    const validUntil = payload.validUntil || `30 JUN ${student.enrollmentYear + 4}`;
    const bloodGroup = payload.bloodGroup || 'O+';
    const emergencyPhone = payload.emergencyPhone || student.guardianPhone || '+91 98765 43210';
    const layoutTemplate = payload.layoutTemplate || 'compact-badge';
    const photoUrl = payload.photoUrl || student.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(student.fullName)}`;

    const qrContent = JSON.stringify({
      cardNo: cardNumber,
      studentId: student.studentId,
      name: student.fullName,
      dept: student.department,
      validUntil,
      verifyUrl: `https://scholarcore.edu.in/verify/idcard/${cardNumber}`
    });

    let qrDataUrl = '';
    try {
      qrDataUrl = await QRCode.toDataURL(qrContent, { margin: 1, width: 180 });
    } catch (e) {
      qrDataUrl = '';
    }

    const barcodeValue = generateBarcodeSvg(student.studentId, 45);

    const id = existing ? existing.id : `card-${Date.now()}`;
    const newCard: IdCardRecord = {
      id,
      cardNumber,
      studentDbId: student.id,
      studentRollNo: student.studentId,
      studentName: student.fullName,
      department: student.department,
      enrollmentYear: student.enrollmentYear,
      validUntil,
      issueDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
      dob: student.dateOfBirth || '15/08/2003',
      bloodGroup,
      emergencyPhone,
      address: student.address || 'Bengaluru Campus',
      photoUrl,
      qrCodeData: qrDataUrl,
      barcodeValue,
      status: 'Active',
      layoutTemplate,
      printCount: existing ? existing.printCount + 1 : 0,
      createdAt: new Date().toISOString()
    };

    dbStore.idCards.set(id, newCard);

    // Audit log
    dbStore.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userId: user.id || 'usr-admin',
      userEmail: user.email || 'admin@scholarcore.edu',
      userRole: user.role || 'SuperAdmin',
      action: existing ? 'REISSUE_IDCARD' : 'GENERATE_IDCARD',
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
      details: `Generated ID Card ${cardNumber} for ${student.fullName} (${student.studentId})`
    });

    return newCard;
  }

  public async batchGenerateCards(
    studentDbIds: string[],
    layoutTemplate: IdCardRecord['layoutTemplate'],
    user: any
  ) {
    let generated = 0;
    for (const sId of studentDbIds) {
      try {
        await this.generateCard({ studentDbId: sId, layoutTemplate }, user);
        generated++;
      } catch (e) {
        // Skip invalid student IDs
      }
    }
    return { generatedCount: generated };
  }

  public updateCard(id: string, updates: Partial<IdCardRecord>, user: any): IdCardRecord {
    const card = dbStore.idCards.get(id);
    if (!card) throw new Error('Card record not found.');

    const updated: IdCardRecord = {
      ...card,
      ...updates,
      id: card.id,
      cardNumber: card.cardNumber
    };

    dbStore.idCards.set(id, updated);
    return updated;
  }

  public revokeCard(id: string, reason: string, user: any): IdCardRecord {
    const card = dbStore.idCards.get(id);
    if (!card) throw new Error('Card record not found.');

    card.status = 'Revoked';
    dbStore.idCards.set(id, card);

    dbStore.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userId: user.id || 'usr-admin',
      userEmail: user.email || 'admin@scholarcore.edu',
      userRole: user.role || 'SuperAdmin',
      action: 'REVOKE_IDCARD',
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
      details: `Revoked ID Card ${card.cardNumber} (${card.studentName}). Reason: ${reason}`
    });

    return card;
  }

  public recordPrint(id: string): IdCardRecord {
    const card = dbStore.idCards.get(id);
    if (!card) throw new Error('Card record not found.');

    card.printCount = (card.printCount || 0) + 1;
    dbStore.idCards.set(id, card);
    return card;
  }

  public getBrandingConfig(): CollegeBrandingConfig {
    return dbStore.brandingConfig;
  }

  public updateBrandingConfig(data: Partial<CollegeBrandingConfig>, user: any): CollegeBrandingConfig {
    dbStore.brandingConfig = {
      ...dbStore.brandingConfig,
      ...data
    };

    dbStore.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userId: user.id || 'usr-admin',
      userEmail: user.email || 'admin@scholarcore.edu',
      userRole: user.role || 'SuperAdmin',
      action: 'UPDATE_BRANDING_CONFIG',
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
      details: 'Updated College ID Card Branding & Logo Configurations'
    });

    return dbStore.brandingConfig;
  }
}
