import Axios from "axios";

export function toLoggableError(error: unknown) {
  if (Axios.isAxiosError(error)) {
    return {
      type: "axios" as const,
      message: error.message ?? "Axios request failed",
      code: error.code ?? null,
      status: error.response?.status ?? null,
      statusText: error.response?.statusText ?? null,
      url: error.config?.url ?? null,
      method: error.config?.method ?? null,
      responseData: error.response?.data ?? null,
      axios: typeof error.toJSON === "function" ? error.toJSON() : null,
    };
  }

  if (error instanceof Error) {
    const ownProps = Object.getOwnPropertyNames(error).reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = (error as unknown as Record<string, unknown>)[key];
      return acc;
    }, {});

    return {
      type: "error" as const,
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      ownProps,
    };
  }

  if (error && typeof error === "object") {
    const objectValue = error as Record<string, unknown>;
    return {
      type: "object" as const,
      keys: Object.keys(objectValue),
      value: objectValue,
    };
  }

  return {
    type: typeof error,
    value: error ?? null,
  };
}

export function hasUsefulErrorFields(payload: Record<string, unknown>): boolean {
  return Object.values(payload).some((value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim().length > 0;
    if (typeof value === "number" || typeof value === "boolean") return true;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") return Object.keys(value as Record<string, unknown>).length > 0;
    return false;
  });
}

export function safeSerializeForLog(value: unknown): string {
  try {
    const seen = new WeakSet<object>();
    return JSON.stringify(
      value,
      (_key, currentValue) => {
        if (currentValue instanceof Error) {
          return {
            name: currentValue.name,
            message: currentValue.message,
            stack: process.env.NODE_ENV === "development" ? currentValue.stack : undefined,
            ...Object.getOwnPropertyNames(currentValue).reduce<Record<string, unknown>>((acc, prop) => {
              acc[prop] = (currentValue as unknown as Record<string, unknown>)[prop];
              return acc;
            }, {}),
          };
        }

        if (currentValue && typeof currentValue === "object") {
          if (seen.has(currentValue as object)) {
            return "[Circular]";
          }
          seen.add(currentValue as object);
        }

        return currentValue;
      },
      2
    );
  } catch (serializeError) {
    return `{"serializeError":"${serializeError instanceof Error ? serializeError.message : "unknown"}"}`;
  }
}
