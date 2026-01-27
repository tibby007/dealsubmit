export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Relationships: []
        Row: {
          id: string
          email: string
          full_name: string
          company_name: string | null
          phone: string | null
          role: 'admin' | 'broker'
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          company_name?: string | null
          phone?: string | null
          role?: 'admin' | 'broker'
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          company_name?: string | null
          phone?: string | null
          role?: 'admin' | 'broker'
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      deals: {
        Relationships: []
        Row: {
          id: string
          broker_id: string
          deal_type: 'equipment_finance' | 'mca_working_capital' | 'line_of_credit' | 'term_loan' | 'real_estate'
          status: 'submitted' | 'under_review' | 'docs_needed' | 'packaging' | 'submitted_to_lender' | 'approved' | 'declined' | 'funded'
          funding_amount: number
          legal_business_name: string
          dba_name: string | null
          business_address: string
          business_city: string
          business_state: string
          business_zip: string
          business_phone: string
          tax_id: string
          date_established: string
          legal_entity: 'corporation' | 'llc' | 'limited_partnership' | 'general_partnership' | 'llp' | 'sole_proprietor'
          state_of_incorporation: string | null
          industry: string
          annual_revenue: number
          location_type: 'rent' | 'own' | null
          monthly_rent_mortgage: number | null
          landlord_name: string | null
          landlord_phone: string | null
          deal_details: Json
          broker_writeup: string | null
          use_of_funds: string
          admin_notes: string | null
          created_at: string
          updated_at: string
          submitted_at: string
          last_status_change: string
        }
        Insert: {
          id?: string
          broker_id: string
          deal_type: 'equipment_finance' | 'mca_working_capital' | 'line_of_credit' | 'term_loan' | 'real_estate'
          status?: 'submitted' | 'under_review' | 'docs_needed' | 'packaging' | 'submitted_to_lender' | 'approved' | 'declined' | 'funded'
          funding_amount: number
          legal_business_name: string
          dba_name?: string | null
          business_address: string
          business_city: string
          business_state: string
          business_zip: string
          business_phone: string
          tax_id: string
          date_established: string
          legal_entity: 'corporation' | 'llc' | 'limited_partnership' | 'general_partnership' | 'llp' | 'sole_proprietor'
          state_of_incorporation?: string | null
          industry: string
          annual_revenue: number
          location_type?: 'rent' | 'own' | null
          monthly_rent_mortgage?: number | null
          landlord_name?: string | null
          landlord_phone?: string | null
          deal_details?: Json
          broker_writeup?: string | null
          use_of_funds: string
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
          submitted_at?: string
          last_status_change?: string
        }
        Update: {
          id?: string
          broker_id?: string
          deal_type?: 'equipment_finance' | 'mca_working_capital' | 'line_of_credit' | 'term_loan' | 'real_estate'
          status?: 'submitted' | 'under_review' | 'docs_needed' | 'packaging' | 'submitted_to_lender' | 'approved' | 'declined' | 'funded'
          funding_amount?: number
          legal_business_name?: string
          dba_name?: string | null
          business_address?: string
          business_city?: string
          business_state?: string
          business_zip?: string
          business_phone?: string
          tax_id?: string
          date_established?: string
          legal_entity?: 'corporation' | 'llc' | 'limited_partnership' | 'general_partnership' | 'llp' | 'sole_proprietor'
          state_of_incorporation?: string | null
          industry?: string
          annual_revenue?: number
          location_type?: 'rent' | 'own' | null
          monthly_rent_mortgage?: number | null
          landlord_name?: string | null
          landlord_phone?: string | null
          deal_details?: Json
          broker_writeup?: string | null
          use_of_funds?: string
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
          submitted_at?: string
          last_status_change?: string
        }
      }
      owners: {
        Relationships: []
        Row: {
          id: string
          deal_id: string
          owner_number: 1 | 2
          first_name: string
          last_name: string
          home_address: string
          city: string
          state: string
          zip: string
          home_phone: string | null
          cell_phone: string
          email: string
          ssn_encrypted: string | null
          ssn_last_four: string | null
          date_of_birth: string
          ownership_percentage: number
          annual_income: number | null
          position_title: string | null
          created_at: string
        }
        Insert: {
          id?: string
          deal_id: string
          owner_number: 1 | 2
          first_name: string
          last_name: string
          home_address: string
          city: string
          state: string
          zip: string
          home_phone?: string | null
          cell_phone: string
          email: string
          ssn_encrypted?: string | null
          ssn_last_four?: string | null
          date_of_birth: string
          ownership_percentage: number
          annual_income?: number | null
          position_title?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          deal_id?: string
          owner_number?: 1 | 2
          first_name?: string
          last_name?: string
          home_address?: string
          city?: string
          state?: string
          zip?: string
          home_phone?: string | null
          cell_phone?: string
          email?: string
          ssn_encrypted?: string | null
          ssn_last_four?: string | null
          date_of_birth?: string
          ownership_percentage?: number
          annual_income?: number | null
          position_title?: string | null
          created_at?: string
        }
      }
      documents: {
        Relationships: []
        Row: {
          id: string
          deal_id: string
          document_type: 'bank_statement' | 'tax_return' | 'quote_invoice' | 'voided_check' | 'credit_card_statements' | 'profit_loss' | 'balance_sheet' | 'debt_schedule' | 'property_docs' | 'rent_roll' | 'environmental_report' | 'equipment_photos' | 'signed_application' | 'other'
          file_name: string
          file_path: string
          file_size: number
          mime_type: string
          uploaded_by: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          deal_id: string
          document_type: 'bank_statement' | 'tax_return' | 'quote_invoice' | 'voided_check' | 'credit_card_statements' | 'profit_loss' | 'balance_sheet' | 'debt_schedule' | 'property_docs' | 'rent_roll' | 'environmental_report' | 'equipment_photos' | 'signed_application' | 'other'
          file_name: string
          file_path: string
          file_size: number
          mime_type: string
          uploaded_by?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          deal_id?: string
          document_type?: 'bank_statement' | 'tax_return' | 'quote_invoice' | 'voided_check' | 'credit_card_statements' | 'profit_loss' | 'balance_sheet' | 'debt_schedule' | 'property_docs' | 'rent_roll' | 'environmental_report' | 'equipment_photos' | 'signed_application' | 'other'
          file_name?: string
          file_path?: string
          file_size?: number
          mime_type?: string
          uploaded_by?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      deal_messages: {
        Relationships: []
        Row: {
          id: string
          deal_id: string
          sender_id: string | null
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          deal_id: string
          sender_id: string | null
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          deal_id?: string
          sender_id?: string | null
          message?: string
          is_read?: boolean
          created_at?: string
        }
      }
      status_history: {
        Relationships: []
        Row: {
          id: string
          deal_id: string
          old_status: string | null
          new_status: string
          changed_by: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          deal_id: string
          old_status?: string | null
          new_status: string
          changed_by: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          deal_id?: string
          old_status?: string | null
          new_status?: string
          changed_by?: string | null
          notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      get_broker_deal_stats: {
        Args: {
          broker_uuid: string
        }
        Returns: {
          total_deals: number
          under_review: number
          docs_needed: number
          funded: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
