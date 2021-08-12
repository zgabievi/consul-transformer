var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[Object.keys(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// node_modules/@sveltejs/kit/dist/install-fetch.js
function dataUriToBuffer(uri) {
  if (!/^data:/i.test(uri)) {
    throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
  }
  uri = uri.replace(/\r?\n/g, "");
  const firstComma = uri.indexOf(",");
  if (firstComma === -1 || firstComma <= 4) {
    throw new TypeError("malformed data: URI");
  }
  const meta = uri.substring(5, firstComma).split(";");
  let charset = "";
  let base64 = false;
  const type = meta[0] || "text/plain";
  let typeFull = type;
  for (let i = 1; i < meta.length; i++) {
    if (meta[i] === "base64") {
      base64 = true;
    } else {
      typeFull += `;${meta[i]}`;
      if (meta[i].indexOf("charset=") === 0) {
        charset = meta[i].substring(8);
      }
    }
  }
  if (!meta[0] && !charset.length) {
    typeFull += ";charset=US-ASCII";
    charset = "US-ASCII";
  }
  const encoding = base64 ? "base64" : "ascii";
  const data = unescape(uri.substring(firstComma + 1));
  const buffer = Buffer.from(data, encoding);
  buffer.type = type;
  buffer.typeFull = typeFull;
  buffer.charset = charset;
  return buffer;
}
async function* read(parts) {
  for (const part of parts) {
    if ("stream" in part) {
      yield* part.stream();
    } else {
      yield part;
    }
  }
}
function isFormData(object) {
  return typeof object === "object" && typeof object.append === "function" && typeof object.set === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.delete === "function" && typeof object.keys === "function" && typeof object.values === "function" && typeof object.entries === "function" && typeof object.constructor === "function" && object[NAME] === "FormData";
}
function getHeader(boundary, name, field) {
  let header = "";
  header += `${dashes}${boundary}${carriage}`;
  header += `Content-Disposition: form-data; name="${name}"`;
  if (isBlob(field)) {
    header += `; filename="${field.name}"${carriage}`;
    header += `Content-Type: ${field.type || "application/octet-stream"}`;
  }
  return `${header}${carriage.repeat(2)}`;
}
async function* formDataIterator(form, boundary) {
  for (const [name, value] of form) {
    yield getHeader(boundary, name, value);
    if (isBlob(value)) {
      yield* value.stream();
    } else {
      yield value;
    }
    yield carriage;
  }
  yield getFooter(boundary);
}
function getFormDataLength(form, boundary) {
  let length = 0;
  for (const [name, value] of form) {
    length += Buffer.byteLength(getHeader(boundary, name, value));
    if (isBlob(value)) {
      length += value.size;
    } else {
      length += Buffer.byteLength(String(value));
    }
    length += carriageLength;
  }
  length += Buffer.byteLength(getFooter(boundary));
  return length;
}
async function consumeBody(data) {
  if (data[INTERNALS$2].disturbed) {
    throw new TypeError(`body used already for: ${data.url}`);
  }
  data[INTERNALS$2].disturbed = true;
  if (data[INTERNALS$2].error) {
    throw data[INTERNALS$2].error;
  }
  let { body } = data;
  if (body === null) {
    return Buffer.alloc(0);
  }
  if (isBlob(body)) {
    body = body.stream();
  }
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (!(body instanceof import_stream.default)) {
    return Buffer.alloc(0);
  }
  const accum = [];
  let accumBytes = 0;
  try {
    for await (const chunk of body) {
      if (data.size > 0 && accumBytes + chunk.length > data.size) {
        const err = new FetchError(`content size at ${data.url} over limit: ${data.size}`, "max-size");
        body.destroy(err);
        throw err;
      }
      accumBytes += chunk.length;
      accum.push(chunk);
    }
  } catch (error3) {
    if (error3 instanceof FetchBaseError) {
      throw error3;
    } else {
      throw new FetchError(`Invalid response body while trying to fetch ${data.url}: ${error3.message}`, "system", error3);
    }
  }
  if (body.readableEnded === true || body._readableState.ended === true) {
    try {
      if (accum.every((c) => typeof c === "string")) {
        return Buffer.from(accum.join(""));
      }
      return Buffer.concat(accum, accumBytes);
    } catch (error3) {
      throw new FetchError(`Could not create Buffer from response body for ${data.url}: ${error3.message}`, "system", error3);
    }
  } else {
    throw new FetchError(`Premature close of server response while trying to fetch ${data.url}`);
  }
}
function fromRawHeaders(headers = []) {
  return new Headers(headers.reduce((result, value, index2, array) => {
    if (index2 % 2 === 0) {
      result.push(array.slice(index2, index2 + 2));
    }
    return result;
  }, []).filter(([name, value]) => {
    try {
      validateHeaderName(name);
      validateHeaderValue(name, String(value));
      return true;
    } catch {
      return false;
    }
  }));
}
async function fetch(url, options_) {
  return new Promise((resolve2, reject) => {
    const request = new Request(url, options_);
    const options2 = getNodeRequestOptions(request);
    if (!supportedSchemas.has(options2.protocol)) {
      throw new TypeError(`node-fetch cannot load ${url}. URL scheme "${options2.protocol.replace(/:$/, "")}" is not supported.`);
    }
    if (options2.protocol === "data:") {
      const data = dataUriToBuffer$1(request.url);
      const response2 = new Response(data, { headers: { "Content-Type": data.typeFull } });
      resolve2(response2);
      return;
    }
    const send = (options2.protocol === "https:" ? import_https.default : import_http.default).request;
    const { signal } = request;
    let response = null;
    const abort = () => {
      const error3 = new AbortError("The operation was aborted.");
      reject(error3);
      if (request.body && request.body instanceof import_stream.default.Readable) {
        request.body.destroy(error3);
      }
      if (!response || !response.body) {
        return;
      }
      response.body.emit("error", error3);
    };
    if (signal && signal.aborted) {
      abort();
      return;
    }
    const abortAndFinalize = () => {
      abort();
      finalize();
    };
    const request_ = send(options2);
    if (signal) {
      signal.addEventListener("abort", abortAndFinalize);
    }
    const finalize = () => {
      request_.abort();
      if (signal) {
        signal.removeEventListener("abort", abortAndFinalize);
      }
    };
    request_.on("error", (err) => {
      reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, "system", err));
      finalize();
    });
    request_.on("response", (response_) => {
      request_.setTimeout(0);
      const headers = fromRawHeaders(response_.rawHeaders);
      if (isRedirect(response_.statusCode)) {
        const location = headers.get("Location");
        const locationURL = location === null ? null : new URL(location, request.url);
        switch (request.redirect) {
          case "error":
            reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, "no-redirect"));
            finalize();
            return;
          case "manual":
            if (locationURL !== null) {
              try {
                headers.set("Location", locationURL);
              } catch (error3) {
                reject(error3);
              }
            }
            break;
          case "follow": {
            if (locationURL === null) {
              break;
            }
            if (request.counter >= request.follow) {
              reject(new FetchError(`maximum redirect reached at: ${request.url}`, "max-redirect"));
              finalize();
              return;
            }
            const requestOptions = {
              headers: new Headers(request.headers),
              follow: request.follow,
              counter: request.counter + 1,
              agent: request.agent,
              compress: request.compress,
              method: request.method,
              body: request.body,
              signal: request.signal,
              size: request.size
            };
            if (response_.statusCode !== 303 && request.body && options_.body instanceof import_stream.default.Readable) {
              reject(new FetchError("Cannot follow redirect with body being a readable stream", "unsupported-redirect"));
              finalize();
              return;
            }
            if (response_.statusCode === 303 || (response_.statusCode === 301 || response_.statusCode === 302) && request.method === "POST") {
              requestOptions.method = "GET";
              requestOptions.body = void 0;
              requestOptions.headers.delete("content-length");
            }
            resolve2(fetch(new Request(locationURL, requestOptions)));
            finalize();
            return;
          }
        }
      }
      response_.once("end", () => {
        if (signal) {
          signal.removeEventListener("abort", abortAndFinalize);
        }
      });
      let body = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), (error3) => {
        reject(error3);
      });
      if (process.version < "v12.10") {
        response_.on("aborted", abortAndFinalize);
      }
      const responseOptions = {
        url: request.url,
        status: response_.statusCode,
        statusText: response_.statusMessage,
        headers,
        size: request.size,
        counter: request.counter,
        highWaterMark: request.highWaterMark
      };
      const codings = headers.get("Content-Encoding");
      if (!request.compress || request.method === "HEAD" || codings === null || response_.statusCode === 204 || response_.statusCode === 304) {
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      const zlibOptions = {
        flush: import_zlib.default.Z_SYNC_FLUSH,
        finishFlush: import_zlib.default.Z_SYNC_FLUSH
      };
      if (codings === "gzip" || codings === "x-gzip") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createGunzip(zlibOptions), (error3) => {
          reject(error3);
        });
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      if (codings === "deflate" || codings === "x-deflate") {
        const raw = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), (error3) => {
          reject(error3);
        });
        raw.once("data", (chunk) => {
          if ((chunk[0] & 15) === 8) {
            body = (0, import_stream.pipeline)(body, import_zlib.default.createInflate(), (error3) => {
              reject(error3);
            });
          } else {
            body = (0, import_stream.pipeline)(body, import_zlib.default.createInflateRaw(), (error3) => {
              reject(error3);
            });
          }
          response = new Response(body, responseOptions);
          resolve2(response);
        });
        return;
      }
      if (codings === "br") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createBrotliDecompress(), (error3) => {
          reject(error3);
        });
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      response = new Response(body, responseOptions);
      resolve2(response);
    });
    writeToStream(request_, request);
  });
}
var import_http, import_https, import_zlib, import_stream, import_util, import_crypto, import_url, src, dataUriToBuffer$1, Readable, wm, Blob, fetchBlob, Blob$1, FetchBaseError, FetchError, NAME, isURLSearchParameters, isBlob, isAbortSignal, carriage, dashes, carriageLength, getFooter, getBoundary, INTERNALS$2, Body, clone, extractContentType, getTotalBytes, writeToStream, validateHeaderName, validateHeaderValue, Headers, redirectStatus, isRedirect, INTERNALS$1, Response, getSearch, INTERNALS, isRequest, Request, getNodeRequestOptions, AbortError, supportedSchemas;
var init_install_fetch = __esm({
  "node_modules/@sveltejs/kit/dist/install-fetch.js"() {
    init_shims();
    import_http = __toModule(require("http"));
    import_https = __toModule(require("https"));
    import_zlib = __toModule(require("zlib"));
    import_stream = __toModule(require("stream"));
    import_util = __toModule(require("util"));
    import_crypto = __toModule(require("crypto"));
    import_url = __toModule(require("url"));
    src = dataUriToBuffer;
    dataUriToBuffer$1 = src;
    ({ Readable } = import_stream.default);
    wm = new WeakMap();
    Blob = class {
      constructor(blobParts = [], options2 = {}) {
        let size = 0;
        const parts = blobParts.map((element) => {
          let buffer;
          if (element instanceof Buffer) {
            buffer = element;
          } else if (ArrayBuffer.isView(element)) {
            buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
          } else if (element instanceof ArrayBuffer) {
            buffer = Buffer.from(element);
          } else if (element instanceof Blob) {
            buffer = element;
          } else {
            buffer = Buffer.from(typeof element === "string" ? element : String(element));
          }
          size += buffer.length || buffer.size || 0;
          return buffer;
        });
        const type = options2.type === void 0 ? "" : String(options2.type).toLowerCase();
        wm.set(this, {
          type: /[^\u0020-\u007E]/.test(type) ? "" : type,
          size,
          parts
        });
      }
      get size() {
        return wm.get(this).size;
      }
      get type() {
        return wm.get(this).type;
      }
      async text() {
        return Buffer.from(await this.arrayBuffer()).toString();
      }
      async arrayBuffer() {
        const data = new Uint8Array(this.size);
        let offset = 0;
        for await (const chunk of this.stream()) {
          data.set(chunk, offset);
          offset += chunk.length;
        }
        return data.buffer;
      }
      stream() {
        return Readable.from(read(wm.get(this).parts));
      }
      slice(start = 0, end = this.size, type = "") {
        const { size } = this;
        let relativeStart = start < 0 ? Math.max(size + start, 0) : Math.min(start, size);
        let relativeEnd = end < 0 ? Math.max(size + end, 0) : Math.min(end, size);
        const span = Math.max(relativeEnd - relativeStart, 0);
        const parts = wm.get(this).parts.values();
        const blobParts = [];
        let added = 0;
        for (const part of parts) {
          const size2 = ArrayBuffer.isView(part) ? part.byteLength : part.size;
          if (relativeStart && size2 <= relativeStart) {
            relativeStart -= size2;
            relativeEnd -= size2;
          } else {
            const chunk = part.slice(relativeStart, Math.min(size2, relativeEnd));
            blobParts.push(chunk);
            added += ArrayBuffer.isView(chunk) ? chunk.byteLength : chunk.size;
            relativeStart = 0;
            if (added >= span) {
              break;
            }
          }
        }
        const blob = new Blob([], { type: String(type).toLowerCase() });
        Object.assign(wm.get(blob), { size: span, parts: blobParts });
        return blob;
      }
      get [Symbol.toStringTag]() {
        return "Blob";
      }
      static [Symbol.hasInstance](object) {
        return object && typeof object === "object" && typeof object.stream === "function" && object.stream.length === 0 && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[Symbol.toStringTag]);
      }
    };
    Object.defineProperties(Blob.prototype, {
      size: { enumerable: true },
      type: { enumerable: true },
      slice: { enumerable: true }
    });
    fetchBlob = Blob;
    Blob$1 = fetchBlob;
    FetchBaseError = class extends Error {
      constructor(message, type) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.type = type;
      }
      get name() {
        return this.constructor.name;
      }
      get [Symbol.toStringTag]() {
        return this.constructor.name;
      }
    };
    FetchError = class extends FetchBaseError {
      constructor(message, type, systemError) {
        super(message, type);
        if (systemError) {
          this.code = this.errno = systemError.code;
          this.erroredSysCall = systemError.syscall;
        }
      }
    };
    NAME = Symbol.toStringTag;
    isURLSearchParameters = (object) => {
      return typeof object === "object" && typeof object.append === "function" && typeof object.delete === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.has === "function" && typeof object.set === "function" && typeof object.sort === "function" && object[NAME] === "URLSearchParams";
    };
    isBlob = (object) => {
      return typeof object === "object" && typeof object.arrayBuffer === "function" && typeof object.type === "string" && typeof object.stream === "function" && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[NAME]);
    };
    isAbortSignal = (object) => {
      return typeof object === "object" && object[NAME] === "AbortSignal";
    };
    carriage = "\r\n";
    dashes = "-".repeat(2);
    carriageLength = Buffer.byteLength(carriage);
    getFooter = (boundary) => `${dashes}${boundary}${dashes}${carriage.repeat(2)}`;
    getBoundary = () => (0, import_crypto.randomBytes)(8).toString("hex");
    INTERNALS$2 = Symbol("Body internals");
    Body = class {
      constructor(body, {
        size = 0
      } = {}) {
        let boundary = null;
        if (body === null) {
          body = null;
        } else if (isURLSearchParameters(body)) {
          body = Buffer.from(body.toString());
        } else if (isBlob(body))
          ;
        else if (Buffer.isBuffer(body))
          ;
        else if (import_util.types.isAnyArrayBuffer(body)) {
          body = Buffer.from(body);
        } else if (ArrayBuffer.isView(body)) {
          body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
        } else if (body instanceof import_stream.default)
          ;
        else if (isFormData(body)) {
          boundary = `NodeFetchFormDataBoundary${getBoundary()}`;
          body = import_stream.default.Readable.from(formDataIterator(body, boundary));
        } else {
          body = Buffer.from(String(body));
        }
        this[INTERNALS$2] = {
          body,
          boundary,
          disturbed: false,
          error: null
        };
        this.size = size;
        if (body instanceof import_stream.default) {
          body.on("error", (err) => {
            const error3 = err instanceof FetchBaseError ? err : new FetchError(`Invalid response body while trying to fetch ${this.url}: ${err.message}`, "system", err);
            this[INTERNALS$2].error = error3;
          });
        }
      }
      get body() {
        return this[INTERNALS$2].body;
      }
      get bodyUsed() {
        return this[INTERNALS$2].disturbed;
      }
      async arrayBuffer() {
        const { buffer, byteOffset, byteLength } = await consumeBody(this);
        return buffer.slice(byteOffset, byteOffset + byteLength);
      }
      async blob() {
        const ct = this.headers && this.headers.get("content-type") || this[INTERNALS$2].body && this[INTERNALS$2].body.type || "";
        const buf = await this.buffer();
        return new Blob$1([buf], {
          type: ct
        });
      }
      async json() {
        const buffer = await consumeBody(this);
        return JSON.parse(buffer.toString());
      }
      async text() {
        const buffer = await consumeBody(this);
        return buffer.toString();
      }
      buffer() {
        return consumeBody(this);
      }
    };
    Object.defineProperties(Body.prototype, {
      body: { enumerable: true },
      bodyUsed: { enumerable: true },
      arrayBuffer: { enumerable: true },
      blob: { enumerable: true },
      json: { enumerable: true },
      text: { enumerable: true }
    });
    clone = (instance, highWaterMark) => {
      let p1;
      let p2;
      let { body } = instance;
      if (instance.bodyUsed) {
        throw new Error("cannot clone body after it is used");
      }
      if (body instanceof import_stream.default && typeof body.getBoundary !== "function") {
        p1 = new import_stream.PassThrough({ highWaterMark });
        p2 = new import_stream.PassThrough({ highWaterMark });
        body.pipe(p1);
        body.pipe(p2);
        instance[INTERNALS$2].body = p1;
        body = p2;
      }
      return body;
    };
    extractContentType = (body, request) => {
      if (body === null) {
        return null;
      }
      if (typeof body === "string") {
        return "text/plain;charset=UTF-8";
      }
      if (isURLSearchParameters(body)) {
        return "application/x-www-form-urlencoded;charset=UTF-8";
      }
      if (isBlob(body)) {
        return body.type || null;
      }
      if (Buffer.isBuffer(body) || import_util.types.isAnyArrayBuffer(body) || ArrayBuffer.isView(body)) {
        return null;
      }
      if (body && typeof body.getBoundary === "function") {
        return `multipart/form-data;boundary=${body.getBoundary()}`;
      }
      if (isFormData(body)) {
        return `multipart/form-data; boundary=${request[INTERNALS$2].boundary}`;
      }
      if (body instanceof import_stream.default) {
        return null;
      }
      return "text/plain;charset=UTF-8";
    };
    getTotalBytes = (request) => {
      const { body } = request;
      if (body === null) {
        return 0;
      }
      if (isBlob(body)) {
        return body.size;
      }
      if (Buffer.isBuffer(body)) {
        return body.length;
      }
      if (body && typeof body.getLengthSync === "function") {
        return body.hasKnownLength && body.hasKnownLength() ? body.getLengthSync() : null;
      }
      if (isFormData(body)) {
        return getFormDataLength(request[INTERNALS$2].boundary);
      }
      return null;
    };
    writeToStream = (dest, { body }) => {
      if (body === null) {
        dest.end();
      } else if (isBlob(body)) {
        body.stream().pipe(dest);
      } else if (Buffer.isBuffer(body)) {
        dest.write(body);
        dest.end();
      } else {
        body.pipe(dest);
      }
    };
    validateHeaderName = typeof import_http.default.validateHeaderName === "function" ? import_http.default.validateHeaderName : (name) => {
      if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name)) {
        const err = new TypeError(`Header name must be a valid HTTP token [${name}]`);
        Object.defineProperty(err, "code", { value: "ERR_INVALID_HTTP_TOKEN" });
        throw err;
      }
    };
    validateHeaderValue = typeof import_http.default.validateHeaderValue === "function" ? import_http.default.validateHeaderValue : (name, value) => {
      if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
        const err = new TypeError(`Invalid character in header content ["${name}"]`);
        Object.defineProperty(err, "code", { value: "ERR_INVALID_CHAR" });
        throw err;
      }
    };
    Headers = class extends URLSearchParams {
      constructor(init2) {
        let result = [];
        if (init2 instanceof Headers) {
          const raw = init2.raw();
          for (const [name, values] of Object.entries(raw)) {
            result.push(...values.map((value) => [name, value]));
          }
        } else if (init2 == null)
          ;
        else if (typeof init2 === "object" && !import_util.types.isBoxedPrimitive(init2)) {
          const method = init2[Symbol.iterator];
          if (method == null) {
            result.push(...Object.entries(init2));
          } else {
            if (typeof method !== "function") {
              throw new TypeError("Header pairs must be iterable");
            }
            result = [...init2].map((pair) => {
              if (typeof pair !== "object" || import_util.types.isBoxedPrimitive(pair)) {
                throw new TypeError("Each header pair must be an iterable object");
              }
              return [...pair];
            }).map((pair) => {
              if (pair.length !== 2) {
                throw new TypeError("Each header pair must be a name/value tuple");
              }
              return [...pair];
            });
          }
        } else {
          throw new TypeError("Failed to construct 'Headers': The provided value is not of type '(sequence<sequence<ByteString>> or record<ByteString, ByteString>)");
        }
        result = result.length > 0 ? result.map(([name, value]) => {
          validateHeaderName(name);
          validateHeaderValue(name, String(value));
          return [String(name).toLowerCase(), String(value)];
        }) : void 0;
        super(result);
        return new Proxy(this, {
          get(target, p, receiver) {
            switch (p) {
              case "append":
              case "set":
                return (name, value) => {
                  validateHeaderName(name);
                  validateHeaderValue(name, String(value));
                  return URLSearchParams.prototype[p].call(receiver, String(name).toLowerCase(), String(value));
                };
              case "delete":
              case "has":
              case "getAll":
                return (name) => {
                  validateHeaderName(name);
                  return URLSearchParams.prototype[p].call(receiver, String(name).toLowerCase());
                };
              case "keys":
                return () => {
                  target.sort();
                  return new Set(URLSearchParams.prototype.keys.call(target)).keys();
                };
              default:
                return Reflect.get(target, p, receiver);
            }
          }
        });
      }
      get [Symbol.toStringTag]() {
        return this.constructor.name;
      }
      toString() {
        return Object.prototype.toString.call(this);
      }
      get(name) {
        const values = this.getAll(name);
        if (values.length === 0) {
          return null;
        }
        let value = values.join(", ");
        if (/^content-encoding$/i.test(name)) {
          value = value.toLowerCase();
        }
        return value;
      }
      forEach(callback) {
        for (const name of this.keys()) {
          callback(this.get(name), name);
        }
      }
      *values() {
        for (const name of this.keys()) {
          yield this.get(name);
        }
      }
      *entries() {
        for (const name of this.keys()) {
          yield [name, this.get(name)];
        }
      }
      [Symbol.iterator]() {
        return this.entries();
      }
      raw() {
        return [...this.keys()].reduce((result, key) => {
          result[key] = this.getAll(key);
          return result;
        }, {});
      }
      [Symbol.for("nodejs.util.inspect.custom")]() {
        return [...this.keys()].reduce((result, key) => {
          const values = this.getAll(key);
          if (key === "host") {
            result[key] = values[0];
          } else {
            result[key] = values.length > 1 ? values : values[0];
          }
          return result;
        }, {});
      }
    };
    Object.defineProperties(Headers.prototype, ["get", "entries", "forEach", "values"].reduce((result, property) => {
      result[property] = { enumerable: true };
      return result;
    }, {}));
    redirectStatus = new Set([301, 302, 303, 307, 308]);
    isRedirect = (code) => {
      return redirectStatus.has(code);
    };
    INTERNALS$1 = Symbol("Response internals");
    Response = class extends Body {
      constructor(body = null, options2 = {}) {
        super(body, options2);
        const status = options2.status || 200;
        const headers = new Headers(options2.headers);
        if (body !== null && !headers.has("Content-Type")) {
          const contentType = extractContentType(body);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        this[INTERNALS$1] = {
          url: options2.url,
          status,
          statusText: options2.statusText || "",
          headers,
          counter: options2.counter,
          highWaterMark: options2.highWaterMark
        };
      }
      get url() {
        return this[INTERNALS$1].url || "";
      }
      get status() {
        return this[INTERNALS$1].status;
      }
      get ok() {
        return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
      }
      get redirected() {
        return this[INTERNALS$1].counter > 0;
      }
      get statusText() {
        return this[INTERNALS$1].statusText;
      }
      get headers() {
        return this[INTERNALS$1].headers;
      }
      get highWaterMark() {
        return this[INTERNALS$1].highWaterMark;
      }
      clone() {
        return new Response(clone(this, this.highWaterMark), {
          url: this.url,
          status: this.status,
          statusText: this.statusText,
          headers: this.headers,
          ok: this.ok,
          redirected: this.redirected,
          size: this.size
        });
      }
      static redirect(url, status = 302) {
        if (!isRedirect(status)) {
          throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
        }
        return new Response(null, {
          headers: {
            location: new URL(url).toString()
          },
          status
        });
      }
      get [Symbol.toStringTag]() {
        return "Response";
      }
    };
    Object.defineProperties(Response.prototype, {
      url: { enumerable: true },
      status: { enumerable: true },
      ok: { enumerable: true },
      redirected: { enumerable: true },
      statusText: { enumerable: true },
      headers: { enumerable: true },
      clone: { enumerable: true }
    });
    getSearch = (parsedURL) => {
      if (parsedURL.search) {
        return parsedURL.search;
      }
      const lastOffset = parsedURL.href.length - 1;
      const hash2 = parsedURL.hash || (parsedURL.href[lastOffset] === "#" ? "#" : "");
      return parsedURL.href[lastOffset - hash2.length] === "?" ? "?" : "";
    };
    INTERNALS = Symbol("Request internals");
    isRequest = (object) => {
      return typeof object === "object" && typeof object[INTERNALS] === "object";
    };
    Request = class extends Body {
      constructor(input, init2 = {}) {
        let parsedURL;
        if (isRequest(input)) {
          parsedURL = new URL(input.url);
        } else {
          parsedURL = new URL(input);
          input = {};
        }
        let method = init2.method || input.method || "GET";
        method = method.toUpperCase();
        if ((init2.body != null || isRequest(input)) && input.body !== null && (method === "GET" || method === "HEAD")) {
          throw new TypeError("Request with GET/HEAD method cannot have body");
        }
        const inputBody = init2.body ? init2.body : isRequest(input) && input.body !== null ? clone(input) : null;
        super(inputBody, {
          size: init2.size || input.size || 0
        });
        const headers = new Headers(init2.headers || input.headers || {});
        if (inputBody !== null && !headers.has("Content-Type")) {
          const contentType = extractContentType(inputBody, this);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        let signal = isRequest(input) ? input.signal : null;
        if ("signal" in init2) {
          signal = init2.signal;
        }
        if (signal !== null && !isAbortSignal(signal)) {
          throw new TypeError("Expected signal to be an instanceof AbortSignal");
        }
        this[INTERNALS] = {
          method,
          redirect: init2.redirect || input.redirect || "follow",
          headers,
          parsedURL,
          signal
        };
        this.follow = init2.follow === void 0 ? input.follow === void 0 ? 20 : input.follow : init2.follow;
        this.compress = init2.compress === void 0 ? input.compress === void 0 ? true : input.compress : init2.compress;
        this.counter = init2.counter || input.counter || 0;
        this.agent = init2.agent || input.agent;
        this.highWaterMark = init2.highWaterMark || input.highWaterMark || 16384;
        this.insecureHTTPParser = init2.insecureHTTPParser || input.insecureHTTPParser || false;
      }
      get method() {
        return this[INTERNALS].method;
      }
      get url() {
        return (0, import_url.format)(this[INTERNALS].parsedURL);
      }
      get headers() {
        return this[INTERNALS].headers;
      }
      get redirect() {
        return this[INTERNALS].redirect;
      }
      get signal() {
        return this[INTERNALS].signal;
      }
      clone() {
        return new Request(this);
      }
      get [Symbol.toStringTag]() {
        return "Request";
      }
    };
    Object.defineProperties(Request.prototype, {
      method: { enumerable: true },
      url: { enumerable: true },
      headers: { enumerable: true },
      redirect: { enumerable: true },
      clone: { enumerable: true },
      signal: { enumerable: true }
    });
    getNodeRequestOptions = (request) => {
      const { parsedURL } = request[INTERNALS];
      const headers = new Headers(request[INTERNALS].headers);
      if (!headers.has("Accept")) {
        headers.set("Accept", "*/*");
      }
      let contentLengthValue = null;
      if (request.body === null && /^(post|put)$/i.test(request.method)) {
        contentLengthValue = "0";
      }
      if (request.body !== null) {
        const totalBytes = getTotalBytes(request);
        if (typeof totalBytes === "number" && !Number.isNaN(totalBytes)) {
          contentLengthValue = String(totalBytes);
        }
      }
      if (contentLengthValue) {
        headers.set("Content-Length", contentLengthValue);
      }
      if (!headers.has("User-Agent")) {
        headers.set("User-Agent", "node-fetch");
      }
      if (request.compress && !headers.has("Accept-Encoding")) {
        headers.set("Accept-Encoding", "gzip,deflate,br");
      }
      let { agent } = request;
      if (typeof agent === "function") {
        agent = agent(parsedURL);
      }
      if (!headers.has("Connection") && !agent) {
        headers.set("Connection", "close");
      }
      const search = getSearch(parsedURL);
      const requestOptions = {
        path: parsedURL.pathname + search,
        pathname: parsedURL.pathname,
        hostname: parsedURL.hostname,
        protocol: parsedURL.protocol,
        port: parsedURL.port,
        hash: parsedURL.hash,
        search: parsedURL.search,
        query: parsedURL.query,
        href: parsedURL.href,
        method: request.method,
        headers: headers[Symbol.for("nodejs.util.inspect.custom")](),
        insecureHTTPParser: request.insecureHTTPParser,
        agent
      };
      return requestOptions;
    };
    AbortError = class extends FetchBaseError {
      constructor(message, type = "aborted") {
        super(message, type);
      }
    };
    supportedSchemas = new Set(["data:", "http:", "https:"]);
  }
});

