

//lib/googleTranslationServer /translate.ts
import { translate } from "@vitalets/google-translate-api"

export async function translateValuesToArabic<T extends Record<string, any>>(
  data: T
): Promise<T> {
  const paths: Array<{ key: string; index?: number }> = []
  const values: string[] = []

  for (const key in data) {
    const value = data[key]

    if (typeof value === "string") {
      paths.push({ key })
      values.push(value)
    }

    if (Array.isArray(value)) {
      value.forEach((v :unknown, i:number) => {
        if (typeof v === "string") {
          paths.push({ key, index: i })
          values.push(v)
        }
      })
    }
  }

  if (values.length === 0) return data

  const res = await translate(values.join("|||"), { to: "ar" })
  const translated = res.text.split("|||")

  const result: any = structuredClone(data)

  translated.forEach((text, i) => {
    const p = paths[i]
    if (p.index !== undefined) result[p.key][p.index] = text
    else result[p.key] = text
  })

  return result
}

