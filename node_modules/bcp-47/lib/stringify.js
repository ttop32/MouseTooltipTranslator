/**
 * @typedef {Partial<import('./parse.js').Schema>} Schema
 * @typedef {Partial<import('./parse.js').Extension>} Extension
 */

/**
 * Compile a language schema to a BCP 47 language tag.
 *
 * @param {Schema} schema
 * @returns {string}
 */
export function stringify(schema = {}) {
  /** @type {Array.<string>} */
  var result = []
  /** @type {Array.<Extension>} */
  var values
  /** @type {number} */
  var index
  /** @type {Extension} */
  var value

  if (schema.irregular || schema.regular) {
    return schema.irregular || schema.regular
  }

  if (schema.language) {
    result = result.concat(
      schema.language,
      schema.extendedLanguageSubtags || [],
      schema.script || [],
      schema.region || [],
      schema.variants || []
    )

    values = schema.extensions || []
    index = -1

    while (++index < values.length) {
      value = values[index]

      if (value.singleton && value.extensions && value.extensions.length > 0) {
        result = result.concat(value.singleton, value.extensions)
      }
    }
  }

  if (schema.privateuse && schema.privateuse.length > 0) {
    result = result.concat('x', schema.privateuse)
  }

  return result.join('-')
}
