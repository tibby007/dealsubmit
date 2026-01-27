import type { DealType, LegalEntity, LocationType } from '@/lib/constants'
import type { Json } from './database'

export interface OwnerFormData {
  first_name: string
  last_name: string
  home_address: string
  city: string
  state: string
  zip: string
  home_phone: string
  cell_phone: string
  email: string
  ssn: string
  date_of_birth: string
  ownership_percentage: number
  annual_income: number
  position_title: string
  estimated_fico: number
}

export interface DealFormData {
  deal_type: DealType
  funding_amount: number
  legal_business_name: string
  dba_name: string
  business_address: string
  business_city: string
  business_state: string
  business_zip: string
  business_phone: string
  tax_id: string
  date_established: string
  legal_entity: LegalEntity
  state_of_incorporation: string
  industry: string
  annual_revenue: number
  location_type: LocationType
  monthly_rent_mortgage: number
  landlord_name: string
  landlord_phone: string
  use_of_funds: string
  broker_writeup: string
  deal_details: Record<string, Json>
  owners: OwnerFormData[]
}

export interface StepProps {
  formData: DealFormData
  updateFormData: (updates: Partial<DealFormData>) => void
}
