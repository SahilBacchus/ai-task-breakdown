function escapeCsvValue(value: unknown): string {
  const normalized = String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")

  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`
  }

  return normalized
}

export function buildCsv(headers: string[], rows: unknown[][]): string {
  const headerRow = headers.map(escapeCsvValue).join(",")
  const dataRows = rows.map((row) => row.map(escapeCsvValue).join(","))
  return [headerRow, ...dataRows].join("\r\n")
}

export function sanitizeCsvFilename(value: string): string {
  const sanitized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return sanitized || "project-tasks"
}

export function downloadCsv(filename: string, csvContent: string): void {
  const safeFilename = filename.endsWith(".csv") ? filename : `${filename}.csv`
  const blob = new Blob(["\ufeff", csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")

  anchor.href = url
  anchor.download = safeFilename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)

  URL.revokeObjectURL(url)
}
