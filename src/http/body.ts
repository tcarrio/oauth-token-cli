export const JsonBody = (options: unknown) => JSON.stringify(options);

export const FormBody = (options: Record<string, string>) =>
  new URLSearchParams(options).toString();
