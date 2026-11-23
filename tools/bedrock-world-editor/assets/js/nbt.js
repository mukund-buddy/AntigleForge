/*
 * nbt.js — Minecraft NBT reader + writer (Bedrock little-endian & Java big-endian)
 * Pure browser code, no dependencies.
 *
 * Node shape:
 *   { type: <number>, name: <string>, value: <any> }
 *     compound  -> value: [node, ...]            (order preserved)
 *     list      -> value: { elemType, items: [{ type, value }, ...] }
 *     byteArray -> value: Uint8Array
 *     intArray  -> value: Int32Array
 *     longArray -> value: Array<BigInt>
 *     long      -> value: BigInt
 */
(function (global) {
  'use strict';

  var T = {
    END: 0, BYTE: 1, SHORT: 2, INT: 3, LONG: 4, FLOAT: 5, DOUBLE: 6,
    BYTE_ARRAY: 7, STRING: 8, LIST: 9, COMPOUND: 10, INT_ARRAY: 11, LONG_ARRAY: 12
  };

  var TYPE_NAMES = [
    'TAG_End', 'TAG_Byte', 'TAG_Short', 'TAG_Int', 'TAG_Long', 'TAG_Float',
    'TAG_Double', 'TAG_Byte_Array', 'TAG_String', 'TAG_List', 'TAG_Compound',
    'TAG_Int_Array', 'TAG_Long_Array'
  ];

  var encoder = new TextEncoder();
  var decoder = new TextDecoder('utf-8');

  /* ---------------------------------------------------------------- Reader */

  function Reader(bytes, offset, little) {
    this.bytes = bytes;
    this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    this.pos = offset || 0;
    this.le = !!little;
  }

  Reader.prototype.fail = function (what) {
    throw new Error('NBT: ' + what + ' at byte ' + this.pos);
  };

  Reader.prototype.need = function (n) {
    if (this.pos + n > this.bytes.length) {
      this.fail('unexpected end of data (need ' + n + ', have ' + (this.bytes.length - this.pos) + ')');
    }
  };

  Reader.prototype.u8 = function () { this.need(1); return this.view.getUint8(this.pos++); };
  Reader.prototype.i8 = function () { this.need(1); return this.view.getInt8(this.pos++); };
  Reader.prototype.i16 = function () { this.need(2); var v = this.view.getInt16(this.pos, this.le); this.pos += 2; return v; };
  Reader.prototype.u16 = function () { this.need(2); var v = this.view.getUint16(this.pos, this.le); this.pos += 2; return v; };
  Reader.prototype.i32 = function () { this.need(4); var v = this.view.getInt32(this.pos, this.le); this.pos += 4; return v; };
  Reader.prototype.i64 = function () { this.need(8); var v = this.view.getBigInt64(this.pos, this.le); this.pos += 8; return v; };
  Reader.prototype.f32 = function () { this.need(4); var v = this.view.getFloat32(this.pos, this.le); this.pos += 4; return v; };
  Reader.prototype.f64 = function () { this.need(8); var v = this.view.getFloat64(this.pos, this.le); this.pos += 8; return v; };

  Reader.prototype.str = function () {
    var len = this.u16();
    this.need(len);
    var s = decoder.decode(this.bytes.subarray(this.pos, this.pos + len));
    this.pos += len;
    return s;
  };

  function readPayload(r, type) {
    switch (type) {
      case T.BYTE: return r.i8();
      case T.SHORT: return r.i16();
      case T.INT: return r.i32();
      case T.LONG: return r.i64();
      case T.FLOAT: return r.f32();
      case T.DOUBLE: return r.f64();
      case T.BYTE_ARRAY: {
        var bl = r.i32();
        if (bl < 0) r.fail('negative byte-array length');
        r.need(bl);
        var ba = r.bytes.slice(r.pos, r.pos + bl);
        r.pos += bl;
        return ba;
      }
      case T.STRING: return r.str();
      case T.LIST: {
        var elemType = r.u8();
        var n = r.i32();
        if (n < 0) r.fail('negative list length');
        // Guard against corrupt/hostile files asking for a huge allocation.
        if (n > 100000000) r.fail('list too large (' + n + ')');
        var items = new Array(n);
        for (var i = 0; i < n; i++) {
          items[i] = { type: elemType, value: elemType === T.END ? null : readPayload(r, elemType) };
        }
        return { elemType: elemType, items: items };
      }
      case T.COMPOUND: {
        var out = [];
        for (;;) {
          var t = r.u8();
          if (t === T.END) break;
          if (t < 1 || t > 12) r.fail('unknown tag type ' + t);
          var name = r.str();
          out.push({ type: t, name: name, value: readPayload(r, t) });
        }
        return out;
      }
      case T.INT_ARRAY: {
        var il = r.i32();
        if (il < 0 || il > 50000000) r.fail('bad int-array length');
        r.need(il * 4);
        var ia = new Int32Array(il);
        for (var j = 0; j < il; j++) { ia[j] = r.view.getInt32(r.pos, r.le); r.pos += 4; }
        return ia;
      }
      case T.LONG_ARRAY: {
        var ll = r.i32();
        if (ll < 0 || ll > 20000000) r.fail('bad long-array length');
        r.need(ll * 8);
        var la = new Array(ll);
        for (var k = 0; k < ll; k++) { la[k] = r.view.getBigInt64(r.pos, r.le); r.pos += 8; }
        return la;
      }
      default:
        r.fail('unsupported tag type ' + type);
    }
  }

  /**
   * Parse a named tag (root).
   * @returns {{ root: object, endian: 'little'|'big', consumed: number }}
   */
  function parse(bytes, options) {
    options = options || {};
    var little = options.littleEndian !== false;
    var r = new Reader(bytes, options.offset || 0, little);
    var type = r.u8();
    if (type !== T.COMPOUND && type !== T.LIST) {
      throw new Error('NBT: root tag is ' + (TYPE_NAMES[type] || type) + ', expected TAG_Compound');
    }
    var name = r.str();
    var root = { type: type, name: name, value: readPayload(r, type) };
    return { root: root, endian: little ? 'little' : 'big', consumed: r.pos - (options.offset || 0) };
  }

  /**
   * Try both byte orders and keep the parse that consumes the whole buffer.
   * `prefer` picks the winner when both look plausible.
   */
  function parseAuto(bytes, offset, prefer) {
    var order = prefer === 'big' ? [false, true] : [true, false];
    var best = null;
    var errors = [];
    for (var i = 0; i < order.length; i++) {
      try {
        var res = parse(bytes, { littleEndian: order[i], offset: offset || 0 });
        res.endian = order[i] ? 'little' : 'big';
        res.trailing = bytes.length - (offset || 0) - res.consumed;
        if (!best || (Math.abs(res.trailing) < Math.abs(best.trailing))) best = res;
        if (res.trailing === 0) return res;
      } catch (err) {
        errors.push(err.message);
      }
    }
    if (best) return best;
    throw new Error(errors[0] || 'NBT: could not parse this file');
  }

  /* ---------------------------------------------------------------- Writer */

  function payloadSize(type, value) {
    switch (type) {
      case T.BYTE: return 1;
      case T.SHORT: return 2;
      case T.INT: return 4;
      case T.LONG: return 8;
      case T.FLOAT: return 4;
      case T.DOUBLE: return 8;
      case T.STRING: return 2 + encoder.encode(String(value == null ? '' : value)).length;
      case T.BYTE_ARRAY: return 4 + (value ? value.length : 0);
      case T.INT_ARRAY: return 4 + (value ? value.length * 4 : 0);
      case T.LONG_ARRAY: return 4 + (value ? value.length * 8 : 0);
      case T.LIST: {
        var items = (value && value.items) || [];
        var elemType = value && value.elemType != null ? value.elemType : (items.length ? items[0].type : T.END);
        var size = 5;
        for (var i = 0; i < items.length; i++) size += payloadSize(elemType, items[i].value);
        return size;
      }
      case T.COMPOUND: {
        var size = 1; // TAG_End
        var kids = value || [];
        for (var j = 0; j < kids.length; j++) {
          size += 1 + 2 + encoder.encode(kids[j].name || '').length + payloadSize(kids[j].type, kids[j].value);
        }
        return size;
      }
      default:
        throw new Error('NBT: cannot size tag type ' + type);
    }
  }

  function Writer(size, little) {
    this.buf = new Uint8Array(size);
    this.view = new DataView(this.buf.buffer);
    this.pos = 0;
    this.le = !!little;
  }

  Writer.prototype.u8 = function (v) { this.view.setUint8(this.pos, v & 0xff); this.pos += 1; };
  Writer.prototype.i8 = function (v) { this.view.setInt8(this.pos, clampInt(v, -128, 127)); this.pos += 1; };
  Writer.prototype.i16 = function (v) { this.view.setInt16(this.pos, clampInt(v, -32768, 32767), this.le); this.pos += 2; };
  Writer.prototype.i32 = function (v) { this.view.setInt32(this.pos, clampInt(v, -2147483648, 2147483647), this.le); this.pos += 4; };
  Writer.prototype.i64 = function (v) { this.view.setBigInt64(this.pos, toBigInt(v), this.le); this.pos += 8; };
  Writer.prototype.f32 = function (v) { this.view.setFloat32(this.pos, Number(v) || 0, this.le); this.pos += 4; };
  Writer.prototype.f64 = function (v) { this.view.setFloat64(this.pos, Number(v) || 0, this.le); this.pos += 8; };

  Writer.prototype.str = function (v) {
    var bytes = encoder.encode(String(v == null ? '' : v));
    if (bytes.length > 65535) throw new Error('NBT: string longer than 65535 bytes');
    this.view.setUint16(this.pos, bytes.length, this.le);
    this.pos += 2;
    this.buf.set(bytes, this.pos);
    this.pos += bytes.length;
  };

  function clampInt(v, min, max) {
    var n = typeof v === 'bigint' ? Number(v) : Number(v);
    if (!isFinite(n)) n = 0;
    n = Math.trunc(n);
    if (n < min) return min;
    if (n > max) return max;
    return n;
  }

  function toBigInt(v) {
    if (typeof v === 'bigint') return v;
    if (typeof v === 'string') {
      var s = v.trim();
      try { return BigInt(s === '' ? 0 : s); } catch (e) { return 0n; }
    }
    if (!isFinite(v)) return 0n;
    return BigInt(Math.trunc(v));
  }

  function writePayload(w, type, value) {
    switch (type) {
      case T.BYTE: w.i8(value); break;
      case T.SHORT: w.i16(value); break;
      case T.INT: w.i32(value); break;
      case T.LONG: w.i64(value); break;
      case T.FLOAT: w.f32(value); break;
      case T.DOUBLE: w.f64(value); break;
      case T.STRING: w.str(value); break;
      case T.BYTE_ARRAY: {
        var ba = value || new Uint8Array(0);
        w.i32(ba.length);
        w.buf.set(ba, w.pos);
        w.pos += ba.length;
        break;
      }
      case T.INT_ARRAY: {
        var ia = value || [];
        w.i32(ia.length);
        for (var i = 0; i < ia.length; i++) w.i32(ia[i]);
        break;
      }
      case T.LONG_ARRAY: {
        var la = value || [];
        w.i32(la.length);
        for (var j = 0; j < la.length; j++) w.i64(la[j]);
        break;
      }
      case T.LIST: {
        var items = (value && value.items) || [];
        var elemType = value && value.elemType != null ? value.elemType : (items.length ? items[0].type : T.END);
        w.u8(elemType);
        w.i32(items.length);
        for (var k = 0; k < items.length; k++) {
          if (elemType !== T.END) writePayload(w, elemType, items[k].value);
        }
        break;
      }
      case T.COMPOUND: {
        var kids = value || [];
        for (var m = 0; m < kids.length; m++) {
          var kid = kids[m];
          if (!kid || kid.type === T.END) continue;
          w.u8(kid.type);
          w.str(kid.name || '');
          writePayload(w, kid.type, kid.value);
        }
        w.u8(T.END);
        break;
      }
      default:
        throw new Error('NBT: cannot write tag type ' + type);
    }
  }

  function serialize(root, options) {
    options = options || {};
    var little = options.littleEndian !== false;
    var name = options.rootName != null ? options.rootName : (root.name || '');
    if (root.type !== T.COMPOUND && root.type !== T.LIST) {
      throw new Error('NBT: root must be a compound');
    }
    var size = 1 + 2 + encoder.encode(name).length + payloadSize(root.type, root.value);
    var w = new Writer(size, little);
    w.u8(root.type);
    w.str(name);
    writePayload(w, root.type, root.value);
    return w.buf;
  }

  /* --------------------------------------------------------------- Helpers */

  function typeName(type) { return TYPE_NAMES[type] || ('TAG_' + type); }

  function isNumericType(type) { return type >= T.BYTE && type <= T.DOUBLE; }

  function findChild(compound, name) {
    var kids = compound && compound.value;
    if (!kids) return null;
    for (var i = 0; i < kids.length; i++) if (kids[i].name === name) return kids[i];
    return null;
  }

  function getPath(root, path) {
    var parts = Array.isArray(path) ? path : String(path).split('/');
    var node = root;
    for (var i = 0; i < parts.length; i++) {
      if (!node) return null;
      if (node.type === T.COMPOUND) node = findChild(node, parts[i]);
      else if (node.type === T.LIST) node = node.value.items[Number(parts[i])] || null;
      else return null;
    }
    return node;
  }

  function parseValueInput(type, raw) {
    switch (type) {
      case T.BYTE:
      case T.SHORT:
      case T.INT:
        var n = Number(String(raw).trim());
        if (!isFinite(n)) throw new Error('"' + raw + '" is not a whole number');
        return Math.trunc(n);
      case T.LONG:
        try { return BigInt(String(raw).trim() || '0'); }
        catch (e) { throw new Error('"' + raw + '" is not a valid 64-bit integer'); }
      case T.FLOAT:
      case T.DOUBLE:
        var f = Number(String(raw).trim());
        if (!isFinite(f)) throw new Error('"' + raw + '" is not a number');
        return f;
      case T.STRING:
        return String(raw);
      case T.BYTE_ARRAY: {
        // Accept "1 2 3" or comma separated numbers.
        var nums = String(raw).split(/[,\s]+/).filter(Boolean).map(Number);
        return Uint8Array.from(nums.map(function (x) { return x & 0xff; }));
      }
      case T.INT_ARRAY: {
        var nums2 = String(raw).split(/[,\s]+/).filter(Boolean).map(Number);
        return Int32Array.from(nums2);
      }
      case T.LONG_ARRAY: {
        return String(raw).split(/[,\s]+/).filter(Boolean).map(function (x) { return BigInt(x.trim()); });
      }
      default:
        return raw;
    }
  }

  function valueToText(node) {
    if (!node) return '';
    var v = node.value;
    switch (node.type) {
      case T.BYTE: return String(v);
      case T.SHORT:
      case T.INT: return String(v);
      case T.LONG: return String(v);
      case T.FLOAT:
      case T.DOUBLE: return String(v);
      case T.STRING: return String(v);
      case T.BYTE_ARRAY: return Array.prototype.join.call(v, ' ');
      case T.INT_ARRAY: return Array.prototype.join.call(v, ' ');
      case T.LONG_ARRAY: return v.map(String).join(' ');
      default: return '';
    }
  }

  var api = {
    T: T,
    TYPE_NAMES: TYPE_NAMES,
    parse: parse,
    parseAuto: parseAuto,
    serialize: serialize,
    typeName: typeName,
    isNumericType: isNumericType,
    findChild: findChild,
    getPath: getPath,
    parseValueInput: parseValueInput,
    valueToText: valueToText
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.NBT = api;
})(typeof window !== 'undefined' ? window : globalThis);