// node_modules/@sveltejs/adapter-vercel/files/shims.js
var init_shims = __esm({
  "node_modules/@sveltejs/adapter-vercel/files/shims.js"() {
    init_install_fetch();
  }
});

// node_modules/cookie/index.js
var require_cookie = __commonJS({
  "node_modules/cookie/index.js"(exports) {
    init_shims();
    "use strict";
    exports.parse = parse;
    exports.serialize = serialize;
    var decode = decodeURIComponent;
    var encode = encodeURIComponent;
    var pairSplitRegExp = /; */;
    var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
    function parse(str, options2) {
      if (typeof str !== "string") {
        throw new TypeError("argument str must be a string");
      }
      var obj = {};
      var opt = options2 || {};
      var pairs = str.split(pairSplitRegExp);
      var dec = opt.decode || decode;
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        var eq_idx = pair.indexOf("=");
        if (eq_idx < 0) {
          continue;
        }
        var key = pair.substr(0, eq_idx).trim();
        var val = pair.substr(++eq_idx, pair.length).trim();
        if (val[0] == '"') {
          val = val.slice(1, -1);
        }
        if (obj[key] == void 0) {
          obj[key] = tryDecode(val, dec);
        }
      }
      return obj;
    }
    function serialize(name, val, options2) {
      var opt = options2 || {};
      var enc = opt.encode || encode;
      if (typeof enc !== "function") {
        throw new TypeError("option encode is invalid");
      }
      if (!fieldContentRegExp.test(name)) {
        throw new TypeError("argument name is invalid");
      }
      var value = enc(val);
      if (value && !fieldContentRegExp.test(value)) {
        throw new TypeError("argument val is invalid");
      }
      var str = name + "=" + value;
      if (opt.maxAge != null) {
        var maxAge = opt.maxAge - 0;
        if (isNaN(maxAge) || !isFinite(maxAge)) {
          throw new TypeError("option maxAge is invalid");
        }
        str += "; Max-Age=" + Math.floor(maxAge);
      }
      if (opt.domain) {
        if (!fieldContentRegExp.test(opt.domain)) {
          throw new TypeError("option domain is invalid");
        }
        str += "; Domain=" + opt.domain;
      }
      if (opt.path) {
        if (!fieldContentRegExp.test(opt.path)) {
          throw new TypeError("option path is invalid");
        }
        str += "; Path=" + opt.path;
      }
      if (opt.expires) {
        if (typeof opt.expires.toUTCString !== "function") {
          throw new TypeError("option expires is invalid");
        }
        str += "; Expires=" + opt.expires.toUTCString();
      }
      if (opt.httpOnly) {
        str += "; HttpOnly";
      }
      if (opt.secure) {
        str += "; Secure";
      }
      if (opt.sameSite) {
        var sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
        switch (sameSite) {
          case true:
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError("option sameSite is invalid");
        }
      }
      return str;
    }
    function tryDecode(str, decode2) {
      try {
        return decode2(str);
      } catch (e) {
        return str;
      }
    }
  }
});

