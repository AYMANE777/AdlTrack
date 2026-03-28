export interface RehabilitationRequest {
  id: number;
  ordinalNumber: number;
  year: number;
  ordinalFull: string;
  FullName: string;
  cin: string;
  request_date: string;
  prosecution_inquiry_date: string | null;
  prosecution_opinion: string | null;
  request_status: string;
  createdBy: { fullName: string };
  updatedBy?: { fullName: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface AlternativePenalty {
  id: number;
  serial_number: number;
  year: number;
  ordinal_full: string;
  full_name: string;
  national_id: string;
  address_contact: string | null;
  source_court: string | null;
  case_number: string | null;
  judgment_number: string | null;
  judgment_date: string | null;
  crime_type: string | null;
  original_penalty_type: string | null;
  original_penalty_duration: string | null;
  alternative_penalty_type: string | null;
  alternative_penalty_details: string | null;
  supervising_institution: string | null;
  prosecution_referral_date: string | null;
  execution_decision_number: string | null;
  execution_decision_date: string | null;
  execution_decision_content: string | null;
  followup_orders: string | null;
  report_received_date: string | null;
  responsible_authority: string | null;
  compliance_notes: string | null;
  appellant_identity: string | null;
  dispute_date: string | null;
  dispute_subject: string | null;
  dispute_outcome: string | null;
  final_decision_date: string | null;
  appeal_deadline: string | null;
  notification_date: string | null;
  judge_notes: string | null;
  createdBy: { fullName: string };
  updatedBy?: { fullName: string } | null;
  created_at: string;
  updated_at: string;
}

export interface RehabilitationRequestRapport {
  id: number;
  ordinalNumber: number;
  year: number;
  ordinalFull: string;
  rehabilitationRequestId: number;
  num_dossier: string;
  FullName: string;
  fils_de_pere: string;
  fils_de_mere: string;
  date_naissance: string;
  adresse: string | null;
  date_de_faire: string;
  tribunal: string;
  ville: string;
  status: string;
  autre_condition: string | null;
  date: string;
  createdBy: { fullName: string };
  updatedBy?: { fullName: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'CLERK' | 'VIEWER';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
