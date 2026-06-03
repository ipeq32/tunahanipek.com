import {
  AlertTriangle,
  Cookie,
  Database,
  FileText,
  KeyRound,
  Mail,
  RefreshCw,
  Scale,
  Shield,
  UserCheck,
  type LucideIcon,
} from 'lucide-react';

export const PRIVACY_SECTION_KEYS = [
  'intro',
  'data',
  'cookies',
  'rights',
  'contact',
] as const;

export const TERMS_SECTION_KEYS = [
  'intro',
  'content',
  'account',
  'liability',
  'changes',
] as const;

export type PrivacySectionKey = (typeof PRIVACY_SECTION_KEYS)[number];
export type TermsSectionKey = (typeof TERMS_SECTION_KEYS)[number];

export const PRIVACY_SECTION_ICONS: Record<PrivacySectionKey, LucideIcon> = {
  intro: Shield,
  data: Database,
  cookies: Cookie,
  rights: UserCheck,
  contact: Mail,
};

export const TERMS_SECTION_ICONS: Record<TermsSectionKey, LucideIcon> = {
  intro: Scale,
  content: FileText,
  account: KeyRound,
  liability: AlertTriangle,
  changes: RefreshCw,
};
