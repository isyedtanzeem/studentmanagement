import {
  PromotionStudentItem,
  PromotionRecord,
  ValidationRules,
  BulkPromotionResult,
} from '../types/promotion';
import { fetchWithAuth } from './httpClient';

export interface PromotionFilters {
  department?: string;
  currentSemester?: number;
  currentYear?: number;
  academicBatch?: string;
  search?: string;
  status?: string;
  minAttendance?: number;
  maxBacklogs?: number;
  requireFeePaid?: boolean;
  requireDisciplineClearance?: boolean;
}

export const promotionApi = {
  // Fetch eligible students with validation status
  async getStudents(filters: PromotionFilters = {}) {
    const params = new URLSearchParams();
    if (filters.department) params.append('department', filters.department);
    if (filters.currentSemester) params.append('currentSemester', filters.currentSemester.toString());
    if (filters.currentYear) params.append('currentYear', filters.currentYear.toString());
    if (filters.academicBatch) params.append('academicBatch', filters.academicBatch);
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.minAttendance !== undefined) params.append('minAttendance', filters.minAttendance.toString());
    if (filters.maxBacklogs !== undefined) params.append('maxBacklogs', filters.maxBacklogs.toString());
    if (filters.requireFeePaid !== undefined) params.append('requireFeePaid', filters.requireFeePaid.toString());
    if (filters.requireDisciplineClearance !== undefined) params.append('requireDisciplineClearance', filters.requireDisciplineClearance.toString());

    const res = await fetchWithAuth(`/api/v1/promotions/students?${params.toString()}`);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch promotion students.');
    }
    return data.data as {
      students: PromotionStudentItem[];
      totalCount: number;
      eligibleCount: number;
      warningCount: number;
      validationRulesApplied: ValidationRules;
    };
  },

  // Promote single student
  async promoteIndividual(payload: {
    studentDbId: string;
    promotionType: 'Semester Promotion' | 'Year Promotion' | 'Graduation' | 'Conditional Promotion';
    targetSemester: number;
    targetYear: number;
    academicSession: string;
    promotedBy: string;
    remarks?: string;
    allowOverride?: boolean;
    validationRules?: Partial<ValidationRules>;
  }) {
    const res = await fetchWithAuth('/api/v1/promotions/promote-individual', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to promote student.');
    }
    return data.data as PromotionRecord;
  },

  // Promote bulk students
  async promoteBulk(payload: {
    studentDbIds: string[];
    promotionType: 'Semester Promotion' | 'Year Promotion';
    academicSession: string;
    promotedBy: string;
    remarks?: string;
    allowOverride?: boolean;
    validationRules?: Partial<ValidationRules>;
  }) {
    const res = await fetchWithAuth('/api/v1/promotions/promote-bulk', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to execute bulk promotion.');
    }
    return data.data as BulkPromotionResult;
  },

  // Fetch promotion history logs
  async getHistory(filters: { search?: string; department?: string; promotionType?: string; status?: string } = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.department) params.append('department', filters.department);
    if (filters.promotionType) params.append('promotionType', filters.promotionType);
    if (filters.status) params.append('status', filters.status);

    const res = await fetchWithAuth(`/api/v1/promotions/history?${params.toString()}`);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch promotion history.');
    }
    return data.data as {
      history: PromotionRecord[];
      stats: {
        total: number;
        promoted: number;
        conditional: number;
        rolledBack: number;
      };
    };
  },

  // Rollback promotion
  async rollbackPromotion(id: string, rollbackReason: string, rolledBackBy?: string) {
    const res = await fetchWithAuth(`/api/v1/promotions/rollback/${id}`, {
      method: 'POST',
      body: JSON.stringify({ rollbackReason, rolledBackBy }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to rollback promotion record.');
    }
    return data.data as PromotionRecord;
  },
};
