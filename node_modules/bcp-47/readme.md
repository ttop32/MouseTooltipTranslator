# bcp-47

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]

Parse and stringify [BCP 47][spec] language tags.

## Install

This package is ESM only: Node 12+ is needed to use it and it must be `import`ed
instead of `require`d.

[npm][]:

```sh
npm install bcp-47
```

## Contents

*   [Use](#use)
*   [API](#api)
    *   [`parse(tag[, options])`](#parsetag-options)
    *   [`stringify(schema)`](#stringifyschema)
    *   [`schema`](#schema)
    *   [`function warning(reason, code, offset)`](#function-warningreason-code-offset)
*   [Related](#related)
*   [License](#license)

## Use

```js
import {parse, stringify} from 'bcp-47'

var schema = parse('hy-Latn-IT-arevela')

console.log(schema)
console.log(stringify(schema))
```

Yields:

```js
{ language: 'hy',
  extendedLanguageSubtags: [],
  script: 'Latn',
  region: 'IT',
  variants: ['arevela'],
  extensions: [],
  privateuse: [],
  irregular: null,
  regular: null }
'hy-Latn-IT-arevela'
```

## API

This package exports the following identifiers: `parse`, `stringify`.
There is no default export.

### `parse(tag[, options])`

Parse a BCP 47 tag into a language schema.
Note that the algorithm is case-insensitive.

###### `options.normalize`

Whether to normalize legacy tags when possible (`boolean`, default:
`true`).  For example, `i-klingon` does not match the BCP 47 language
algorithm but is valid nonetheless.  It is suggested to use `tlh`
instead (the ISO 639-3 code for Klingon).  When `normalize` is true,
passing `i-klingon`, or other deprecated tags, is handled as if their
suggested valid tag was given.

###### `options.forgiving`

By default, when an error is encountered, an empty object is returned.
When in forgiving mode, all found values up to the point of the error
are included (`boolean`, default: `false`).  So, for example, where by
default `en-GB-abcdefghi` an empty object is returned (as the language
variant is too long), in `forgiving` mode the `language` of `schema` is
populated with `en` and the `region` is populated with `GB`.

###### `options.warning`

When given, `warning` is invoked when an error is encountered
([`Function`][warning]).

###### Returns

[`Schema`][schema] — Parsed BCP 47 language tag.

###### Throws

When `tag` is `null` or `undefined`.

### `stringify(schema)`

Compile a [`schema`][schema] into a BCP 47 language tag.

###### Returns

`string` — BCP 47 language tag.

### `schema`

A schema may have the following properties.  A schema is deemed empty
when it has neither `language`, `irregular`, `regular`, nor `privateuse`
(where an empty `privateuse` array is handled as no `privateuse`, too).

###### `schema.language`

Two or three character [ISO 639][iso-639] language code, four character
reserved language code, or 5 to 8 (inclusive) characters registered
language subtag (`string`).  For example, `en` (English) or `cmn`
(Mandarin Chinese).

###### `schema.extendedLanguageSubtags`

Selected three-character [ISO 639][iso-639] codes(`Array.<string>`),
such as `yue` in `zh-yue-HK` (Chinese, Cantonese, as used in Hong Kong
SAR).

###### `schema.script`

Four character [ISO 15924][iso-15924] script code (`string`), such as
`Latn` in `hy-Latn-IT-arevela` (Eastern Armenian written in Latin
script, as used in Italy).

###### `schema.region`

Two alphabetical character [ISO 3166-1][iso-3166-1] code, or three
digit [UN M.49][un-m49] code (`string`).  For example, `CN` in
`cmn-Hans-CN` (Mandarin Chinese, Simplified script, as used in China).

###### `schema.variants`

5 to 8 (inclusive) character language variants (`Array.<string>`), such
as both `rozaj` and `biske` in `sl-rozaj-biske` (San Giorgio dialect
of Resian dialect of Slovenian).

###### `schema.extensions`

List of extensions (`Array.<Object>`), each an object containing a one
character `singleton`, and a list of `extensions` (`string`).
`singleton` cannot be `x` (case-insensitive), and `extensions` must be
between two and eight (inclusive) characters.  For example, an extension
would be `u-co-phonebk` in `de-DE-u-co-phonebk` (German, as used in
Germany, using German phonebook sort order), where `u` is the `singleton`
and `co` and `phonebk` are its extensions.

###### `schema.privateuse`

List of private-use subtags (`Array.<string>`), where each subtag must
be between one and eight (inclusive) characters.

###### `schema.regular`

One of the `regular` tags (`string`): tags which are seen as something
different by the algorithm.

Valid values are:

*   `art-lojban`
*   `cel-gaulish`
*   `no-bok`
*   `no-nyn`
*   `zh-guoyu`
*   `zh-hakka`
*   `zh-min`
*   `zh-min-nan`
*   `zh-xiang`

###### `schema.irregular`

One of the `irregular` tags (`string`): tags which are seen as
invalid by the algorithm).

Valid values are:

*   `en-GB-oed`
*   `i-ami`
*   `i-bnn`
*   `i-default`
*   `i-enochian`
*   `i-hak`
*   `i-klingon`
*   `i-lux`
*   `i-mingo`
*   `i-navajo`
*   `i-pwn`
*   `i-tao`
*   `i-tay`
*   `i-tsu`
*   `sgn-BE-FR`
*   `sgn-BE-NL`
*   `sgn-CH-DE`

### `function warning(reason, code, offset)`

Invoked when an error occurs.

###### Parameters

*   `reason` (`string`) — English reason for failure
*   `code` (`number`) — Code for failure
*   `offset` (`number`) — Index-based position of error

###### Warnings

| code | reason                                                                 |
| :--- | :--------------------------------------------------------------------- |
| 1    | Too long variant, expected at most 8 characters                        |
| 2    | Too long extension, expected at most 8 characters                      |
| 3    | Too many extended language subtags, expected at most 3 subtags         |
| 4    | Empty extension, extensions must have at least 2 characters of content |
| 5    | Too long private-use area, expected at most 8 characters               |
| 6    | Found superfluous content after tag                                    |

## Related

*   [`bcp-47-match`](https://github.com/wooorm/bcp-47-match)
    — Match BCP 47 language tags with language ranges per RFC 4647
*   [`bcp-47-normalize`](https://github.com/wooorm/bcp-47-normalize)
    — Normalize, canonicalize, and format BCP 47 tags
*   [`iso-3166`](https://github.com/wooorm/iso-3166)
    — ISO 3166 codes
*   [`iso-639-2`](https://github.com/wooorm/iso-639-2)
    — ISO 639-2 codes
*   [`iso-639-3`](https://github.com/wooorm/iso-639-3)
    — ISO 639-3 codes
*   [`iso-15924`](https://github.com/wooorm/iso-15924)
    — ISO 15924 codes
*   [`un-m49`](https://github.com/wooorm/un-m49)
    — UN M49 codes

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/wooorm/bcp-47/workflows/main/badge.svg

[build]: https://github.com/wooorm/bcp-47/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/wooorm/bcp-47.svg

[coverage]: https://codecov.io/github/wooorm/bcp-47

[downloads-badge]: https://img.shields.io/npm/dm/bcp-47.svg

[downloads]: https://www.npmjs.com/package/bcp-47

[size-badge]: https://img.shields.io/bundlephobia/minzip/bcp-47.svg

[size]: https://bundlephobia.com/result?p=bcp-47

[npm]: https://docs.npmjs.com/cli/install

[license]: license

[author]: https://wooorm.com

[spec]: https://tools.ietf.org/html/bcp47

[warning]: #function-warningreason-code-offset

[schema]: #schema

[iso-639]: https://en.wikipedia.org/wiki/ISO_639

[iso-15924]: https://en.wikipedia.org/wiki/ISO_15924

[iso-3166-1]: https://en.wikipedia.org/wiki/ISO_3166-1

[un-m49]: https://en.wikipedia.org/wiki/UN_M.49
