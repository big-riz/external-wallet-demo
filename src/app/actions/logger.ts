type ServerAction<T> = (...args: any[]) => Promise<T>;

export function withLogging<T>(actionName: string, action: ServerAction<T>): ServerAction<T> {
  return async (...args: any[]) => {
    const start = Date.now();
    try {
      const result = await action(...args);
      const duration = Date.now() - start;
      console.log(`ServerAction: ${actionName} - Duration: ${duration}ms - Args: ${JSON.stringify(args)}`);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      console.error(`ServerAction: ${actionName} - Error - Duration: ${duration}ms - Args: ${JSON.stringify(args)}`, error);
      throw error;
    }
  };
}