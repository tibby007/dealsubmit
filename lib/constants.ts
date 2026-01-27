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
