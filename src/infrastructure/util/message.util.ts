export function formatMessage(template: string, params: { [key: string]: any }): string {
  return template.replace(/{(\w+)}/g, (_, key) => {
    return params[key] || '';
  });
}