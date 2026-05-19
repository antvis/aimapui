export function formatCode(code: string): string {
  return code.trim()
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}
