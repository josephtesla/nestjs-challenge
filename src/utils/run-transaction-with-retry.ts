import { ClientSession } from 'mongoose';

export async function runTransactionWithRetry<T>(
  sessionFactory: () => Promise<ClientSession>,
  operation: (session: ClientSession) => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const session = await sessionFactory();

    try {
      const result = await session.withTransaction(() => operation(session));
      await session.endSession();
      return result;
    } catch (error: any) {
      // handle transient transaction errors
      lastError = error;

      const isTransient =
        error?.hasErrorLabel?.('TransientTransactionError') ||
        error?.errorLabels?.includes?.('TransientTransactionError');

      await session.endSession();

      if (!isTransient || attempt === maxRetries) {
        throw lastError;
      }
    }
  }

  throw new Error('Transaction failed after maximum retries');
}
