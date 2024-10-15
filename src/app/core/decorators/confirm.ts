/**
 * Confirmable is a factory function that accepts an optional message parameter
 * @param message
 * @constructor
 */
export function Confirmable(message: string = 'Are you sure?') {
  return (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    /**
     * Cache the original method
     */
    const originalMethod = descriptor.value;

    /**
     * New implementation that asks for confirmation before proceeding
     * @param args
     */
    descriptor.value = async function (...args: unknown[]) {
      /**
       * Ask for confirmation using the provided message
       */
      const confirmed = confirm(message);
      if (confirmed) {
        try {
          /**
           * Await the result of the original method to handle async functions
           */
          const result = await originalMethod.apply(this, args);
          return result;
        } catch (error) {
          console.error('Error executing method:', error);
          throw error;
        }
      }

      return null;
    };

    return descriptor;
  };
}
