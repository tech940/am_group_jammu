/**
 * The offer shown in the enquiry form. Asked for by the owner on 2026-11-19
 * ("make it attractive and add Get extra RS 2000 OFF"), because the plain form
 * was not producing leads.
 *
 * One place to change it: edit the amount here, or set ENQUIRY_OFFER to null
 * to take the offer off the site. Nothing else needs touching.
 *
 * It applies to BUYING enquiries only. Money off a car makes no sense on the
 * sell-your-car, finance, insurance or service forms, so those never show it.
 *
 * The lead records that the offer was shown (a note in the lead's history and
 * a line in the lead email), so the sales desk knows the customer was promised
 * it. The server decides that from the intent, not from what the browser
 * claims, so a tampered request cannot attach the offer to a sell lead.
 */

import type { LeadIntent } from './types.ts'

export interface EnquiryOffer {
  /** Rupees. */
  amount: number
  /** "₹2,000" */
  label: string
  /** Written into the lead's history and email. */
  record: string
  intents: readonly LeadIntent[]
}

export const ENQUIRY_OFFER: EnquiryOffer | null = {
  amount: 2000,
  label: '₹2,000',
  record: 'Offer shown in the enquiry form: extra ₹2,000 off a used car bought from AM Group.',
  intents: ['Vehicle Enquiry', 'General', 'Test Drive'],
}

export function offerFor(intent: LeadIntent | null | undefined): EnquiryOffer | null {
  if (!ENQUIRY_OFFER || !intent) return null
  return ENQUIRY_OFFER.intents.includes(intent) ? ENQUIRY_OFFER : null
}
