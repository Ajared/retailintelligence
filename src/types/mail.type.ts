export interface MailData {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  cc?: string[];
  bcc?: string[];
  from?: string;
  template?: string;
  context?: Record<string, unknown>;
}
