import {isAlphanumerical} from 'is-alphanumerical'
import {isAlphabetical} from 'is-alphabetical'
import {isDecimal} from 'is-decimal'
import {regular} from './regular.js'
import {normal} from './normal.js'

var own = {}.hasOwnProperty

/**
 * @typedef {Object} ParseOptions
 * @property {boolean} [normalize=true]
 * @property {boolean} [forgiving=false]
 * @property {(reason: string, code: number, offset: number) => void} [warning]
 *
 * @typedef {Object} Extension
 * @property {string} singleton
 * @property {Array.<string>} extensions
 *
 * @typedef {Object} Schema
 * @property {string|null} language
 * @property {Array.<string>} extendedLanguageSubtags
 * @property {string|null} script
 * @property {string|null} region
 * @property {Array.<string>} variants
 * @property {Array.<Extension>} extensions
 * @property {Array.<string>} privateuse
 * @property {string|null} irregular
 * @property {string|null} regular
 */

/**
 * Parse a BCP 47 language tag.
 *
 * @param {string} tag
 * @param {ParseOptions} [options]
 * @returns {Schema}
 */
export function parse(tag, options) {
  var settings = options || {}
  var result = empty()
  var source = String(tag)
  var value = source.toLowerCase()
  var index = 0
  /** @type {number} */
  var start
  /** @type {number} */
  var groups
  /** @type {number} */
  var offset

  // Check input.
  if (tag === null || tag === undefined) {
    throw new Error('Expected string, got `' + tag + '`')
  }

  // Let’s start.
  // First: the edge cases.
  if (own.call(normal, value)) {
    if (
      (settings.normalize === undefined ||
        settings.normalize === null ||
        settings.normalize) &&
      normal[value]
    ) {
      return parse(normal[value])
    }

    result[regular.includes(value) ? 'regular' : 'irregular'] = source

    return result
  }

  // Now, to actually parse, eat what could be a language.
  while (isAlphabetical(value.charCodeAt(index)) && index < 9) index++

  // A language.
  if (index > 1 /* Min 639. */ && index < 9 /* Max subtag. */) {
    // 5 and up is a subtag.
    // 4 is the size of reserved languages.
    // 3 an ISO 639-2 or ISO 639-3.
    // 2 is an ISO 639-1.
    // <https://github.com/wooorm/iso-639-2>
    // <https://github.com/wooorm/iso-639-3>
    result.language = source.slice(0, index)

    if (index < 4 /* Max 639. */) {
      groups = 0

      while (
        value.charCodeAt(index) === 45 /* `-` */ &&
        isAlphabetical(value.charCodeAt(index + 1)) &&
        isAlphabetical(value.charCodeAt(index + 2)) &&
        isAlphabetical(value.charCodeAt(index + 3)) &&
        !isAlphabetical(value.charCodeAt(index + 4))
      ) {
        if (groups > 2 /* Max extended language subtag count. */) {
          return fail(
            index,
            3,
            'Too many extended language subtags, expected at most 3 subtags'
          )
        }

        // Extended language subtag.
        result.extendedLanguageSubtags.push(source.slice(index + 1, index + 4))
        index += 4
        groups++
      }
    }

    // ISO 15924 script.
    // <https://github.com/wooorm/iso-15924>
    if (
      value.charCodeAt(index) === 45 /* `-` */ &&
      isAlphabetical(value.charCodeAt(index + 1)) &&
      isAlphabetical(value.charCodeAt(index + 2)) &&
      isAlphabetical(value.charCodeAt(index + 3)) &&
      isAlphabetical(value.charCodeAt(index + 4)) &&
      !isAlphabetical(value.charCodeAt(index + 5))
    ) {
      result.script = source.slice(index + 1, index + 5)
      index += 5
    }

    if (value.charCodeAt(index) === 45 /* `-` */) {
      // ISO 3166-1 region.
      // <https://github.com/wooorm/iso-3166>
      if (
        isAlphabetical(value.charCodeAt(index + 1)) &&
        isAlphabetical(value.charCodeAt(index + 2)) &&
        !isAlphabetical(value.charCodeAt(index + 3))
      ) {
        result.region = source.slice(index + 1, index + 3)
        index += 3
      }
      // UN M49 region.
      // <https://github.com/wooorm/un-m49>
      else if (
        isDecimal(value.charCodeAt(index + 1)) &&
        isDecimal(value.charCodeAt(index + 2)) &&
        isDecimal(value.charCodeAt(index + 3)) &&
        !isDecimal(value.charCodeAt(index + 4))
      ) {
        result.region = source.slice(index + 1, index + 4)
        index += 4
      }
    }

    while (value.charCodeAt(index) === 45 /* `-` */) {
      start = index + 1
      offset = start

      while (isAlphanumerical(value.charCodeAt(offset))) {
        if (offset - start > 7 /* Max variant. */) {
          return fail(
            offset,
            1,
            'Too long variant, expected at most 8 characters'
          )
        }

        offset++
      }

      if (
        // Long variant.
        offset - start > 4 /* Min alpha numeric variant. */ ||
        // Short variant.
        (offset - start > 3 /* Min variant. */ &&
          isDecimal(value.charCodeAt(start)))
      ) {
        result.variants.push(source.slice(start, offset))
        index = offset
      }
      // Something else.
      else {
        break
      }
    }

    // Extensions.
    while (value.charCodeAt(index) === 45 /* `-` */) {
      // Exit if this isn’t an extension.
      if (
        value.charCodeAt(index + 1) === 120 /* `x` */ ||
        !isAlphanumerical(value.charCodeAt(index + 1)) ||
        value.charCodeAt(index + 2) !== 45 /* `-` */ ||
        !isAlphanumerical(value.charCodeAt(index + 3))
      ) {
        break
      }

      offset = index + 2
      groups = 0

      while (
        value.charCodeAt(offset) === 45 /* `-` */ &&
        isAlphanumerical(value.charCodeAt(offset + 1)) &&
        isAlphanumerical(value.charCodeAt(offset + 2))
      ) {
        start = offset + 1
        offset = start + 2
        groups++

        while (isAlphanumerical(value.charCodeAt(offset))) {
          if (offset - start > 7 /* Max extension. */) {
            return fail(
              offset,
              2,
              'Too long extension, expected at most 8 characters'
            )
          }

          offset++
        }
      }

      if (!groups) {
        return fail(
          offset,
          4,
          'Empty extension, extensions must have at least 2 characters of content'
        )
      }

      result.extensions.push({
        singleton: source.charAt(index + 1),
        extensions: source.slice(index + 3, offset).split('-')
      })

      index = offset
    }
  }
  // Not a language.
  else {
    index = 0
  }

  // Private use.
  if (
    (index === 0 && value.charCodeAt(index) === 120) /* `x` */ ||
    (value.charCodeAt(index) === 45 /* `-` */ &&
      value.charCodeAt(index + 1) === 120) /* `x` */
  ) {
    index = index ? index + 2 : 1
    offset = index

    while (
      value.charCodeAt(offset) === 45 /* `-` */ &&
      isAlphanumerical(value.charCodeAt(offset + 1))
    ) {
      start = index + 1
      offset = start

      while (isAlphanumerical(value.charCodeAt(offset))) {
        if (offset - start > 7 /* Max private use. */) {
          return fail(
            offset,
            5,
            'Too long private-use area, expected at most 8 characters'
          )
        }

        offset++
      }

      result.privateuse.push(source.slice(index + 1, offset))
      index = offset
    }
  }

  if (index !== source.length) {
    return fail(index, 6, 'Found superfluous content after tag')
  }

  return result

  /**
   * Create an empty results object.
   *
   * @param {number} offset
   * @param {number} code
   * @param {string} reason
   * @returns {Schema}
   */
  function fail(offset, code, reason) {
    if (settings.warning) settings.warning(reason, code, offset)
    return settings.forgiving ? result : empty()
  }
}

/**
 * Create an empty results object.
 *
 * @returns {Schema}
 */
function empty() {
  return {
    language: null,
    extendedLanguageSubtags: [],
    script: null,
    region: null,
    variants: [],
    extensions: [],
    privateuse: [],
    irregular: null,
    regular: null
  }
}