// .svelte-kit/vercel/entry.js
__export(exports, {
  default: () => entry_default
});
init_shims();

// node_modules/@sveltejs/kit/dist/node.js
init_shims();

// node_modules/@sveltejs/kit/dist/adapter-utils.js
init_shims();
function isContentTypeTextual(content_type) {
  if (!content_type)
    return true;
  const [type] = content_type.split(";");
  return type === "text/plain" || type === "application/json" || type === "application/x-www-form-urlencoded" || type === "multipart/form-data";
}

// node_modules/@sveltejs/kit/dist/node.js
function getRawBody(req) {
  return new Promise((fulfil, reject) => {
    const h = req.headers;
    if (!h["content-type"]) {
      return fulfil("");
    }
    req.on("error", reject);
    const length = Number(h["content-length"]);
    if (isNaN(length) && h["transfer-encoding"] == null) {
      return fulfil("");
    }
    let data = new Uint8Array(length || 0);
    if (length > 0) {
      let offset = 0;
      req.on("data", (chunk) => {
        const new_len = offset + Buffer.byteLength(chunk);
        if (new_len > length) {
          return reject({
            status: 413,
            reason: 'Exceeded "Content-Length" limit'
          });
        }
        data.set(chunk, offset);
        offset = new_len;
      });
    } else {
      req.on("data", (chunk) => {
        const new_data = new Uint8Array(data.length + chunk.length);
        new_data.set(data, 0);
        new_data.set(chunk, data.length);
        data = new_data;
      });
    }
    req.on("end", () => {
      const [type] = (h["content-type"] || "").split(/;\s*/);
      if (isContentTypeTextual(type)) {
        const encoding = h["content-encoding"] || "utf-8";
        return fulfil(new TextDecoder(encoding).decode(data));
      }
      fulfil(data);
    });
  });
}

// .svelte-kit/output/server/app.js
init_shims();

