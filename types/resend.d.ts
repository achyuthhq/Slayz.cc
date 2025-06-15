declare module 'resend' {
  export interface EmailPayload {
    from: string;
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    cc?: string | string[];
    bcc?: string | string[];
    reply_to?: string;
    attachments?: Array<{
      filename: string;
      content: Buffer | string;
      contentType?: string;
    }>;
  }

  export interface SendEmailResponse {
    id: string;
    from: string;
    to: string | string[];
    created_at: string;
  }

  export class Resend {
    constructor(apiKey: string);
    
    emails: {
      send: (payload: EmailPayload) => Promise<SendEmailResponse>;
    };
  }
} 