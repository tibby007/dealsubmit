// Deal Types
export const DEAL_TYPES = {
  equipment_finance: 'Equipment Finance',
  mca_working_capital: 'MCA Working Capital',
  line_of_credit: 'Line of Credit',
  term_loan: 'Term Loan',
  real_estate: 'Real Estate Business Loan',
} as const

export type DealType = keyof typeof DEAL_TYPES

// Deal Statuses
export const DEAL_STATUSES = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  docs_needed: 'Docs Needed',
  packaging: 'Packaging',
  submitted_to_lender: 'Submitted to Lender',
  approved: 'Approved',
  declined: 'Declined',
  funded: 'Funded',
} as const

export type DealStatus = keyof typeof DEAL_STATUSES

// Legal Entity Types
export const LEGAL_ENTITIES = {
  corporation: 'Corporation',
  llc: 'LLC',
  limited_partnership: 'Limited Partnership',
  general_partnership: 'General Partnership',
  llp: 'LLP',
  sole_proprietor: 'Sole Proprietor',
} as const

export type LegalEntity = keyof typeof LEGAL_ENTITIES

// Location Types
export const LOCATION_TYPES = {
  rent: 'Rent',
  own: 'Own',
} as const

export type LocationType = keyof typeof LOCATION_TYPES

// Document Types
export const DOCUMENT_TYPES = {
  bank_statement: 'Bank Statement',
  tax_return: 'Tax Return',
  quote_invoice: 'Quote/Invoice',
  voided_check: 'Voided Check',
  credit_card_statements: 'Credit Card Statements',
  profit_loss: 'Profit & Loss Statement',
  balance_sheet: 'Balance Sheet',
  debt_schedule: 'Debt Schedule',
  property_docs: 'Property Documentation',
  rent_roll: 'Rent Roll',
  environmental_report: 'Environmental Report',
  equipment_photos: 'Equipment Photos',
  signed_application: 'Signed Application',
  other: 'Other',
} as const

export type DocumentType = keyof typeof DOCUMENT_TYPES

// US States
export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
] as const

export type USState = typeof US_STATES[number]

// User Roles
export const USER_ROLES = {
  admin: 'Admin',
  broker: 'Broker',
} as const

export type UserRole = keyof typeof USER_ROLES

// Onboarding Statuses
export const ONBOARDING_STATUSES = {
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  agreement_pending: 'Agreement Pending',
  w9_pending: 'W9 Pending',
  complete: 'Complete',
} as const

export type OnboardingStatus = keyof typeof ONBOARDING_STATUSES

// Application Statuses
export const APPLICATION_STATUSES = {
  pending: 'Pending',
  approved: 'Approved',
  declined: 'Declined',
} as const

export type ApplicationStatus = keyof typeof APPLICATION_STATUSES

// Partner Document Types
export const PARTNER_DOCUMENT_TYPES = {
  w9: 'W9',
  voided_check: 'Voided Check',
  direct_deposit_form: 'Direct Deposit Form',
} as const

export type PartnerDocumentType = keyof typeof PARTNER_DOCUMENT_TYPES

// How Heard About Us Options
export const HOW_HEARD_OPTIONS = [
  'Referral',
  'LinkedIn',
  'Google',
  'Industry Event',
  'Other',
] as const

export type HowHeardOption = typeof HOW_HEARD_OPTIONS[number]

// Typical Deal Types (for partner application)
export const TYPICAL_DEAL_TYPES = [
  'Equipment Finance',
  'Working Capital/MCA',
  'Bank Lines of Credit',
  'Term Loans',
] as const

export type TypicalDealType = typeof TYPICAL_DEAL_TYPES[number]

// Monthly Volume Options
export const MONTHLY_VOLUME_OPTIONS = [
  '1-5 deals',
  '6-10 deals',
  '11-20 deals',
  '20+ deals',
] as const

export type MonthlyVolumeOption = typeof MONTHLY_VOLUME_OPTIONS[number]
