/**
 * This file includes standard checkFormat functions which could be used in the question generators.
 */
import { FreeTextFormatFunction } from "@shared/api/QuestionGenerator.ts"
import { t, Translations } from "@shared/utils/translations.ts"

const checkFormatTranslations: Translations = {
  en: {
    empty: "The answer is empty.",
    formatAnyArray: "The answer must be a comma-separated list of values.",
    formatIntArray: "The answer must be a comma-separated list of integers.",
  },
  de: {
    empty: "Die Antwort ist leer.",
    formatAnyArray: "Die Antwort muss eine kommaseparierte Liste von Werten sein.",
    formatIntArray: "Die Antwort muss eine kommaseparierte Liste von ganzzahligen Werten sein.",
  },
}

/**
 * Checks if the given text is an array
 * @param text
 */
function isAnyArray(text: string) {
  return text.split(",").length > 0
}

/**
 * Checks if the given text is an array of integers
 * @param text
 */
function isIntArray(text: string) {
  // Split the text by comma and filter out any empty strings caused by trailing commas
  const values = text.split(",").filter((value) => value.trim() !== "");

  // Check if every value is an integer
  return values.every((value) => {
    const trimmedValue = value.trim();
    return Number.isInteger(parseFloat(trimmedValue)) && trimmedValue === parseInt(trimmedValue, 10).toString();
  });
}

/**
 * Converts a string into an array (seperated by comma)
 * @param text
 */
function parseStringToArray(text: string) {
  return text.split(",").map((value) => value.trim())
}

/**
 * This function parses a text into a table
 *
 * Exmaple:
 *  1,2,3,4
 *  will be parsed into
 *  |1|2|3|4|
 *  |---|---|---|---|
 *
 * @param array - array with any values
 */
function parseArrayTable(array: any[]) {
  const table = array.map((value) => `|${value}`).join(" ") + "|"

  const separator = "|" + array.map(() => "---").join("|") + "|"

  return `\n${table}\n${separator}\n`
}

export function checkFormatArray({
  lang,
  values = "any",
}: {
  lang: "de" | "en"
  values: "any" | "int"
}) {
  const normal: FreeTextFormatFunction = ({ text }) => {
    // remove all whitespaces
    text = text.replace(/\s/g, "")

    if (text === "") {
      return { valid: false }
    }

    return values === "any"
      ? isAnyArray(text)
        ? { valid: true }
        : { valid: false, message: t(checkFormatTranslations, lang, "formatAnyArray") }
      : isIntArray(text)
        ? { valid: true }
        : { valid: false, message: t(checkFormatTranslations, lang, "formatIntArray") }
  }

  const display: FreeTextFormatFunction = ({ text }) => {
    // remove all whitespaces
    text = text.replace(/\s/g, "")

    if (text === "") {
      return { valid: false }
    }

    return values === "any"
      ? isAnyArray(text)
        ? { valid: true, message: parseArrayTable(parseStringToArray(text)) }
        : { valid: false, message: t(checkFormatTranslations, lang, "formatAnyArray") }
      : isIntArray(text)
        ? { valid: true, message: parseArrayTable(parseStringToArray(text)) }
        : { valid: false, message: t(checkFormatTranslations, lang, "formatIntArray") }
  }

  return { normal, display }
}
