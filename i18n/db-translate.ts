//i18n/db-translate.ts

type Lang = "en" | "ar"

export function dbT<T extends Record<string, any>>(
  record: T,
  field: string,
  lang: Lang
) {
  if (!record) return ""
  if (!record.translations) return record[field]

  return (
    record.translations?.[lang]?.[field] ??
    record.translations?.["en"]?.[field] ??
    record[field]
  )
}

