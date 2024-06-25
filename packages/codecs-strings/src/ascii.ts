import {
    combineCodec,
    createDecoder,
    createEncoder,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '@solana/codecs-core';
import { SOLANA_ERROR__CODECS__INVALID_ASCII_STRING, SolanaError } from '@solana/errors';

import { getUtf8Decoder, getUtf8Encoder } from './utf8';

export type AsciiCharacter =
    // eslint-disable-next-line @typescript-eslint/sort-type-constituents
    | '\u0000' // [NUL] null
    | '\u0001' // [SOH] start of heading
    | '\u0002' // [STX] start of text
    | '\u0003' // [ETX] end of text
    | '\u0004' // [EOT] end of transmission
    | '\u0005' // [ENQ] enquiry
    | '\u0006' // [ACK] acknowledge
    | '\u0007' // [BEL] bell
    | '\u0008' // [BS] backspace
    | '\u0009' // [TAB] horizontal tab
    | '\u000A' // [LF] NL line feed, new line
    | '\u000B' // [VT] vertical tab
    | '\u000C' // [FF] NP form feed, new page
    | '\u000D' // [CR] carriage return
    | '\u000E' // [SO] shift out
    | '\u000F' // [SI] shift in
    | '\u0010' // [DLE] data link escape
    | '\u0011' // [DC1] device control 1
    | '\u0012' // [DC2] device control 2
    | '\u0013' // [DC3] device control 3
    | '\u0014' // [DC4] device control 4
    | '\u0015' // [NAK] negative acknowledge
    | '\u0016' // [SYN] synchronous idle
    | '\u0017' // [ETB] end of trans. block
    | '\u0018' // [CAN] cancel
    | '\u0019' // [EM] end of medium
    | '\u001A' // [SUB] substitute
    | '\u001B' // [ESC] escape
    | '\u001C' // [FS] file separator
    | '\u001D' // [GS] group separator
    | '\u001E' // [RS] record separator
    | '\u001F' // [US] unit separator
    | '\u0020' // [SPACE]
    | '\u0021' // !
    | '\u0022' // "
    | '\u0023' // #
    | '\u0024' // $
    | '\u0025' // %
    | '\u0026' // &
    | '\u0027' // '
    | '\u0028' // (
    | '\u0029' // )
    | '\u002A' // *
    | '\u002B' // +
    | '\u002C' // ,
    | '\u002D' // -
    | '\u002E' // .
    | '\u002F' // /
    | '\u0030' // 0
    | '\u0031' // 1
    | '\u0032' // 2
    | '\u0033' // 3
    | '\u0034' // 4
    | '\u0035' // 5
    | '\u0036' // 6
    | '\u0037' // 7
    | '\u0038' // 8
    | '\u0039' // 9
    | '\u003A' // :
    | '\u003B' // ;
    | '\u003C' // <
    | '\u003D' // =
    | '\u003E' // >
    | '\u003F' // ?
    | '\u0040' // @
    | '\u0041' // A
    | '\u0042' // B
    | '\u0043' // C
    | '\u0044' // D
    | '\u0045' // E
    | '\u0046' // F
    | '\u0047' // G
    | '\u0048' // H
    | '\u0049' // I
    | '\u004A' // J
    | '\u004B' // K
    | '\u004C' // L
    | '\u004D' // M
    | '\u004E' // N
    | '\u004F' // O
    | '\u0050' // P
    | '\u0051' // Q
    | '\u0052' // R
    | '\u0053' // S
    | '\u0054' // T
    | '\u0055' // U
    | '\u0056' // V
    | '\u0057' // W
    | '\u0058' // X
    | '\u0059' // Y
    | '\u005A' // Z
    | '\u005B' // [
    | '\u005C' // \
    | '\u005D' // ]
    | '\u005E' // ^
    | '\u005F' // _
    | '\u0060' // `
    | '\u0061' // a
    | '\u0062' // b
    | '\u0063' // c
    | '\u0064' // d
    | '\u0065' // e
    | '\u0066' // f
    | '\u0067' // g
    | '\u0068' // h
    | '\u0069' // i
    | '\u006A' // j
    | '\u006B' // k
    | '\u006C' // l
    | '\u006D' // m
    | '\u006E' // n
    | '\u006F' // o
    | '\u0070' // p
    | '\u0071' // q
    | '\u0072' // r
    | '\u0073' // s
    | '\u0074' // t
    | '\u0075' // u
    | '\u0076' // v
    | '\u0077' // w
    | '\u0078' // x
    | '\u0079' // y
    | '\u007A' // z
    | '\u007B' // {
    | '\u007C' // |
    | '\u007D' // }
    | '\u007E' // ~
    | '\u007F'; // [DEL]

export type AsciiString = string & {
    readonly __brand: unique symbol;
    [Symbol.iterator]: () => IterableIterator<AsciiCharacter>;
};

type VerifyAsciiString<T extends string, A extends string = ''> = T extends `${infer F}${infer R}`
    ? F extends AsciiCharacter
        ? VerifyAsciiString<R, `${A}${F}`>
        : `${A}${AsciiCharacter}`
    : A;

export function ascii<T extends string>(
    putativeString: T extends VerifyAsciiString<T> ? T : VerifyAsciiString<T>,
): AsciiString {
    assertIsAsciiString(putativeString);
    return putativeString;
}

function assertIsAsciiString(putativeString: string): asserts putativeString is AsciiString {
    if ([...putativeString].some(c => c.charCodeAt(0) > 127)) {
        throw new SolanaError(SOLANA_ERROR__CODECS__INVALID_ASCII_STRING, { value: putativeString });
    }
}

/** Encodes ASCII strings by delegating to the UTF-8 Encoder. */
export const getAsciiEncoder = (): VariableSizeEncoder<AsciiString> => {
    const encoder = getUtf8Encoder();
    return createEncoder({
        ...encoder,
        write: (value: AsciiString, bytes, offset) => {
            assertIsAsciiString(value);
            return encoder.write(value, bytes, offset);
        },
    });
};

/** Decodes ASCII strings by delegating to the UTF-8 Decoder. */
export const getAsciiDecoder = (): VariableSizeDecoder<AsciiString> => {
    const decoder = getUtf8Decoder();
    return createDecoder({
        ...decoder,
        read: (bytes, offset) => {
            const [value, length] = decoder.read(bytes, offset);
            assertIsAsciiString(value);
            return [value, length];
        },
    });
};

/** Encodes and decodes ASCII strings by delegating to the UTF-8 Codec. */
export const getAsciiCodec = (): VariableSizeCodec<AsciiString> => combineCodec(getAsciiEncoder(), getAsciiDecoder());
