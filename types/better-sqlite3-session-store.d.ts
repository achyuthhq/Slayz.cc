
declare module 'better-sqlite3-session-store' {
  import session from 'express-session';
  import { Database } from 'better-sqlite3';

  export default function(session: typeof import('express-session')): {
    new(options: {
      client: Database;
      expired?: {
        clear: boolean;
        intervalMs: number;
      };
    }): session.Store;
  };
}