// node_modules/@sveltejs/kit/dist/ssr.js
init_shims();
function lowercase_keys(obj) {
  const clone2 = {};
  for (const key in obj) {
    clone2[key.toLowerCase()] = obj[key];
  }
  return clone2;
}
function error(body) {
  return {
    status: 500,
    body,
    headers: {}
  };
}
function is_string(s2) {
  return typeof s2 === "string" || s2 instanceof String;
}
async function render_endpoint(request, route) {
  const mod = await route.load();
  const handler = mod[request.method.toLowerCase().replace("delete", "del")];
  if (!handler) {
    return;
  }
  const match = route.pattern.exec(request.path);
  if (!match) {
    return error("could not parse parameters from request path");
  }
  const params = route.params(match);
  const response = await handler({ ...request, params });
  const preface = `Invalid response from route ${request.path}`;
  if (!response) {
    return;
  }
  if (typeof response !== "object") {
    return error(`${preface}: expected an object, got ${typeof response}`);
  }
  let { status = 200, body, headers = {} } = response;
  headers = lowercase_keys(headers);
  const type = headers["content-type"];
  const is_type_textual = isContentTypeTextual(type);
  if (!is_type_textual && !(body instanceof Uint8Array || is_string(body))) {
    return error(`${preface}: body must be an instance of string or Uint8Array if content-type is not a supported textual content-type`);
  }
  let normalized_body;
  if ((typeof body === "object" || typeof body === "undefined") && !(body instanceof Uint8Array) && (!type || type.startsWith("application/json"))) {
    headers = { ...headers, "content-type": "application/json; charset=utf-8" };
    normalized_body = JSON.stringify(typeof body === "undefined" ? {} : body);
  } else {
    normalized_body = body;
  }
  return { status, body: normalized_body, headers };
}
var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped$1 = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function devalue(value) {
  var counts = new Map();
  function walk(thing) {
    if (typeof thing === "function") {
      throw new Error("Cannot stringify a function");
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          var proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            throw new Error("Cannot stringify arbitrary non-POJOs");
          }
          if (Object.getOwnPropertySymbols(thing).length > 0) {
            throw new Error("Cannot stringify POJOs with symbolic keys");
          }
          Object.keys(thing).forEach(function(key) {
            return walk(thing[key]);
          });
      }
    }
  }
  walk(value);
  var names = new Map();
  Array.from(counts).filter(function(entry) {
    return entry[1] > 1;
  }).sort(function(a, b) {
    return b[1] - a[1];
  }).forEach(function(entry, i) {
    names.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    var type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return "Object(" + stringify(thing.valueOf()) + ")";
      case "RegExp":
        return "new RegExp(" + stringifyString(thing.source) + ', "' + thing.flags + '")';
      case "Date":
        return "new Date(" + thing.getTime() + ")";
      case "Array":
        var members = thing.map(function(v, i) {
          return i in thing ? stringify(v) : "";
        });
        var tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return "[" + members.join(",") + tail + "]";
      case "Set":
      case "Map":
        return "new " + type + "([" + Array.from(thing).map(stringify).join(",") + "])";
      default:
        var obj = "{" + Object.keys(thing).map(function(key) {
          return safeKey(key) + ":" + stringify(thing[key]);
        }).join(",") + "}";
        var proto = Object.getPrototypeOf(thing);
        if (proto === null) {
          return Object.keys(thing).length > 0 ? "Object.assign(Object.create(null)," + obj + ")" : "Object.create(null)";
        }
        return obj;
    }
  }
  var str = stringify(value);
  if (names.size) {
    var params_1 = [];
    var statements_1 = [];
    var values_1 = [];
    names.forEach(function(name, thing) {
      params_1.push(name);
      if (isPrimitive(thing)) {
        values_1.push(stringifyPrimitive(thing));
        return;
      }
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values_1.push("Object(" + stringify(thing.valueOf()) + ")");
          break;
        case "RegExp":
          values_1.push(thing.toString());
          break;
        case "Date":
          values_1.push("new Date(" + thing.getTime() + ")");
          break;
        case "Array":
          values_1.push("Array(" + thing.length + ")");
          thing.forEach(function(v, i) {
            statements_1.push(name + "[" + i + "]=" + stringify(v));
          });
          break;
        case "Set":
          values_1.push("new Set");
          statements_1.push(name + "." + Array.from(thing).map(function(v) {
            return "add(" + stringify(v) + ")";
          }).join("."));
          break;
        case "Map":
          values_1.push("new Map");
          statements_1.push(name + "." + Array.from(thing).map(function(_a) {
            var k = _a[0], v = _a[1];
            return "set(" + stringify(k) + ", " + stringify(v) + ")";
          }).join("."));
          break;
        default:
          values_1.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach(function(key) {
            statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
          });
      }
    });
    statements_1.push("return " + str);
    return "(function(" + params_1.join(",") + "){" + statements_1.join(";") + "}(" + values_1.join(",") + "))";
  } else {
    return str;
  }
}
function getName(num) {
  var name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string")
    return stringifyString(thing);
  if (thing === void 0)
    return "void 0";
  if (thing === 0 && 1 / thing < 0)
    return "-0";
  var str = String(thing);
  if (typeof thing === "number")
    return str.replace(/^(-)?0\./, "$1.");
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
  var result = '"';
  for (var i = 0; i < str.length; i += 1) {
    var char = str.charAt(i);
    var code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$1) {
      result += escaped$1[char];
    } else if (code >= 55296 && code <= 57343) {
      var next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += "\\u" + code.toString(16).toUpperCase();
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
function noop() {
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
Promise.resolve();
var subscriber_queue = [];
function writable(value, start = noop) {
  let stop;
  const subscribers = [];
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (let i = 0; i < subscribers.length; i += 1) {
          const s2 = subscribers[i];
          s2[1]();
          subscriber_queue.push(s2, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.push(subscriber);
    if (subscribers.length === 1) {
      stop = start(set) || noop;
    }
    run2(value);
    return () => {
      const index2 = subscribers.indexOf(subscriber);
      if (index2 !== -1) {
        subscribers.splice(index2, 1);
      }
      if (subscribers.length === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe };
}
function hash(value) {
  let hash2 = 5381;
  let i = value.length;
  if (typeof value === "string") {
    while (i)
      hash2 = hash2 * 33 ^ value.charCodeAt(--i);
  } else {
    while (i)
      hash2 = hash2 * 33 ^ value[--i];
  }
  return (hash2 >>> 0).toString(36);
}
var s$1 = JSON.stringify;
async function render_response({
  branch,
  options: options2,
  $session,
  page_config,
  status,
  error: error3,
  page
}) {
  const css2 = new Set(options2.entry.css);
  const js = new Set(options2.entry.js);
  const styles = new Set();
  const serialized_data = [];
  let rendered;
  let is_private = false;
  let maxage;
  if (error3) {
    error3.stack = options2.get_stack(error3);
  }
  if (page_config.ssr) {
    branch.forEach(({ node, loaded, fetched, uses_credentials }) => {
      if (node.css)
        node.css.forEach((url) => css2.add(url));
      if (node.js)
        node.js.forEach((url) => js.add(url));
      if (node.styles)
        node.styles.forEach((content) => styles.add(content));
      if (fetched && page_config.hydrate)
        serialized_data.push(...fetched);
      if (uses_credentials)
        is_private = true;
      maxage = loaded.maxage;
    });
    const session = writable($session);
    const props = {
      stores: {
        page: writable(null),
        navigating: writable(null),
        session
      },
      page,
      components: branch.map(({ node }) => node.module.default)
    };
    for (let i = 0; i < branch.length; i += 1) {
      props[`props_${i}`] = await branch[i].loaded.props;
    }
    let session_tracking_active = false;
    const unsubscribe = session.subscribe(() => {
      if (session_tracking_active)
        is_private = true;
    });
    session_tracking_active = true;
    try {
      rendered = options2.root.render(props);
    } finally {
      unsubscribe();
    }
  } else {
    rendered = { head: "", html: "", css: { code: "", map: null } };
  }
  const include_js = page_config.router || page_config.hydrate;
  if (!include_js)
    js.clear();
  const links = options2.amp ? styles.size > 0 || rendered.css.code.length > 0 ? `<style amp-custom>${Array.from(styles).concat(rendered.css.code).join("\n")}</style>` : "" : [
    ...Array.from(js).map((dep) => `<link rel="modulepreload" href="${dep}">`),
    ...Array.from(css2).map((dep) => `<link rel="stylesheet" href="${dep}">`)
  ].join("\n		");
  let init2 = "";
  if (options2.amp) {
    init2 = `
		<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
		<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
		<script async src="https://cdn.ampproject.org/v0.js"><\/script>`;
  } else if (include_js) {
    init2 = `<script type="module">
			import { start } from ${s$1(options2.entry.file)};
			start({
				target: ${options2.target ? `document.querySelector(${s$1(options2.target)})` : "document.body"},
				paths: ${s$1(options2.paths)},
				session: ${try_serialize($session, (error4) => {
      throw new Error(`Failed to serialize session data: ${error4.message}`);
    })},
				host: ${page && page.host ? s$1(page.host) : "location.host"},
				route: ${!!page_config.router},
				spa: ${!page_config.ssr},
				trailing_slash: ${s$1(options2.trailing_slash)},
				hydrate: ${page_config.ssr && page_config.hydrate ? `{
					status: ${status},
					error: ${serialize_error(error3)},
					nodes: [
						${(branch || []).map(({ node }) => `import(${s$1(node.entry)})`).join(",\n						")}
					],
					page: {
						host: ${page && page.host ? s$1(page.host) : "location.host"}, // TODO this is redundant
						path: ${s$1(page && page.path)},
						query: new URLSearchParams(${page ? s$1(page.query.toString()) : ""}),
						params: ${page && s$1(page.params)}
					}
				}` : "null"}
			});
		<\/script>`;
  }
  if (options2.service_worker) {
    init2 += `<script>
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('${options2.service_worker}');
			}
		<\/script>`;
  }
  const head = [
    rendered.head,
    styles.size && !options2.amp ? `<style data-svelte>${Array.from(styles).join("\n")}</style>` : "",
    links,
    init2
  ].join("\n\n		");
  const body = options2.amp ? rendered.html : `${rendered.html}

			${serialized_data.map(({ url, body: body2, json }) => {
    let attributes = `type="application/json" data-type="svelte-data" data-url="${url}"`;
    if (body2)
      attributes += ` data-body="${hash(body2)}"`;
    return `<script ${attributes}>${json}<\/script>`;
  }).join("\n\n			")}
		`.replace(/^\t{2}/gm, "");
  const headers = {
    "content-type": "text/html"
  };
  if (maxage) {
    headers["cache-control"] = `${is_private ? "private" : "public"}, max-age=${maxage}`;
  }
  if (!options2.floc) {
    headers["permissions-policy"] = "interest-cohort=()";
  }
  return {
    status,
    headers,
    body: options2.template({ head, body })
  };
}
function try_serialize(data, fail) {
  try {
    return devalue(data);
  } catch (err) {
    if (fail)
      fail(err);
    return null;
  }
}
function serialize_error(error3) {
  if (!error3)
    return null;
  let serialized = try_serialize(error3);
  if (!serialized) {
    const { name, message, stack } = error3;
    serialized = try_serialize({ ...error3, name, message, stack });
  }
  if (!serialized) {
    serialized = "{}";
  }
  return serialized;
}
function normalize(loaded) {
  const has_error_status = loaded.status && loaded.status >= 400 && loaded.status <= 599 && !loaded.redirect;
  if (loaded.error || has_error_status) {
    const status = loaded.status;
    if (!loaded.error && has_error_status) {
      return {
        status: status || 500,
        error: new Error()
      };
    }
    const error3 = typeof loaded.error === "string" ? new Error(loaded.error) : loaded.error;
    if (!(error3 instanceof Error)) {
      return {
        status: 500,
        error: new Error(`"error" property returned from load() must be a string or instance of Error, received type "${typeof error3}"`)
      };
    }
    if (!status || status < 400 || status > 599) {
      console.warn('"error" returned from load() without a valid status code \u2014 defaulting to 500');
      return { status: 500, error: error3 };
    }
    return { status, error: error3 };
  }
  if (loaded.redirect) {
    if (!loaded.status || Math.floor(loaded.status / 100) !== 3) {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be accompanied by a 3xx status code')
      };
    }
    if (typeof loaded.redirect !== "string") {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be a string')
      };
    }
  }
  return loaded;
}
var s = JSON.stringify;
async function load_node({
  request,
  options: options2,
  state,
  route,
  page,
  node,
  $session,
  context,
  prerender_enabled,
  is_leaf,
  is_error,
  status,
  error: error3
}) {
  const { module: module2 } = node;
  let uses_credentials = false;
  const fetched = [];
  let loaded;
  const page_proxy = new Proxy(page, {
    get: (target, prop, receiver) => {
      if (prop === "query" && prerender_enabled) {
        throw new Error("Cannot access query on a page with prerendering enabled");
      }
      return Reflect.get(target, prop, receiver);
    }
  });
  if (module2.load) {
    const load_input = {
      page: page_proxy,
      get session() {
        uses_credentials = true;
        return $session;
      },
      fetch: async (resource, opts = {}) => {
        let url;
        if (typeof resource === "string") {
          url = resource;
        } else {
          url = resource.url;
          opts = {
            method: resource.method,
            headers: resource.headers,
            body: resource.body,
            mode: resource.mode,
            credentials: resource.credentials,
            cache: resource.cache,
            redirect: resource.redirect,
            referrer: resource.referrer,
            integrity: resource.integrity,
            ...opts
          };
        }
        const resolved = resolve(request.path, url.split("?")[0]);
        let response;
        const filename = resolved.replace(options2.paths.assets, "").slice(1);
        const filename_html = `${filename}/index.html`;
        const asset = options2.manifest.assets.find((d) => d.file === filename || d.file === filename_html);
        if (asset) {
          response = options2.read ? new Response(options2.read(asset.file), {
            headers: asset.type ? {
              "content-type": asset.type
            } : {}
          }) : await fetch(`http://${page.host}/${asset.file}`, opts);
        } else if (resolved.startsWith(options2.paths.base || "/") && !resolved.startsWith("//")) {
          const relative = resolved.replace(options2.paths.base, "");
          const headers = { ...opts.headers };
          if (opts.credentials !== "omit") {
            uses_credentials = true;
            headers.cookie = request.headers.cookie;
            if (!headers.authorization) {
              headers.authorization = request.headers.authorization;
            }
          }
          if (opts.body && typeof opts.body !== "string") {
            throw new Error("Request body must be a string");
          }
          const search = url.includes("?") ? url.slice(url.indexOf("?") + 1) : "";
          const rendered = await respond({
            host: request.host,
            method: opts.method || "GET",
            headers,
            path: relative,
            rawBody: opts.body,
            query: new URLSearchParams(search)
          }, options2, {
            fetched: url,
            initiator: route
          });
          if (rendered) {
            if (state.prerender) {
              state.prerender.dependencies.set(relative, rendered);
            }
            response = new Response(rendered.body, {
              status: rendered.status,
              headers: rendered.headers
            });
          }
        } else {
          if (resolved.startsWith("//")) {
            throw new Error(`Cannot request protocol-relative URL (${url}) in server-side fetch`);
          }
          if (typeof request.host !== "undefined") {
            const { hostname: fetch_hostname } = new URL(url);
            const [server_hostname] = request.host.split(":");
            if (`.${fetch_hostname}`.endsWith(`.${server_hostname}`) && opts.credentials !== "omit") {
              uses_credentials = true;
              opts.headers = {
                ...opts.headers,
                cookie: request.headers.cookie
              };
            }
          }
          const external_request = new Request(url, opts);
          response = await options2.hooks.serverFetch.call(null, external_request);
        }
        if (response) {
          const proxy = new Proxy(response, {
            get(response2, key, receiver) {
              async function text() {
                const body = await response2.text();
                const headers = {};
                for (const [key2, value] of response2.headers) {
                  if (key2 !== "etag" && key2 !== "set-cookie")
                    headers[key2] = value;
                }
                if (!opts.body || typeof opts.body === "string") {
                  fetched.push({
                    url,
                    body: opts.body,
                    json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers)},"body":${escape(body)}}`
                  });
                }
                return body;
              }
              if (key === "text") {
                return text;
              }
              if (key === "json") {
                return async () => {
                  return JSON.parse(await text());
                };
              }
              return Reflect.get(response2, key, response2);
            }
          });
          return proxy;
        }
        return response || new Response("Not found", {
          status: 404
        });
      },
      context: { ...context }
    };
    if (is_error) {
      load_input.status = status;
      load_input.error = error3;
    }
    loaded = await module2.load.call(null, load_input);
  } else {
    loaded = {};
  }
  if (!loaded && is_leaf && !is_error)
    return;
  if (!loaded) {
    throw new Error(`${node.entry} - load must return a value except for page fall through`);
  }
  return {
    node,
    loaded: normalize(loaded),
    context: loaded.context || context,
    fetched,
    uses_credentials
  };
}
var escaped = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
function escape(str) {
  let result = '"';
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped) {
      result += escaped[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && next >= 56320 && next <= 57343) {
        result += char + str[++i];
      } else {
        result += `\\u${code.toString(16).toUpperCase()}`;
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
var absolute = /^([a-z]+:)?\/?\//;
function resolve(base, path) {
  const base_match = absolute.exec(base);
  const path_match = absolute.exec(path);
  if (!base_match) {
    throw new Error(`bad base path: "${base}"`);
  }
  const baseparts = path_match ? [] : base.slice(base_match[0].length).split("/");
  const pathparts = path_match ? path.slice(path_match[0].length).split("/") : path.split("/");
  baseparts.pop();
  for (let i = 0; i < pathparts.length; i += 1) {
    const part = pathparts[i];
    if (part === ".")
      continue;
    else if (part === "..")
      baseparts.pop();
    else
      baseparts.push(part);
  }
  const prefix = path_match && path_match[0] || base_match && base_match[0] || "";
  return `${prefix}${baseparts.join("/")}`;
}
function coalesce_to_error(err) {
  return err instanceof Error ? err : new Error(JSON.stringify(err));
}
async function respond_with_error({ request, options: options2, state, $session, status, error: error3 }) {
  const default_layout = await options2.load_component(options2.manifest.layout);
  const default_error = await options2.load_component(options2.manifest.error);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params: {}
  };
  const loaded = await load_node({
    request,
    options: options2,
    state,
    route: null,
    page,
    node: default_layout,
    $session,
    context: {},
    prerender_enabled: is_prerender_enabled(options2, default_error, state),
    is_leaf: false,
    is_error: false
  });
  const branch = [
    loaded,
    await load_node({
      request,
      options: options2,
      state,
      route: null,
      page,
      node: default_error,
      $session,
      context: loaded ? loaded.context : {},
      prerender_enabled: is_prerender_enabled(options2, default_error, state),
      is_leaf: false,
      is_error: true,
      status,
      error: error3
    })
  ];
  try {
    return await render_response({
      options: options2,
      $session,
      page_config: {
        hydrate: options2.hydrate,
        router: options2.router,
        ssr: options2.ssr
      },
      status,
      error: error3,
      branch,
      page
    });
  } catch (err) {
    const error4 = coalesce_to_error(err);
    options2.handle_error(error4);
    return {
      status: 500,
      headers: {},
      body: error4.stack
    };
  }
}
function is_prerender_enabled(options2, node, state) {
  return options2.prerender && (!!node.module.prerender || !!state.prerender && state.prerender.all);
}
async function respond$1(opts) {
  const { request, options: options2, state, $session, route } = opts;
  let nodes;
  try {
    nodes = await Promise.all(route.a.map((id) => id ? options2.load_component(id) : void 0));
  } catch (err) {
    const error4 = coalesce_to_error(err);
    options2.handle_error(error4);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error4
    });
  }
  const leaf = nodes[nodes.length - 1].module;
  let page_config = get_page_config(leaf, options2);
  if (!leaf.prerender && state.prerender && !state.prerender.all) {
    return {
      status: 204,
      headers: {},
      body: ""
    };
  }
  let branch = [];
  let status = 200;
  let error3;
  ssr:
    if (page_config.ssr) {
      let context = {};
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        let loaded;
        if (node) {
          try {
            loaded = await load_node({
              ...opts,
              node,
              context,
              prerender_enabled: is_prerender_enabled(options2, node, state),
              is_leaf: i === nodes.length - 1,
              is_error: false
            });
            if (!loaded)
              return;
            if (loaded.loaded.redirect) {
              return {
                status: loaded.loaded.status,
                headers: {
                  location: encodeURI(loaded.loaded.redirect)
                }
              };
            }
            if (loaded.loaded.error) {
              ({ status, error: error3 } = loaded.loaded);
            }
          } catch (err) {
            const e = coalesce_to_error(err);
            options2.handle_error(e);
            status = 500;
            error3 = e;
          }
          if (loaded && !error3) {
            branch.push(loaded);
          }
          if (error3) {
            while (i--) {
              if (route.b[i]) {
                const error_node = await options2.load_component(route.b[i]);
                let node_loaded;
                let j = i;
                while (!(node_loaded = branch[j])) {
                  j -= 1;
                }
                try {
                  const error_loaded = await load_node({
                    ...opts,
                    node: error_node,
                    context: node_loaded.context,
                    prerender_enabled: is_prerender_enabled(options2, error_node, state),
                    is_leaf: false,
                    is_error: true,
                    status,
                    error: error3
                  });
                  if (error_loaded.loaded.error) {
                    continue;
                  }
                  page_config = get_page_config(error_node.module, options2);
                  branch = branch.slice(0, j + 1).concat(error_loaded);
                  break ssr;
                } catch (err) {
                  const e = coalesce_to_error(err);
                  options2.handle_error(e);
                  continue;
                }
              }
            }
            return await respond_with_error({
              request,
              options: options2,
              state,
              $session,
              status,
              error: error3
            });
          }
        }
        if (loaded && loaded.loaded.context) {
          context = {
            ...context,
            ...loaded.loaded.context
          };
        }
      }
    }
  try {
    return await render_response({
      ...opts,
      page_config,
      status,
      error: error3,
      branch: branch.filter(Boolean)
    });
  } catch (err) {
    const error4 = coalesce_to_error(err);
    options2.handle_error(error4);
    return await respond_with_error({
      ...opts,
      status: 500,
      error: error4
    });
  }
}
function get_page_config(leaf, options2) {
  return {
    ssr: "ssr" in leaf ? !!leaf.ssr : options2.ssr,
    router: "router" in leaf ? !!leaf.router : options2.router,
    hydrate: "hydrate" in leaf ? !!leaf.hydrate : options2.hydrate
  };
}
async function render_page(request, route, options2, state) {
  if (state.initiator === route) {
    return {
      status: 404,
      headers: {},
      body: `Not found: ${request.path}`
    };
  }
  const match = route.pattern.exec(request.path);
  const params = route.params(match);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params
  };
  const $session = await options2.hooks.getSession(request);
  const response = await respond$1({
    request,
    options: options2,
    state,
    $session,
    route,
    page
  });
  if (response) {
    return response;
  }
  if (state.fetched) {
    return {
      status: 500,
      headers: {},
      body: `Bad request in load function: failed to fetch ${state.fetched}`
    };
  }
}
function read_only_form_data() {
  const map = new Map();
  return {
    append(key, value) {
      if (map.has(key)) {
        (map.get(key) || []).push(value);
      } else {
        map.set(key, [value]);
      }
    },
    data: new ReadOnlyFormData(map)
  };
}
var ReadOnlyFormData = class {
  #map;
  constructor(map) {
    this.#map = map;
  }
  get(key) {
    const value = this.#map.get(key);
    return value && value[0];
  }
  getAll(key) {
    return this.#map.get(key);
  }
  has(key) {
    return this.#map.has(key);
  }
  *[Symbol.iterator]() {
    for (const [key, value] of this.#map) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *entries() {
    for (const [key, value] of this.#map) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *keys() {
    for (const [key] of this.#map)
      yield key;
  }
  *values() {
    for (const [, value] of this.#map) {
      for (let i = 0; i < value.length; i += 1) {
        yield value[i];
      }
    }
  }
};
function parse_body(raw, headers) {
  if (!raw || typeof raw !== "string")
    return raw;
  const [type, ...directives] = headers["content-type"].split(/;\s*/);
  switch (type) {
    case "text/plain":
      return raw;
    case "application/json":
      return JSON.parse(raw);
    case "application/x-www-form-urlencoded":
      return get_urlencoded(raw);
    case "multipart/form-data": {
      const boundary = directives.find((directive) => directive.startsWith("boundary="));
      if (!boundary)
        throw new Error("Missing boundary");
      return get_multipart(raw, boundary.slice("boundary=".length));
    }
    default:
      throw new Error(`Invalid Content-Type ${type}`);
  }
}
function get_urlencoded(text) {
  const { data, append } = read_only_form_data();
  text.replace(/\+/g, " ").split("&").forEach((str) => {
    const [key, value] = str.split("=");
    append(decodeURIComponent(key), decodeURIComponent(value));
  });
  return data;
}
function get_multipart(text, boundary) {
  const parts = text.split(`--${boundary}`);
  if (parts[0] !== "" || parts[parts.length - 1].trim() !== "--") {
    throw new Error("Malformed form data");
  }
  const { data, append } = read_only_form_data();
  parts.slice(1, -1).forEach((part) => {
    const match = /\s*([\s\S]+?)\r\n\r\n([\s\S]*)\s*/.exec(part);
    if (!match) {
      throw new Error("Malformed form data");
    }
    const raw_headers = match[1];
    const body = match[2].trim();
    let key;
    const headers = {};
    raw_headers.split("\r\n").forEach((str) => {
      const [raw_header, ...raw_directives] = str.split("; ");
      let [name, value] = raw_header.split(": ");
      name = name.toLowerCase();
      headers[name] = value;
      const directives = {};
      raw_directives.forEach((raw_directive) => {
        const [name2, value2] = raw_directive.split("=");
        directives[name2] = JSON.parse(value2);
      });
      if (name === "content-disposition") {
        if (value !== "form-data")
          throw new Error("Malformed form data");
        if (directives.filename) {
          throw new Error("File upload is not yet implemented");
        }
        if (directives.name) {
          key = directives.name;
        }
      }
    });
    if (!key)
      throw new Error("Malformed form data");
    append(key, body);
  });
  return data;
}
async function respond(incoming, options2, state = {}) {
  if (incoming.path !== "/" && options2.trailing_slash !== "ignore") {
    const has_trailing_slash = incoming.path.endsWith("/");
    if (has_trailing_slash && options2.trailing_slash === "never" || !has_trailing_slash && options2.trailing_slash === "always" && !(incoming.path.split("/").pop() || "").includes(".")) {
      const path = has_trailing_slash ? incoming.path.slice(0, -1) : incoming.path + "/";
      const q = incoming.query.toString();
      return {
        status: 301,
        headers: {
          location: encodeURI(path + (q ? `?${q}` : ""))
        }
      };
    }
  }
  try {
    const headers = lowercase_keys(incoming.headers);
    return await options2.hooks.handle({
      request: {
        ...incoming,
        headers,
        body: parse_body(incoming.rawBody, headers),
        params: {},
        locals: {}
      },
      resolve: async (request) => {
        if (state.prerender && state.prerender.fallback) {
          return await render_response({
            options: options2,
            $session: await options2.hooks.getSession(request),
            page_config: { ssr: false, router: true, hydrate: true },
            status: 200,
            branch: []
          });
        }
        for (const route of options2.manifest.routes) {
          if (!route.pattern.test(request.path))
            continue;
          const response = route.type === "endpoint" ? await render_endpoint(request, route) : await render_page(request, route, options2, state);
          if (response) {
            if (response.status === 200) {
              if (!/(no-store|immutable)/.test(response.headers["cache-control"])) {
                const etag = `"${hash(response.body || "")}"`;
                if (request.headers["if-none-match"] === etag) {
                  return {
                    status: 304,
                    headers: {},
                    body: ""
                  };
                }
                response.headers["etag"] = etag;
              }
            }
            return response;
          }
        }
        const $session = await options2.hooks.getSession(request);
        return await respond_with_error({
          request,
          options: options2,
          state,
          $session,
          status: 404,
          error: new Error(`Not found: ${request.path}`)
        });
      }
    });
  } catch (err) {
    const e = coalesce_to_error(err);
    options2.handle_error(e);
    return {
      status: 500,
      headers: {},
      body: options2.dev ? e.stack : e.message
    };
  }
}

// .svelte-kit/output/server/app.js
var import_cookie = __toModule(require_cookie());

// node_modules/@lukeed/uuid/dist/index.mjs
init_shims();
var IDX = 256;
var HEX = [];
var BUFFER;
while (IDX--)
  HEX[IDX] = (IDX + 256).toString(16).substring(1);
function v4() {
  var i = 0, num, out = "";
  if (!BUFFER || IDX + 16 > 256) {
    BUFFER = Array(i = 256);
    while (i--)
      BUFFER[i] = 256 * Math.random() | 0;
    i = IDX = 0;
  }
  for (; i < 16; i++) {
    num = BUFFER[IDX + i];
    if (i == 6)
      out += HEX[num & 15 | 64];
    else if (i == 8)
      out += HEX[num & 63 | 128];
    else
      out += HEX[num];
    if (i & 1 && i > 1 && i < 11)
      out += "-";
  }
  IDX++;
  return out;
}

// .svelte-kit/output/server/app.js
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
var current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
}
Promise.resolve();
var escaped2 = {
  '"': "&quot;",
  "'": "&#39;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;"
};
function escape2(html) {
  return String(html).replace(/["'&<>]/g, (match) => escaped2[match]);
}
function each(items, fn) {
  let str = "";
  for (let i = 0; i < items.length; i += 1) {
    str += fn(items[i], i);
  }
  return str;
}
var missing_component = {
  $$render: () => ""
};
function validate_component(component, name) {
  if (!component || !component.$$render) {
    if (name === "svelte:component")
      name += " this={...}";
    throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
  }
  return component;
}
var on_destroy;
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(parent_component ? parent_component.$$.context : context || []),
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css2) => css2.code).join("\n"),
          map: null
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function add_attribute(name, value, boolean) {
  if (value == null || boolean && !value)
    return "";
  return ` ${name}${value === true ? "" : `=${typeof value === "string" ? JSON.stringify(escape2(value)) : `"${value}"`}`}`;
}
function afterUpdate() {
}
var css = {
  code: "#svelte-announcer.svelte-1pdgbjn{clip:rect(0 0 0 0);-webkit-clip-path:inset(50%);clip-path:inset(50%);height:1px;left:0;overflow:hidden;position:absolute;top:0;white-space:nowrap;width:1px}",
  map: `{"version":3,"file":"root.svelte","sources":["root.svelte"],"sourcesContent":["<!-- This file is generated by @sveltejs/kit \u2014 do not edit it! -->\\n<script>\\n\\timport { setContext, afterUpdate, onMount } from 'svelte';\\n\\n\\t// stores\\n\\texport let stores;\\n\\texport let page;\\n\\n\\texport let components;\\n\\texport let props_0 = null;\\n\\texport let props_1 = null;\\n\\texport let props_2 = null;\\n\\n\\tsetContext('__svelte__', stores);\\n\\n\\t$: stores.page.set(page);\\n\\tafterUpdate(stores.page.notify);\\n\\n\\tlet mounted = false;\\n\\tlet navigated = false;\\n\\tlet title = null;\\n\\n\\tonMount(() => {\\n\\t\\tconst unsubscribe = stores.page.subscribe(() => {\\n\\t\\t\\tif (mounted) {\\n\\t\\t\\t\\tnavigated = true;\\n\\t\\t\\t\\ttitle = document.title || 'untitled page';\\n\\t\\t\\t}\\n\\t\\t});\\n\\n\\t\\tmounted = true;\\n\\t\\treturn unsubscribe;\\n\\t});\\n<\/script>\\n\\n<svelte:component this={components[0]} {...(props_0 || {})}>\\n\\t{#if components[1]}\\n\\t\\t<svelte:component this={components[1]} {...(props_1 || {})}>\\n\\t\\t\\t{#if components[2]}\\n\\t\\t\\t\\t<svelte:component this={components[2]} {...(props_2 || {})}/>\\n\\t\\t\\t{/if}\\n\\t\\t</svelte:component>\\n\\t{/if}\\n</svelte:component>\\n\\n{#if mounted}\\n\\t<div id=\\"svelte-announcer\\" aria-live=\\"assertive\\" aria-atomic=\\"true\\">\\n\\t\\t{#if navigated}\\n\\t\\t\\t{title}\\n\\t\\t{/if}\\n\\t</div>\\n{/if}\\n\\n<style>#svelte-announcer{clip:rect(0 0 0 0);-webkit-clip-path:inset(50%);clip-path:inset(50%);height:1px;left:0;overflow:hidden;position:absolute;top:0;white-space:nowrap;width:1px}</style>"],"names":[],"mappings":"AAqDO,gCAAiB,CAAC,KAAK,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,kBAAkB,MAAM,GAAG,CAAC,CAAC,UAAU,MAAM,GAAG,CAAC,CAAC,OAAO,GAAG,CAAC,KAAK,CAAC,CAAC,SAAS,MAAM,CAAC,SAAS,QAAQ,CAAC,IAAI,CAAC,CAAC,YAAY,MAAM,CAAC,MAAM,GAAG,CAAC"}`
};
var Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { stores } = $$props;
  let { page } = $$props;
  let { components } = $$props;
  let { props_0 = null } = $$props;
  let { props_1 = null } = $$props;
  let { props_2 = null } = $$props;
  setContext("__svelte__", stores);
  afterUpdate(stores.page.notify);
  if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
    $$bindings.stores(stores);
  if ($$props.page === void 0 && $$bindings.page && page !== void 0)
    $$bindings.page(page);
  if ($$props.components === void 0 && $$bindings.components && components !== void 0)
    $$bindings.components(components);
  if ($$props.props_0 === void 0 && $$bindings.props_0 && props_0 !== void 0)
    $$bindings.props_0(props_0);
  if ($$props.props_1 === void 0 && $$bindings.props_1 && props_1 !== void 0)
    $$bindings.props_1(props_1);
  if ($$props.props_2 === void 0 && $$bindings.props_2 && props_2 !== void 0)
    $$bindings.props_2(props_2);
  $$result.css.add(css);
  {
    stores.page.set(page);
  }
  return `


${validate_component(components[0] || missing_component, "svelte:component").$$render($$result, Object.assign(props_0 || {}), {}, {
    default: () => `${components[1] ? `${validate_component(components[1] || missing_component, "svelte:component").$$render($$result, Object.assign(props_1 || {}), {}, {
      default: () => `${components[2] ? `${validate_component(components[2] || missing_component, "svelte:component").$$render($$result, Object.assign(props_2 || {}), {}, {})}` : ``}`
    })}` : ``}`
  })}

${``}`;
});
function set_paths(paths) {
}
function set_prerendering(value) {
}
var handle = async ({ request, resolve: resolve2 }) => {
  const cookies = import_cookie.default.parse(request.headers.cookie || "");
  request.locals.userid = cookies.userid || v4();
  if (request.query.has("_method")) {
    request.method = request.query.get("_method").toUpperCase();
  }
  const response = await resolve2(request);
  if (!cookies.userid) {
    response.headers["set-cookie"] = `userid=${request.locals.userid}; Path=/; HttpOnly`;
  }
  return response;
};
var user_hooks = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  handle
});
var template = ({ head, body }) => '<!DOCTYPE html>\n<html class="antialiased text-gray-500 bg-gray-100" lang="en">\n	<head>\n		<meta charset="utf-8" />\n		<link rel="icon" href="/favicon.png" />\n		<meta name="viewport" content="width=device-width, initial-scale=1" />\n\n		' + head + '\n	</head>\n	<body>\n		<div id="svelte">' + body + "</div>\n	</body>\n</html>\n";
var options = null;
var default_settings = { paths: { "base": "", "assets": "/." } };
function init(settings = default_settings) {
  set_paths(settings.paths);
  set_prerendering(settings.prerendering || false);
  options = {
    amp: false,
    dev: false,
    entry: {
      file: "/./_app/start-238e6908.js",
      css: ["/./_app/assets/start-0826e215.css"],
      js: ["/./_app/start-238e6908.js", "/./_app/chunks/vendor-e8b07d6c.js"]
    },
    fetched: void 0,
    floc: false,
    get_component_path: (id) => "/./_app/" + entry_lookup[id],
    get_stack: (error22) => String(error22),
    handle_error: (error22) => {
      if (error22.frame) {
        console.error(error22.frame);
      }
      console.error(error22.stack);
      error22.stack = options.get_stack(error22);
    },
    hooks: get_hooks(user_hooks),
    hydrate: true,
    initiator: void 0,
    load_component,
    manifest,
    paths: settings.paths,
    prerender: true,
    read: settings.read,
    root: Root,
    service_worker: null,
    router: true,
    ssr: true,
    target: "#svelte",
    template,
    trailing_slash: "never"
  };
}
var empty = () => ({});
var manifest = {
  assets: [{ "file": "favicon.png", "size": 1571, "type": "image/png" }, { "file": "robots.txt", "size": 67, "type": "text/plain" }],
  layout: "src/routes/__layout.svelte",
  error: ".svelte-kit/build/components/error.svelte",
  routes: [
    {
      type: "page",
      pattern: /^\/$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/index.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    }
  ]
};
var get_hooks = (hooks) => ({
  getSession: hooks.getSession || (() => ({})),
  handle: hooks.handle || (({ request, resolve: resolve2 }) => resolve2(request)),
  serverFetch: hooks.serverFetch || fetch
});
var module_lookup = {
  "src/routes/__layout.svelte": () => Promise.resolve().then(function() {
    return __layout;
  }),
  ".svelte-kit/build/components/error.svelte": () => Promise.resolve().then(function() {
    return error2;
  }),
  "src/routes/index.svelte": () => Promise.resolve().then(function() {
    return index;
  })
};
var metadata_lookup = { "src/routes/__layout.svelte": { "entry": "/./_app/pages/__layout.svelte-e5b8264f.js", "css": ["/./_app/assets/pages/__layout.svelte-3d45c3a5.css"], "js": ["/./_app/pages/__layout.svelte-e5b8264f.js", "/./_app/chunks/vendor-e8b07d6c.js"], "styles": [] }, ".svelte-kit/build/components/error.svelte": { "entry": "/./_app/error.svelte-c1a417f7.js", "css": [], "js": ["/./_app/error.svelte-c1a417f7.js", "/./_app/chunks/vendor-e8b07d6c.js"], "styles": [] }, "src/routes/index.svelte": { "entry": "/./_app/pages/index.svelte-548fed8e.js", "css": [], "js": ["/./_app/pages/index.svelte-548fed8e.js", "/./_app/chunks/vendor-e8b07d6c.js"], "styles": [] } };
async function load_component(file) {
  return {
    module: await module_lookup[file](),
    ...metadata_lookup[file]
  };
}
function render(request, {
  prerender: prerender2
} = {}) {
  const host = request.headers["host"];
  return respond({ ...request, host }, options, { prerender: prerender2 });
}
var logo = "/_app/assets/singular-logo.33e4f2b1.svg";
var Header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<header class="${"flex items-center justify-between px-6 py-4"}"><div class="${"flex-1"}"><a href="${"/"}"><img${add_attribute("src", logo, 0)} alt="${"Singular"}"></a></div>

	<div class="${"flex-1 text-sm text-right"}">@zgabievi
	</div></header>`;
});
var _layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Header, "Header").$$render($$result, {}, {}, {})}

<main class="${"w-full max-w-2xl mx-auto"}">${slots.default ? slots.default({}) : ``}</main>`;
});
var __layout = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _layout
});
function load({ error: error22, status }) {
  return { props: { error: error22, status } };
}
var Error$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { status } = $$props;
  let { error: error22 } = $$props;
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  if ($$props.error === void 0 && $$bindings.error && error22 !== void 0)
    $$bindings.error(error22);
  return `<h1>${escape2(status)}</h1>

<pre>${escape2(error22.message)}</pre>



${error22.frame ? `<pre>${escape2(error22.frame)}</pre>` : ``}
${error22.stack ? `<pre>${escape2(error22.stack)}</pre>` : ``}`;
});
var error2 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Error$1,
  load
});
var isJson = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};
var dotToObj = (obj) => {
  const result = {};
  for (const objectPath in obj) {
    const parts = objectPath.split(".");
    let target = result;
    while (parts.length > 1) {
      const part = parts.shift();
      target = target[part] = target[part] || {};
    }
    target[parts[0]] = obj[objectPath];
  }
  return result;
};
var objValueByKeyArray = (obj, keys) => {
  return keys.reduce((acc, key) => {
    return acc !== void 0 ? acc[key] : void 0;
  }, obj);
};
var schema = {
  "LAYOUT.COMMON.INPUT.LABEL": "InputLabelPosition",
  "LAYOUT.COMPONENTS.IFRAME.ZOOM_INDEX": "IframeZoomLevel",
  "LAYOUT.COMPONENTS.PROFILE.USER_MENU_POSITION": "UserProfileMenuPosition",
  "LAYOUT.COMPONENTS.PROFILE.TRANSACTION_HISTORY.FILTER_TYPE": "TransactionHistoryFilterType",
  "LAYOUT.COMPONENTS.GAME_LIST.FILTER.ICON_POSITION": "GameCategoriesIconPosition",
  "LAYOUT.COMPONENTS.GAME_LIST.ITEM.STYLE": "GameItemStyle",
  "LAYOUT.COMPONENTS.GAME_LIST.ITEM.SHOW_PROVIDER": "ShowGameProvider",
  "LAYOUT.COMPONENTS.GAME_LIST.ITEM.ADD_TO_FAVORITES": "GameHasAddToFavorites",
  "LAYOUT.COMPONENTS.GAME_LIST.ITEM.PLAY_NOW_ICON": "GameHasPlayNowIcon",
  "LAYOUT.COMPONENTS.HEADER.LOGIN_WITH_SMS_BUTTON": "HasLoginWithSms",
  "LAYOUT.COMPONENTS.HEADER.REGISTER_BUTTON": "RegisterButtonOnDesktop",
  "LAYOUT.COMPONENTS.HEADER.REGISTER_BUTTON_MOBILE": "RegisterButtonOnMobile",
  "LAYOUT.COMPONENTS.HEADER.MENU_INTEGRATED": "HasIntegratedMenu",
  "LAYOUT.COMPONENTS.HEADER.AUTH_FORM_TYPE": "AuthenticationType",
  "LAYOUT.COMPONENTS.HEADER.LANGUAGE_SWITCHER": "HasLanguageSwitcher",
  "LAYOUT.COMPONENTS.HEADER.MOBILE_HEADER_BALANCE": "ShowBalanceInMobile",
  "LAYOUT.COMPONENTS.HEADER.FULL_WIDTH": "HasFluidHeader",
  "LAYOUT.COMPONENTS.HEADER.MODERN_AUTH_INFO": "HasModernAuthInfo",
  "LAYOUT.COMPONENTS.HEADER.FLOATING_AUTH_FORM": "HasFloatingAuthButtons",
  "LAYOUT.COMPONENTS.HEADER.PASSWORD_VISIBILITY_BUTTON": "HasPasswordEye",
  "LAYOUT.COMPONENTS.HEADER.AUTH_INPUT_LABEL": "UsernameCustomLabel",
  "LAYOUT.COMPONENTS.PROFILE.ACCOUNT_MANAGEMENT.CAN_DELETE_ACCOUNT": "CanDeleteAccount",
  "SEO.DEFAULT_HEADING": "DefaultSeoHeading",
  "SEO.DEFAULT_KEYWORDS": "DefaultSeoKeywords",
  "SEO.DEFAULT_TITLE": "DefaultSeoTitle",
  "SEO.DEFAULT_IMAGE": "DefaultSeoImage",
  "SEO.DEFAULT_DESCRIPTION": "DefaultSeoDescription",
  "LAYOUT.IMAGE_SIZES.DESKTOP.BLOCK_SLIDER_WIDTH_BOTH": "BlockSliderWidthInBothOnDesktop",
  "LAYOUT.IMAGE_SIZES.DESKTOP.BLOCK_SLIDER_HEIGHT_BOTH": "BlockSliderHeightInBothOnDesktop",
  "LAYOUT.IMAGE_SIZES.DESKTOP.FLUID_SLIDER_WIDTH_SERVER": "FluidSliderWidthInServerOnDesktop",
  "LAYOUT.IMAGE_SIZES.DESKTOP.FLUID_SLIDER_WIDTH_BROWSER": "FluidSliderWidthInBrowserOnDesktop",
  "LAYOUT.IMAGE_SIZES.DESKTOP.FLUID_SLIDER_HEIGHT_BOTH": "FluidSliderHeightInBothOnDesktop",
  "LAYOUT.IMAGE_SIZES.DESKTOP.FULL_SLIDER_WIDTH_SERVER": "FullSliderWidthInServerOnDesktop",
  "LAYOUT.IMAGE_SIZES.DESKTOP.FULL_SLIDER_WIDTH_BROWSER": "FullSliderWidthInBrowserOnDesktop",
  "LAYOUT.IMAGE_SIZES.DESKTOP.REGULAR_GAME_ITEM_WIDTH_BOTH": "RegularGameItemWidthInBothOnDesktop",
  "LAYOUT.IMAGE_SIZES.DESKTOP.REGULAR_GAME_ITEM_HEIGHT_BOTH": "RegularGameItemHeightInBothOnDesktop",
  "LAYOUT.IMAGE_SIZES.DESKTOP.LARGE_GAME_ITEM_WIDTH_BOTH": "LargeGameItemWidthInBothOnDesktop",
  "LAYOUT.IMAGE_SIZES.DESKTOP.LARGE_GAME_ITEM_HEIGHT_BOTH": "LargeGameItemHeightInBothOnDesktop",
  "LAYOUT.IMAGE_SIZES.DESKTOP.SQUARE_GAME_ITEM_WIDTH_BOTH": "SquareGameItemWidthInBothOnDesktop",
  "LAYOUT.IMAGE_SIZES.DESKTOP.SQUARE_GAME_ITEM_HEIGHT_BOTH": "SquareGameItemHeightInBothOnDesktop",
  "LAYOUT.IMAGE_SIZES.DESKTOP.HORIZONTAL_GAME_ITEM_WIDTH_BOTH": "HorizontalGameItemWidthInBothOnDesktop",
  "LAYOUT.IMAGE_SIZES.DESKTOP.HORIZONTAL_GAME_ITEM_HEIGHT_BOTH": "HorizontalGameItemHeightInBothOnDesktop",
  "LAYOUT.IMAGE_SIZES.DESKTOP.VERTICAL_GAME_ITEM_WIDTH_BOTH": "VerticalGameItemWidthInBothOnDesktop",
  "LAYOUT.IMAGE_SIZES.DESKTOP.VERTICAL_GAME_ITEM_HEIGHT_BOTH": "VerticalGameItemHeightInBothOnDesktop",
  "LAYOUT.IMAGE_SIZES.DESKTOP.ANY_LOGO_WIDTH_BOTH": "LogoWidthInBothOnDesktop",
  "LAYOUT.IMAGE_SIZES.DESKTOP.ANY_LOGO_HEIGHT_BOTH": "LogoHeightInBothOnDesktop",
  "LAYOUT.IMAGE_SIZES.DESKTOP.ANY_FOOTER_IMAGE_HEIGHT_BOTH": "FooterImageHeightInBothOnDesktop",
  "LAYOUT.IMAGE_SIZES.DESKTOP.ANY_BACKGROUND_WIDTH_SERVER": "BackgroundWidthInServerOnDesktop",
  "LAYOUT.IMAGE_SIZES.DESKTOP.ANY_BACKGROUND_WIDTH_BROWSER": "BackgroundWidthInBrowserOnDesktop",
  "LAYOUT.IMAGE_SIZES.DESKTOP.CARD_PROMOTION_WIDTH_BOTH": "CardPromotionWidthInBothOnDesktop",
  "LAYOUT.IMAGE_SIZES.DESKTOP.CARD_PROMOTION_HEIGHT_BOTH": "CardPromotionHeightInBothOnDesktop",
  "LAYOUT.IMAGE_SIZES.DESKTOP.DEFAULT_PROMOTION_WIDTH_BOTH": "DefaultPromotionWidthInBothOnDesktop",
  "LAYOUT.IMAGE_SIZES.DESKTOP.DEFAULT_PROMOTION_HEIGHT_BOTH": "DefaultPromotionHeightInBothOnDesktop",
  "LAYOUT.IMAGE_SIZES.MOBILE.BLOCK_SLIDER_WIDTH_SERVER": "BlockSliderWidthInServerOnMobile",
  "LAYOUT.IMAGE_SIZES.MOBILE.BLOCK_SLIDER_WIDTH_BROWSER": "BlockSliderWidthInBrowserOnMobile",
  "LAYOUT.IMAGE_SIZES.MOBILE.FLUID_SLIDER_WIDTH_SERVER": "FluidSliderWidthInServerOnMobile",
  "LAYOUT.IMAGE_SIZES.MOBILE.FLUID_SLIDER_WIDTH_BROWSER": "FluidSliderWidthInBrowserOnMobile",
  "LAYOUT.IMAGE_SIZES.MOBILE.FULL_SLIDER_WIDTH_SERVER": "FullSliderWidthInServerOnMobile",
  "LAYOUT.IMAGE_SIZES.MOBILE.FULL_SLIDER_WIDTH_BROWSER": "FullSliderWidthInBrowserOnMobile",
  "LAYOUT.IMAGE_SIZES.MOBILE.REGULAR_GAME_ITEM_WIDTH_BOTH": "RegularGameItemWidthInBothOnMobile",
  "LAYOUT.IMAGE_SIZES.MOBILE.REGULAR_GAME_ITEM_HEIGHT_BOTH": "RegularGameItemHeightInBothOnMobile",
  "LAYOUT.IMAGE_SIZES.MOBILE.LARGE_GAME_ITEM_WIDTH_BOTH": "LargeGameItemWidthInBothOnMobile",
  "LAYOUT.IMAGE_SIZES.MOBILE.LARGE_GAME_ITEM_HEIGHT_BOTH": "LargeGameItemHeightInBothOnMobile",
  "LAYOUT.IMAGE_SIZES.MOBILE.SQUARE_GAME_ITEM_WIDTH_BOTH": "SquareGameItemWidthInBothOnMobile",
  "LAYOUT.IMAGE_SIZES.MOBILE.SQUARE_GAME_ITEM_HEIGHT_BOTH": "SquareGameItemHeightInBothOnMobile",
  "LAYOUT.IMAGE_SIZES.MOBILE.HORIZONTAL_GAME_ITEM_WIDTH_BOTH": "HorizontalGameItemWidthInBothOnMobile",
  "LAYOUT.IMAGE_SIZES.MOBILE.HORIZONTAL_GAME_ITEM_HEIGHT_BOTH": "HorizontalGameItemHeightInBothOnMobile",
  "LAYOUT.IMAGE_SIZES.MOBILE.VERTICAL_GAME_ITEM_WIDTH_BOTH": "VerticalGameItemWidthInBothOnMobile",
  "LAYOUT.IMAGE_SIZES.MOBILE.VERTICAL_GAME_ITEM_HEIGHT_BOTH": "VerticalGameItemHeightInBothOnMobile",
  "LAYOUT.IMAGE_SIZES.MOBILE.ANY_LOGO_WIDTH_BOTH": "LogoWidthInBothOnMobile",
  "LAYOUT.IMAGE_SIZES.MOBILE.ANY_LOGO_HEIGHT_BOTH": "LogoHeightInBothOnMobile",
  "LAYOUT.IMAGE_SIZES.MOBILE.ANY_FOOTER_IMAGE_HEIGHT_BOTH": "FooterImageHeightInBothOnMobile",
  "LAYOUT.IMAGE_SIZES.MOBILE.ANY_BACKGROUND_WIDTH_SERVER": "BackgroundWidthInServerOnMobile",
  "LAYOUT.IMAGE_SIZES.MOBILE.ANY_BACKGROUND_WIDTH_BROWSER": "BackgroundWidthInBrowserOnMobile",
  "LAYOUT.IMAGE_SIZES.MOBILE.CARD_PROMOTION_WIDTH_BOTH": "CardPromotionWidthInBothOnMobile",
  "LAYOUT.IMAGE_SIZES.MOBILE.CARD_PROMOTION_HEIGHT_BOTH": "CardPromotionHeightInBothOnMobile",
  "LAYOUT.IMAGE_SIZES.MOBILE.DEFAULT_PROMOTION_WIDTH_BOTH": "DefaultPromotionWidthInBothOnMobile",
  "LAYOUT.IMAGE_SIZES.MOBILE.DEFAULT_PROMOTION_HEIGHT_BOTH": "DefaultPromotionHeightInBothOnMobile",
  HAS_PICTURE_IN_PICTURE_MODE: "HasPictureInPictureMode",
  USER_CAN_CHANGE_CURRENCY: "UserCanChangeCurrency",
  "LIMITS.HAS_RESPONSIBLE_GAMBLING": "HasResponsibleGaming",
  DOCUMENT_ISSUING_AUTHORITY_IN_NEW_DOCUMENT: "HasDocumentIssuingAuthority",
  DOCUMENT_ISSUING_PLACE_IN_NEW_DOCUMENT: "HasDocumentIssuingPlace",
  DOCUMENT_ISSUE_DATE_IN_NEW_DOCUMENT: "HasDocumentIssueDate",
  EXTERNAL_SERVICES: "ExternalServices",
  SUPPORT_EMAIL: "DefaultSupportEmail",
  HAS_DEMO_PLAY: "HasDemoPlay",
  HAS_COOKIE_BANNER: "HasCookieBanner",
  HAS_WELCOME_PAGE: "HasWelcomePage",
  SCROLL_TO_TOP: "HasScrollToTop",
  TOURNAMENTS_GAME_ID: "TournamentsGameId",
  REGISTRATION_MIN_AGE: "MinAgeForRegistration",
  PAYMENT_INTEGRATION: "PaymentIntegration",
  "REGISTRATION.KYC_POPUP": "HasKycPopup",
  "REGISTRATION.SHOW_SUCCESS_POPUP_BUTTON": "ShowDepositButtonInRegistrationSuccessPopup",
  "REGISTRATION.REDIRECT_AFTER_LOGIN_URL": "PageToRedirectAfterRegistration",
  DEFAULT_COUNTRY_DIAL_IN: "DialCodeForUserIdentifier",
  PASSWORD_EXPIRATION_DAYS: "PasswordExpirationDays",
  SESSION_EXPIRATION_TIME: "SessionTerminationDelay",
  RESTRICTED_SESSION_LIMIT: "NeedConfirmationToActivateSessionLimit",
  KYC_PROVIDER: "KycProvider",
  "PROVIDERS.JUMIO.PROVIDER_ID": "KycProviderOptions.Jumio.ProviderId",
  "PROVIDERS.JUMIO.WORKFLOW_ID": "KycProviderOptions.Jumio.WorkflowId",
  "PROVIDERS.JUMIO.LOCALE_MAP": "KycProviderOptions.Jumio.LocaleMap",
  REDIRECT_BY_COUNTRY: "RedirectByCountry",
  DOCUMENT_ISSUING_AUTHORITIES: "DocumentIssuingAuthoritiesByCountry",
  "LIMITS.LIMIT_ACTIVATION_TIME": "HoursNeededForLimitActivation",
  "LIMITS.LIMIT_CANCELATION_TIME": "HoursNeededForLimitCancellation",
  "LIMITS.SELF_SUSPEND_TIMES": "OptionsForSelfSuspensionInHours",
  "LIMITS.ACTIVITY_CHECK_TIMES": "OptionsForActivityCheckInMinutes",
  "LIMITS.SESSION_LIMITATION_TIMES": "OptionsForSessionLimitationInMinutes",
  "LIMITS.ACTIVITY_CHECK_DIFF_TIME": "ReservedSecondsForActivityCheck",
  "GAME.OPEN_STRATEGY": "GameOpenStrategy",
  "GAME.POPUP_WIDTH": "GamePopupWidth",
  "GAME.POPUP_HEIGHT": "GamePopupHeight",
  "SERVICES.UFG": "UserFavoriteGamesProviderID",
  "SERVICES.RPG": "RecentlyPlayedGamesProviderID",
  "SERVICES.DOC": "DocumentUploadProviderID",
  "SERVICES.SIS": "SingularIntegrationSystemProviderID",
  "SERVICES.PAY": "PaymentsProviderID",
  "THEMES.LIST": "ListOfThemes",
  "THEMES.DEFAULT": "DefaultTheme",
  "THEMES.PALETTE": "DefaultPalette",
  "TRANSACTION_HISTORY.SUPPORTED_TYPES": "SupportedTransactionTypes",
  "TRANSACTION_HISTORY.SUPPORTED_STATUSES": "SupportedTransactionStatuses",
  "TRANSACTION_HISTORY.SUPPORTED_PROVIDERS": "SupportedTransactionProviders",
  "UTM.TTL": "UtmTtl",
  "UTM.MAPPING": "UtmMapping",
  "CORE_DOCUMENT.DEFAULT_TYPE": "DefaultDocumentTypeId",
  HIDDEN_COUNTRIES: "ListOfHiddenCountries",
  DEBUG: "Debug",
  USER_CAN_CHANGE_EMAIL: "UserCanChangeEmail",
  USER_CAN_CHANGE_MOBILE: "UserCanChangeMobile",
  USER_CAN_CHANGE_ADDRESS: "UserCanChangeAddress",
  "REGISTRATION.SHOULD_VERIFY_ADDRESS": "UserShouldVerifyAddress",
  HAS_VOICE_CALL_NOTIFICATIONS: "HasVoiceCallNotifications",
  HAS_EMAIL_NOTIFICATIONS: "HasEmailNotifications",
  HAS_SMS_NOTIFICATIONS: "HasSmsNotifications",
  "LIMITS.SINGLE_ACTIVITY_CHECK_TIME": "FrozenTimeOfActivityCheck",
  HAS_TELEPHONE_CODE: "HasTelephoneCode",
  HAS_HIGH_SECURITY: "HasHighSecurity",
  "LIMITS.HAS_DEPOSIT_LIMIT": "HasDepositLimit",
  "LIMITS.HAS_WAGER_LIMIT": "HasWagerLimit",
  "LIMITS.HAS_LOSS_LIMIT": "HasLossLimit",
  "LIMITS.DEPOSIT_LIMIT_RANGE": "DepositLimitRange",
  "LIMITS.WAGER_LIMIT_RANGE": "WagerLimitRange",
  "LIMITS.LOSS_LIMIT_RANGE": "LossLimitRange",
  "CORE_DOCUMENT.FIELDS": "DocumentFields",
  "CORE_DOCUMENT.UPLOAD_FORM": "DocumentUploadForm",
  "CORE_DOCUMENT.SUPPORTED_TYPES": "SupportedDocumentTypes",
  "CORE_DOCUMENT.TYPES": "ListOfDocumentTypes",
  "CORE_DOCUMENT.REQUIRED_TYPES": "RequiredDocumentTypes",
  USER_ADDITIONAL_DATA_FIELDS: "AdditionalDataFieldsOfUser",
  "REGISTRATION.KYC_STEPS": "KycSteps",
  USER_ADDRESS_FIELDS: "AddressFields"
};
var transform = (obj) => {
  const workObj = dotToObj(JSON.parse(obj));
  const newObj = {};
  const missingKeys = [];
  Object.entries(schema).forEach(([dottedKey, newKey]) => {
    const objNesting = dottedKey.split(".");
    const value = objValueByKeyArray(workObj, objNesting);
    if (value !== void 0) {
      if (newKey === "DocumentFields") {
        newObj[newKey] = transformDocumentFields(value);
      } else if (newKey === "DocumentUploadForm") {
        newObj[newKey] = transformDocumentUploadForm(value);
      } else {
        newObj[newKey] = value;
      }
    } else {
      missingKeys.push({ oldKey: dottedKey, newKey });
    }
  });
  return {
    result: newObj,
    missingKeys
  };
};
function transformDocumentFields(value) {
  const transformedValue = {};
  Object.entries(value).forEach(([docType, fields]) => {
    const fieldObj = {};
    if ("HAS_ID" in fields) {
      fieldObj.HasId = fields.HAS_ID;
    }
    if ("HAS_NUMBER" in fields) {
      fieldObj.HasNumber = fields.HAS_NUMBER;
    }
    if ("INPUT_LABEL" in fields) {
      fieldObj.InputLabel = fields.INPUT_LABEL;
    }
    if ("ACCEPTED_FILE_TYPES" in fields) {
      fieldObj.AcceptedFileTypes = fields.ACCEPTED_FILE_TYPES;
    }
    transformedValue[docType] = fieldObj;
  });
  return transformedValue;
}
function transformDocumentUploadForm(value) {
  const transformedValue = {};
  Object.entries(value).forEach(([docType, { IMAGES }]) => {
    const imagesArr = IMAGES.map((image) => {
      const newImg = {};
      if ("TYPE" in image) {
        newImg.type = image.TYPE;
      }
      if ("LABEL" in image) {
        newImg.label = image.LABEL;
      }
      if ("REQUIRED" in image) {
        newImg.required = image.ACCEPTED_FILE_TYPES;
      }
      return newImg;
    });
    transformedValue[docType] = {
      images: imagesArr
    };
  });
  return transformedValue;
}
var configExample = {
  LAYOUT: {
    COMPONENTS: {
      HEADER: {
        AUTH_FORM_TYPE: "form",
        REGISTER_BUTTON: true,
        SOCIAL_BUTTONS: false,
        LANGUAGE_SWITCHER: true,
        MENU_INTEGRATED: false,
        REGISTER_BUTTON_MOBILE: true,
        MOBILE_HEADER_BALANCE: true
      },
      GAME_LIST: {
        FILTER: { ICON_POSITION: "top" },
        ITEM: { STYLE: "full", SHOW_PROVIDER: false }
      },
      REGISTER: { HAS_CONTAINER: true, FORM_ALIGNMENT: "center", SOCIAL_SERVICES_POSITION: "none" },
      PROFILE: {
        USER_MENU_POSITION: "top",
        TRANSACTION_HISTORY: { FILTER_TYPE: "dropdown" },
        PAYMENTS_LIST_OPENED: "false"
      }
    },
    COMMON: { INPUT: { LABEL: "top" } },
    POPUPS: { LOGIN: { AUTH_FORM: true, REGISTER_BUTTON: true, SOCIAL_SERVICES_POSITION: "none" } },
    IMAGE_SIZES: {
      DESKTOP: {
        BLOCK_SLIDER_WIDTH_BOTH: 960,
        BLOCK_SLIDER_HEIGHT_BOTH: 386,
        FLUID_SLIDER_WIDTH_SERVER: 1920,
        FLUID_SLIDER_WIDTH_BROWSER: "100%",
        FLUID_SLIDER_HEIGHT_BOTH: 386,
        FULL_SLIDER_WIDTH_SERVER: 1920,
        FULL_SLIDER_WIDTH_BROWSER: "100%",
        REGULAR_GAME_ITEM_WIDTH_BOTH: 232,
        REGULAR_GAME_ITEM_HEIGHT_BOTH: 172,
        LARGE_GAME_ITEM_WIDTH_BOTH: 474,
        LARGE_GAME_ITEM_HEIGHT_BOTH: 354,
        SQUARE_GAME_ITEM_WIDTH_BOTH: 474,
        SQUARE_GAME_ITEM_HEIGHT_BOTH: 354,
        HORIZONTAL_GAME_ITEM_WIDTH_BOTH: 474,
        HORIZONTAL_GAME_ITEM_HEIGHT_BOTH: 172,
        VERTICAL_GAME_ITEM_WIDTH_BOTH: 232,
        VERTICAL_GAME_ITEM_HEIGHT_BOTH: 354,
        ANY_LOGO_WIDTH_BOTH: 238,
        ANY_LOGO_HEIGHT_BOTH: 53,
        ANY_FOOTER_IMAGE_HEIGHT_BOTH: 30,
        ANY_BACKGROUND_WIDTH_SERVER: 1920,
        ANY_BACKGROUND_WIDTH_BROWSER: "100%",
        CARD_PROMOTION_WIDTH_BOTH: 320,
        CARD_PROMOTION_HEIGHT_BOTH: 194,
        DEFAULT_PROMOTION_WIDTH_BOTH: 610,
        DEFAULT_PROMOTION_HEIGHT_BOTH: 281
      },
      MOBILE: {
        BLOCK_SLIDER_WIDTH_SERVER: 414,
        BLOCK_SLIDER_WIDTH_BROWSER: "100%",
        FLUID_SLIDER_WIDTH_SERVER: 414,
        FLUID_SLIDER_WIDTH_BROWSER: "100%",
        FULL_SLIDER_WIDTH_SERVER: 414,
        FULL_SLIDER_WIDTH_BROWSER: "100%",
        REGULAR_GAME_ITEM_WIDTH_BOTH: 232,
        REGULAR_GAME_ITEM_HEIGHT_BOTH: 172,
        LARGE_GAME_ITEM_WIDTH_BOTH: 474,
        LARGE_GAME_ITEM_HEIGHT_BOTH: 354,
        SQUARE_GAME_ITEM_WIDTH_BOTH: 474,
        SQUARE_GAME_ITEM_HEIGHT_BOTH: 354,
        HORIZONTAL_GAME_ITEM_WIDTH_BOTH: 474,
        HORIZONTAL_GAME_ITEM_HEIGHT_BOTH: 172,
        VERTICAL_GAME_ITEM_WIDTH_BOTH: 232,
        VERTICAL_GAME_ITEM_HEIGHT_BOTH: 354,
        ANY_LOGO_WIDTH_BOTH: 198,
        ANY_LOGO_HEIGHT_BOTH: 44,
        ANY_FOOTER_IMAGE_HEIGHT_BOTH: 24,
        ANY_BACKGROUND_WIDTH_SERVER: 414,
        ANY_BACKGROUND_WIDTH_BROWSER: "100%",
        CARD_PROMOTION_WIDTH_BOTH: 352,
        CARD_PROMOTION_HEIGHT_BOTH: 214,
        DEFAULT_PROMOTION_WIDTH_BOTH: 374,
        DEFAULT_PROMOTION_HEIGHT_BOTH: 247
      }
    }
  },
  APP: { NAME: "Singular DEV", URL: "https://newsite.singulardev.uk" },
  SEO: {
    DEFAULT_TITLE: "The most diverse and fun gaming site to play at.",
    DEFAULT_DESCRIPTION: "The most diverse and fun gaming site to play at. (Description)",
    DEFAULT_HEADING: "The most diverse and fun gaming site to play at. (About)",
    DEFAULT_KEYWORDS: "casino,betting,gaming,gambling",
    DEFAULT_IMAGE: "https://newstatic.singulardev.uk/website/fb_broken.jpg"
  },
  I18N: {
    AVAILABLE_LANGUAGES: [
      { code: "ka", culture: "ge-ka", name: "Georgian", alpha_2_code: "GE" },
      { code: "ru", culture: "ru-ru", name: "Russian", alpha_2_code: "RU" },
      { code: "en", culture: "en-en", name: "English", alpha_2_code: "EN" },
      { code: "fr", culture: "fr-fr", name: "French", alpha_2_code: "FR" }
    ],
    DEFAULT_LANGUAGE: { code: "en", culture: "en-en", name: "English", alpha_2_code: "EN" }
  },
  DEFAULT_CURRENCY_ID: 3,
  SUPPORTED_CURRENCIES: [
    26,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    15,
    99,
    98,
    95,
    96,
    16,
    1,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    100
  ],
  CURRENCIES: {
    DATA: {
      1: "KZT",
      2: "GEL",
      3: "USD",
      4: "EUR",
      5: "GBP",
      6: "RUB",
      7: "UAH",
      8: "AMD",
      9: "NGN",
      11: "TMT",
      12: "TLR",
      15: "THB",
      16: "GHS",
      17: "BYN",
      18: "MGA",
      19: "KES",
      20: "ZAR",
      21: "RWF",
      22: "TZS",
      23: "UGX",
      24: "MYR",
      25: "MKD",
      26: "HUF",
      95: "mBTC",
      96: "uBTC",
      99: "BTC"
    },
    PARAMS: {
      KZT: { symbol: "\u20B8", position: "start", separated: true },
      GEL: { symbol: "\u20BE", position: "end", separated: true },
      USD: { symbol: "$", position: "start", separated: false },
      EUR: { symbol: "\u20AC", position: "start", separated: false },
      GBP: { symbol: "\xA3", position: "start", separated: false },
      RUB: { symbol: "\u20BD", position: "end", separated: false },
      UAH: { symbol: "\u20B4", position: "start", separated: true },
      AMD: { symbol: "\u058F", position: "end", separated: false },
      NGN: { symbol: "\u20A6", position: "start", separated: false },
      TMT: { symbol: "TMT", position: "end", separated: true },
      TLR: { symbol: "\u20BA", position: "start", separated: false },
      THB: { symbol: "\u0E3F", position: "start", separated: false },
      GHS: { symbol: "GH\u20B5", position: "start", separated: false },
      BYN: { symbol: "Br", position: "end", separated: true },
      MGA: { symbol: "Ar", position: "start", separated: true },
      KES: { symbol: "KSh", position: "start", separated: false },
      ZAR: { symbol: "R", position: "start", separated: false },
      RWF: { symbol: "FRw", position: "start", separated: false },
      TZS: { symbol: "TSh", position: "start", separated: false },
      UGX: { symbol: "UGX", position: "start", separated: false },
      MYR: { symbol: "RM", position: "start", separated: false },
      mBTC: { symbol: "mBTC", position: "end", separated: true },
      uBTC: { symbol: "\u03BCBTC", position: "end", separated: true },
      BTC: { symbol: "\u20BF", position: "start", separated: false },
      MKD: { symbol: "\u0434\u0435\u043D", position: "start", separated: false },
      HUF: { symbol: "Ft", position: "end", separated: true }
    },
    SUPPORTED: [6, 7, 16, 17, 2, 1, 26]
  },
  DEFAULT_COUNTRY_ID: 268,
  DEFAULT_COUNTRY_DIAL_IN: null,
  REDIRECT_BY_COUNTRY: [],
  SUPPORTED_CHANNELS: [1, 2, 4],
  SUPPORTED_DOCUMENT_TYPES: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
  SUPPORTED_TRANSACTION_TYPES: ["", 0, 1],
  DEFAULT_STATUS_ID: 13,
  MOBILE_HEADER_BALANCE: true,
  CORE_STATUSES: {
    0: "Test User",
    1: "Registered",
    2: "Verified",
    3: "Full Block",
    4: "Game Block",
    5: "Withdraw Blocked",
    6: "VIP",
    7: "Verified 50",
    8: "Verified 100",
    9: "Verified 125",
    10: "Verified 150",
    11: "Verified 200",
    12: "test_status_1",
    13: "test_status_2",
    21: "Regulatory Excluded",
    22: "Regulatory Suspicious",
    99: "Temp Block",
    100: "LAZARE_STATUS",
    103: "WARRIOR_TESTER",
    106: "WARRIOR_TESTER",
    109: "WARRIOR_TESTER",
    112: "WARRIOR_TESTER",
    115: "WARRIOR_TESTER",
    118: "WARRIOR_TESTER",
    121: "WARRIOR_TESTER",
    124: "WARRIOR_TESTER",
    127: "WARRIOR_TESTER",
    130: "WARRIOR_TESTER",
    133: "WARRIOR_TESTER"
  },
  CORE_DOCUMENT: {
    TYPES: {
      1: "ID_CARD",
      2: "PASSPORT",
      3: "HOME_REGISTRY",
      4: "DRIVING_LICENSE",
      5: "WARRANT",
      6: "FACE_ID",
      7: "OTHER_ID",
      8: "PROOF_OF_ADDRESS",
      9: "BANK_STATEMENT",
      10: "SCAN_OF_CARD",
      11: "SCREENSHOT_OF_EWALLET",
      12: "SOURCE_OF_FUNDS",
      13: "OTHER_DOCUMENTS",
      14: "BANK_ACCOUNT_ID",
      15: "TEST_TYPE"
    },
    FIELDS: {
      ID_CARD: { HAS_ID: true, HAS_NUMBER: false },
      PASSPORT: { HAS_ID: true, HAS_NUMBER: true },
      HOME_REGISTRY: { HAS_ID: false, HAS_NUMBER: true },
      DRIVING_LICENSE: { HAS_ID: false, HAS_NUMBER: true },
      WARRANT: { HAS_ID: false, HAS_NUMBER: true },
      FACE_ID: { HAS_ID: true, HAS_NUMBER: false },
      OTHER_ID: { HAS_ID: true, HAS_NUMBER: false },
      PROOF_OF_ADDRESS: { HAS_ID: false, HAS_NUMBER: true },
      BANK_STATEMENT: { HAS_ID: false, HAS_NUMBER: true },
      SCAN_OF_CARD: { HAS_ID: false, HAS_NUMBER: true },
      SCREENSHOT_OF_EWALLET: { HAS_ID: false, HAS_NUMBER: true },
      SOURCE_OF_FUNDS: { HAS_ID: false, HAS_NUMBER: true },
      OTHER_DOCUMENTS: { HAS_ID: false, HAS_NUMBER: true },
      BANK_ACCOUNT_ID: { HAS_ID: true, HAS_NUMBER: true, INPUT_LABEL: "BANK_ACCOUNT_ID" }
    },
    UPLOAD_FORM: {
      DEFAULT: {
        IMAGES: [
          { LABEL: "DOCUMENT_FRONT", TYPE: "SCAN" },
          { LABEL: "DOCUMENT_BACK", TYPE: "SCAN" }
        ]
      },
      PASSPORT: {
        IMAGES: [
          { LABEL: "PAGE_31", TYPE: "SCAN" },
          { LABEL: "PAGE_32_33", TYPE: "SCAN" },
          { LABEL: "PAGE_WITH_THE_LAST_REGISTRATION_ADDRESS", TYPE: "SCAN" },
          { LABEL: "SELFIE_WITH_PASSPORT_PAGE_32_33", TYPE: "LIVENESS" }
        ]
      },
      RESIDENCE_PERMIT: {
        IMAGES: [
          { LABEL: "PAGE_15", TYPE: "SCAN" },
          { LABEL: "PAGE_16_17", TYPE: "SCAN" },
          { LABEL: "PAGE_WITH_THE_LAST_REGISTRATION_ADDRESS", TYPE: "SCAN" },
          { LABEL: "SELFIE_WITH_PASSPORT_PAGE_16_17", TYPE: "LIVENESS" }
        ]
      }
    },
    DEFAULT: { DOCUMENT_TYPE: "1" }
  },
  DOCUMENT_ISSUING_AUTHORITIES: { 7: ["Public Service Hall", "Other"], 16: [] },
  DOCUMENT_ISSUING_AUTHORITY_IN_NEW_DOCUMENT: true,
  DOCUMENT_ISSUING_PLACE_IN_NEW_DOCUMENT: true,
  DOCUMENT_ISSUE_DATE_IN_NEW_DOCUMENT: true,
  ENDPOINTS: {
    STATIC: "https://newstatic.singulardev.uk/website",
    PAYMENTS_SDK: "https://newstatic.singulardev.uk/payments-sdk",
    SIS: "https://siswebapi.singulardev.uk/api/v1/init",
    CANON: "https://mediaproxy.singulardev.uk",
    BACKOFFICE: "https://backoffice.singulardev.uk",
    JACKPOT: "https://jackpot.singulardev.uk",
    SIS_GAMES: "https://sisgames.singulardev.uk",
    BASE: "https://singulardev.uk",
    API: "https://websiteapi.singulardev.uk",
    API_SERVICE: "https://websiteapiv2:8080",
    SPORTSBOOK: "https://sports.singularqa.uk",
    CORE_API: "https://coreapi.singulardev.uk",
    AUTH_PROXY: "https://authproxy.singulardev.uk",
    TEST_ENDPINT: "https://test.endpoint.test",
    SAM: "https://sam.singulardev.uk",
    SBO_API: "https://backofficeapi.singulardev.uk",
    UBO_API: "https://ubo-api.singulardev.uk",
    SIS_PAYMENTS: "https://sispay.singulardev.uk",
    WEB_SITE_DOMAIN: "https://singulardev.uk",
    IMAGE_HOST: "https://https://backoffice.singulardev.uk",
    IMAGE_STATIC_URL: "https://https://newstatic.singulardev.uk",
    AGENTS_API: "https://https://retailapi.singulardev.uk/",
    GAME_DIRECTORY_MANAGER: "https://https://gamedirectory.singulardev.uk"
  },
  REGISTRATION: {
    KYC_POPUP: true,
    KYC_STEPS: [
      { label: "MOBILE_NUMBER", visible: true },
      { label: "EMAIL_ADDRESS", visible: true },
      {
        label: "PERSONAL_DETAILS",
        visible: true,
        fields: {
          Name: true,
          Surname: true,
          MaidenName: true,
          MotherMaidenName: true,
          PlaceOfBirth: true,
          Gender: true
        }
      },
      {
        label: "ADDRESS",
        visible: true,
        fields: {
          AddressLine1: true,
          AddressLine2: false,
          AddressLine3: false,
          Town: true,
          County: false,
          Region: true,
          PostCode: true
        }
      },
      {
        label: "DOCUMENTS",
        visible: true,
        fields: {
          DocumentCountryID: false,
          DocumentIssueDate: true,
          DocumentExpirationDate: true,
          DocumentIssuingPlace: false,
          DocumentIssuingAuthority: true
        }
      }
    ]
  },
  PAYMENT_SDK: { DEPOSIT_URL: null, PROVIDER_ID: null, WITHDRAW_URL: null },
  USER_CAN_CHANGE_CURRENCY: true,
  HAS_PICTURE_IN_PICTURE_MODE: true,
  HAS_RESPONSIBLE_GAMBLING: true,
  LIMIT_CANCELLATION_TIME: 90,
  SERVICES: {
    RPG: "3dc89bbf-ff3f-49bd-a346-ece5bb590af3",
    UFG: "18ae9931-fa38-478b-9220-84653bb9f99a",
    CBS: "11e91f20-11f2-3010-9d75-00505685245f",
    DOC: "11e901fc-4b30-1720-a76c-000c2976934b",
    SIS: "11e844a5-1c28-83f0-8768-000c29034530",
    PAY: "11e91f20-11f2-3010-9d75-00505685245f"
  },
  THEMES: {
    LIST: ["light", "dark"],
    DEFAULT: "dark",
    COLORS: { light: "#f0f0f0", dark: "#101010" },
    PALETTE: "singular"
  },
  THEME_LIST: ["light", "dark"],
  DEFAULT_THEME: "dark",
  DEFAULT_PALETTE: "singular",
  EXTERNAL_SERVICES: null,
  SUPPORT_EMAIL: "support@singulardev.uk",
  GAME: { OPEN_STRATEGY: "page", POPUP_WIDTH: 990, POPUP_HEIGHT: 660 },
  HAS_DEMO_PLAY: true,
  HAS_COOKIE_BANNER: false,
  PASSWORD_EXPIRATION_DAYS: 30,
  SESSION_EXPIRATION_TIME: 900,
  HAS_WELCOME_PAGE: false,
  LIMIT_ACTIVATION_TIME: 24,
  LIMIT_CANCELATION_TIME: 24,
  SELF_SUSPEND_TIMES: [24, 168, 720],
  ACTIVITY_CHECK_TIMES: [5, 30, 60],
  ACTIVITY_CHECK_DIFF_TIME: 10,
  SESSION_LIMITATION_TIMES: [30, 60, 120],
  LIMITS: {
    HAS_RESPONSIBLE_GAMBLING: true,
    HAS_FINANCIAL_LIMITS: true,
    HAS_DEPOSIT_LIMIT: true,
    HAS_WAGER_LIMIT: true,
    HAS_LOSS_LIMIT: true,
    HAS_SELF_EXCLUSION: true,
    HAS_SELF_SUSPEND: true,
    HAS_ACTIVITY_CHECK: true,
    HAS_SESSION_LIMITATION: true,
    DEPOSIT_LIMIT_RANGE: [0, 100],
    WAGER_LIMIT_RANGE: [0, 50],
    LOSS_LIMIT_RANGE: [0, 25],
    LIMIT_ACTIVATION_TIME: 24,
    LIMIT_CANCELATION_TIME: 24,
    SELF_SUSPEND_TIMES: [24, 168, 720],
    ACTIVITY_CHECK_TIMES: [60],
    ACTIVITY_CHECK_DIFF_TIME: 10,
    SESSION_LIMITATION_TIMES: [30, 60, 120],
    SINGLE_ACTIVITY_CHECK_TIME: 60
  },
  ACTIVE_FINANCIAL_LIMIT_ALLOWANCE_INCREASE_NOT_ALLOWED: false,
  ACTIVE_SESSION_LIMIT_ALLOWANCE_INCREASE_NOT_ALLOWED: false
};
function csvPair(arr) {
  return [
    {
      oldKey: "OLD VERSION",
      newKey: "NEW VERSION"
    },
    ...arr
  ].map(({ oldKey, newKey }) => `${oldKey}%2C${newKey}`).join("%0A");
}
var Transformer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let input = JSON.stringify(configExample);
  let errorMessage = null;
  let transformedJson = JSON.stringify({}, null, 2);
  let missingKeysDownloadHref = "";
  let missingKeys = [];
  function transformConfig(value) {
    if (value) {
      if (!isJson(value)) {
        errorMessage = "You have entered invalid JSON. Please paste correct configuration object.";
        return;
      }
      errorMessage = null;
      const transformedValue = transform(value);
      transformedJson = JSON.stringify(transformedValue.result, null, 2);
      missingKeys = transformedValue.missingKeys;
      missingKeysDownloadHref = `data:application/octet-stream,${csvPair(missingKeys)}`;
    }
  }
  {
    transformConfig(input);
  }
  return `${errorMessage ? `<div class="${"flex items-center px-6 py-4 mb-6 text-red-500 bg-red-200 rounded-md"}"><svg viewBox="${"0 0 24 24"}" xmlns="${"http://www.w3.org/2000/svg"}" class="${"w-4 h-4 fill-current"}"><path d="${"M12 2h-.01c-5.53 0-10 4.47-10 10 0 5.52 4.47 10 10 9.99 5.52-.01 10-4.48 9.99-10.01 0-5.53-4.48-10-10-10zm2.71 11.29c.39.38.39 1.02 0 1.41h-.02c-.39.39-1.03.39-1.42 0l-.01-.01-1.29-1.3-1.29 1.3h-.01c-.39.39-1.03.39-1.42 0l-.01-.01a.999.999 0 01-.01-1.42v-.01l1.3-1.29-1.3-1.29-.01-.01a.99.99 0 010-1.42.99.99 0 011.42 0l1.29 1.3 1.29-1.3h-.01c.39-.4 1.02-.4 1.42-.01.39.39.39 1.02 0 1.42l-1.3 1.29z"}"></path></svg>
		<span class="${"ml-2 text-sm font-medium"}">${escape2(errorMessage)}</span></div>` : ``}

${missingKeys.length ? `<div class="${"flex items-center px-6 py-4 mb-6 text-yellow-500 bg-yellow-200 rounded-md"}"><svg viewBox="${"0 0 24 24"}" xmlns="${"http://www.w3.org/2000/svg"}" class="${"w-4 h-4 fill-current"}"><path d="${"M12 2h-.01c-5.53 0-10 4.47-10 10 0 5.52 4.47 10 10 9.99 5.52-.01 10-4.48 9.99-10.01 0-5.53-4.48-10-10-10zm2.71 11.29c.39.38.39 1.02 0 1.41h-.02c-.39.39-1.03.39-1.42 0l-.01-.01-1.29-1.3-1.29 1.3h-.01c-.39.39-1.03.39-1.42 0l-.01-.01a.999.999 0 01-.01-1.42v-.01l1.3-1.29-1.3-1.29-.01-.01a.99.99 0 010-1.42.99.99 0 011.42 0l1.29 1.3 1.29-1.3h-.01c.39-.4 1.02-.4 1.42-.01.39.39.39 1.02 0 1.42l-1.3 1.29z"}"></path></svg>
		<span class="${"ml-2 text-sm font-medium"}">There are some keys missing in the config you&#39;ve pasted. Scroll down to see them.
		</span></div>` : ``}

<textarea class="${"w-full px-2 py-1 border-2 border-gray-300 rounded h-80"}">${input || ""}</textarea>

<pre class="${"px-2 pt-1.5 pb-1 mt-6 bg-gray-200 border border-gray-300 rounded-md whitespace-pre-wrap max-h-96 overflow-scroll"}">${escape2(transformedJson)}</pre>

<div class="${"flex justify-center w-full mt-6"}"><button class="${[
    "px-4 py-1 text-white bg-purple-500 rounded-md hover:bg-purple-400",
    (!input ? "pointer-events-none" : "") + " " + (!input ? "opacity-60" : "")
  ].join(" ").trim()}" ${!input ? "disabled" : ""}>${`Copy`}</button></div>

${missingKeys.length ? `<div><hr class="${"my-4"}">

		<h2 class="${"text-xl font-bold"}">MISSING KEYS</h2>

		<div class="${"flex flex-wrap my-6 space-y-2 text-orange-500 bg-orange-200 rounded-md"}"><div class="${"flex items-center w-full space-x-2"}"><div class="${"w-2/3 px-1 font-medium"}">OLD VARIANT</div>
				<div class="${"w-1/3 px-1 font-medium"}">NEW VARIANT</div></div>

			${each(missingKeys, (setOfKeys) => `<div class="${"flex items-center w-full space-x-2"}"><div class="${"w-2/3 px-1 overflow-x-scroll bg-gray-200 border border-gray-300"}">${escape2(setOfKeys.oldKey)}</div>
					<div class="${"w-1/3 px-1 overflow-x-scroll bg-gray-200 border border-gray-300"}">${escape2(setOfKeys.newKey)}</div>
				</div>`)}</div></div>

	<div class="${"flex justify-center w-full my-6"}"><a class="${"px-4 py-1 text-white bg-purple-500 rounded-md hover:bg-purple-400"}"${add_attribute("href", missingKeysDownloadHref, 0)} download="${"missing-keys.csv"}">Download report
		</a></div>` : ``}`;
});
var prerender = true;
var Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${$$result.head += `${$$result.title = `<title>Home</title>`, ""}`, ""}

<section>${validate_component(Transformer, "Transformer").$$render($$result, {}, {}, {})}</section>`;
});
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Routes,
  prerender
});

// .svelte-kit/vercel/entry.js
init();
var entry_default = async (req, res) => {
  const { pathname, searchParams } = new URL(req.url || "", "http://localhost");
  let body;
  try {
    body = await getRawBody(req);
  } catch (err) {
    res.statusCode = err.status || 400;
    return res.end(err.reason || "Invalid request body");
  }
  const rendered = await render({
    method: req.method,
    headers: req.headers,
    path: pathname,
    query: searchParams,
    rawBody: body
  });
  if (rendered) {
    const { status, headers, body: body2 } = rendered;
    return res.writeHead(status, headers).end(body2);
  }
  return res.writeHead(404).end();
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */
