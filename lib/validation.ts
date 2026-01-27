import { z } from 'zod'

// Step 0: Deal Type
export const stepDealTypeSchema = z.object({
  deal_type: z.string().min(1, 'Select a deal type'),
  funding_amount: z.number().min(1000, 'Minimum funding amount is $1,000'),
})

// Step 1: Business Info
export const stepBusinessInfoSchema = z.object({
  legal_business_name: z.string().min(2, 'Business name is required'),
  business_address: z.string().min(3, 'Address is required'),
  business_city: z.string().min(2, 'City is required'),
  business_state: z.string().min(2, 'State is required'),
  business_zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Enter a valid ZIP code'),
  business_phone: z.string().min(7, 'Phone number is required'),
  tax_id: z.string().min(9, 'Tax ID is required'),
  date_established: z.string().min(1, 'Date established is required'),
  legal_entity: z.string().min(1, 'Entity type is required'),
  industry: z.string().min(2, 'Industry is required'),
  annual_revenue: z.number().min(1, 'Annual revenue is required'),
})

// Step 2: Owner Info
export const ownerSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  home_address: z.string().min(3, 'Home address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Enter a valid ZIP code'),
  cell_phone: z.string().min(7, 'Cell phone is required'),
  email: z.string().email('Enter a valid email'),
  ssn: z.string().min(9, 'SSN is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  ownership_percentage: z.number().min(1, 'Ownership % is required').max(100, 'Max 100%'),
  estimated_fico: z.number().min(300, 'FICO must be 300-850').max(850, 'FICO must be 300-850'),
})

export const stepOwnerInfoSchema = z.object({
  owners: z.array(ownerSchema).min(1, 'At least one owner is required'),
})

// Step 4: Use of Funds (non-equipment only)
export const stepUseOfFundsSchema = z.object({
  use_of_funds: z.string().min(10, 'Please describe how funds will be used'),
})

// Per-step validation
export function validateStep(step: number, formData: Record<string, any>): string[] {
  const errors: string[] = []

  try {
    if (step === 0) {
      stepDealTypeSchema.parse(formData)
    } else if (step === 1) {
      stepBusinessInfoSchema.parse(formData)
    } else if (step === 2) {
      // Validate only owners that have a first_name (active owners)
      const activeOwners = formData.owners?.filter((o: any) => o.first_name) || []
      if (activeOwners.length === 0) {
        return ['At least one owner is required']
      }
      for (let i = 0; i < activeOwners.length; i++) {
        try {
          ownerSchema.parse(activeOwners[i])
        } catch (err: any) {
          if (err.issues) {
            for (const issue of err.issues) {
              errors.push(`Owner ${i + 1}: ${issue.message}`)
            }
          }
        }
      }
      return errors
    } else if (step === 4 && formData.deal_type !== 'equipment_finance') {
      stepUseOfFundsSchema.parse(formData)
    }
    // Steps 3, 5, 6 have no required validation (deal details are flexible, docs optional at this stage, writeup optional)
  } catch (err: any) {
    if (err.issues) {
      for (const issue of err.issues) {
        errors.push(issue.message)
      }
    }
  }

  return errors
}
