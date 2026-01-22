#!/usr/bin/env bun
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/lib/context.ts
var context_exports = {};
__export(context_exports, {
  getBaseContextTokens: () => getBaseContextTokens,
  getContextData: () => getContextData,
  readFirstLines: () => readFirstLines,
  readLastLines: () => readLastLines
});
import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join, normalize } from "node:path";
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
function estimateTokens(text) {
  return Math.round(text.length / 3.5);
}
async function safeReadFile(filePath, maxsizeMB) {
  try {
    const stats = await stat(filePath);
    const maxSizeBytes = maxsizeMB * 1024 * 1024;
    if (stats.size > maxSizeBytes) {
      console.error(
        `[statusline] File too large: ${filePath} (${Math.round(stats.size / 1024 / 1024)}MB > ${maxsizeMB}MB)`
      );
      return null;
    }
    return await readFile(filePath, "utf-8");
  } catch (error) {
    return null;
  }
}
async function readLastLines(filePath, maxLines) {
  const fileStats = await stat(filePath);
  if (fileStats.size < MAX_TRANSCRIPT_FILE_SIZE) {
    const content = await readFile(filePath, "utf-8");
    return content.split("\n").filter((line) => line.trim());
  }
  const lines = [];
  const rl = createInterface({
    input: createReadStream(filePath, { encoding: "utf-8" }),
    crlfDelay: Infinity
  });
  for await (const line of rl) {
    if (line.trim()) {
      lines.push(line);
      if (lines.length > maxLines) {
        lines.shift();
      }
    }
  }
  return lines;
}
async function readFirstLines(filePath, maxLines) {
  const fileStats = await stat(filePath);
  if (fileStats.size < MAX_TRANSCRIPT_FILE_SIZE) {
    const content = await readFile(filePath, "utf-8");
    const allLines = content.split("\n").filter((line) => line.trim());
    return allLines.slice(0, maxLines);
  }
  const lines = [];
  const rl = createInterface({
    input: createReadStream(filePath, { encoding: "utf-8" }),
    crlfDelay: Infinity
  });
  for await (const line of rl) {
    if (line.trim()) {
      lines.push(line);
      if (lines.length >= maxLines) {
        rl.close();
        break;
      }
    }
  }
  return lines;
}
async function getBaseContextTokens(baseContextPath) {
  const now = Date.now();
  if (baseContextCache && now - baseContextCache.timestamp < BASE_CONTEXT_CACHE_TTL) {
    return baseContextCache.tokens;
  }
  let totalTokens = 0;
  try {
    const normalizedBasePath = normalize(baseContextPath).replace(/^~/, homedir());
    const claudeMdPath = join(normalizedBasePath, "CLAUDE.md");
    const clauderulesPath = join(normalizedBasePath, ".clauderules");
    const rulesDir = join(normalizedBasePath, "rules");
    if (existsSync(claudeMdPath)) {
      const content = await safeReadFile(claudeMdPath, MAX_FILE_SIZE_MB);
      if (content) {
        totalTokens += estimateTokens(content);
      }
    }
    if (existsSync(clauderulesPath)) {
      const content = await safeReadFile(clauderulesPath, MAX_FILE_SIZE_MB);
      if (content) {
        totalTokens += estimateTokens(content);
      }
    }
    if (existsSync(rulesDir)) {
      try {
        const readDirRecursive = async (dir) => {
          const files = await readdir(dir);
          for (const file of files) {
            const filePath = join(dir, file);
            try {
              const stats = await stat(filePath);
              if (stats.isDirectory()) {
                await readDirRecursive(filePath);
              } else if (file.endsWith(".md")) {
                const content = await safeReadFile(filePath, MAX_FILE_SIZE_MB);
                if (content) {
                  totalTokens += estimateTokens(content);
                }
              }
            } catch {
            }
          }
        };
        await readDirRecursive(rulesDir);
      } catch {
      }
    }
    baseContextCache = { timestamp: now, tokens: totalTokens };
  } catch {
    totalTokens = 0;
  }
  return totalTokens;
}
async function getContextData(options) {
  const {
    transcriptPath,
    maxContextTokens,
    autocompactBufferTokens,
    useUsableContextOnly,
    overheadTokens,
    includeBaseContext,
    baseContextPath
  } = options;
  try {
    const lines = await readLastLines(transcriptPath, MAX_TRANSCRIPT_LINES);
    let transcriptChars = 0;
    let systemChars = 0;
    let messageCount = 0;
    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        if (entry.type === "progress" || entry.type === "file-history-snapshot") {
          continue;
        }
        if (entry.type === "user" || entry.type === "assistant") {
          const content = entry.content || "";
          if (Array.isArray(content)) {
            const nonThinkingContent = content.filter((c) => c.type !== "thinking");
            transcriptChars += JSON.stringify(nonThinkingContent).length;
          } else {
            transcriptChars += content.length;
          }
          messageCount++;
        } else if (entry.type === "tool_result" || entry.type === "tool_use") {
          const content = entry.content || entry.output || "";
          const input = entry.input || "";
          transcriptChars += content.length + input.length;
          messageCount++;
        }
      } catch {
        continue;
      }
    }
    const transcriptTokens = Math.round(transcriptChars / 3.5) || 0;
    let baseContextTokens = 0;
    if (includeBaseContext && baseContextPath) {
      try {
        baseContextTokens = await getBaseContextTokens(baseContextPath);
        if (!isFinite(baseContextTokens) || baseContextTokens < 0) {
          baseContextTokens = 0;
        }
      } catch {
        baseContextTokens = 0;
      }
    }
    const totalTokens = transcriptTokens + baseContextTokens + overheadTokens;
    let usableTokens = totalTokens;
    if (useUsableContextOnly) {
      usableTokens = Math.max(0, totalTokens - autocompactBufferTokens);
    }
    if (usableTokens === 0 && totalTokens > 0) {
      usableTokens = totalTokens;
    }
    const percentage = Math.min(
      100,
      Math.round((usableTokens || 0) / maxContextTokens * 100)
    ) || 0;
    const lastOutputTokens = null;
    return {
      tokens: usableTokens,
      percentage,
      lastOutputTokens,
      baseContext: baseContextTokens,
      // included in total
      transcriptContext: transcriptTokens,
      // messages + tools
      userTokens: transcriptTokens
      // user tokens only (excludes system)
    };
  } catch (error) {
    console.error(`[statusline] Error calculating context:`, error);
    return {
      tokens: null,
      percentage: null,
      lastOutputTokens: null
    };
  }
}
var baseContextCache, BASE_CONTEXT_CACHE_TTL, MAX_TRANSCRIPT_FILE_SIZE, MAX_TRANSCRIPT_LINES, MAX_FILE_SIZE_MB;
var init_context = __esm({
  "src/lib/context.ts"() {
    "use strict";
    baseContextCache = null;
    BASE_CONTEXT_CACHE_TTL = 6e4;
    MAX_TRANSCRIPT_FILE_SIZE = 5 * 1024 * 1024;
    MAX_TRANSCRIPT_LINES = 5e3;
    MAX_FILE_SIZE_MB = 1;
  }
});

// src/lib/features/limits.ts
var limits_exports = {};
__export(limits_exports, {
  getUsageLimits: () => getUsageLimits
});
async function getUsageLimits(enabled = true) {
  if (!enabled) {
    return {
      five_hour: null,
      seven_day: null
    };
  }
  try {
    return {
      five_hour: null,
      seven_day: null
    };
  } catch {
    return {
      five_hour: null,
      seven_day: null
    };
  }
}
var init_limits = __esm({
  "src/lib/features/limits.ts"() {
    "use strict";
  }
});

// node_modules/better-sqlite3/lib/util.js
var require_util = __commonJS({
  "node_modules/better-sqlite3/lib/util.js"(exports) {
    "use strict";
    exports.getBooleanOption = (options, key) => {
      let value = false;
      if (key in options && typeof (value = options[key]) !== "boolean") {
        throw new TypeError(`Expected the "${key}" option to be a boolean`);
      }
      return value;
    };
    exports.cppdb = /* @__PURE__ */ Symbol();
    exports.inspect = /* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom");
  }
});

// node_modules/better-sqlite3/lib/sqlite-error.js
var require_sqlite_error = __commonJS({
  "node_modules/better-sqlite3/lib/sqlite-error.js"(exports, module) {
    "use strict";
    var descriptor = { value: "SqliteError", writable: true, enumerable: false, configurable: true };
    function SqliteError(message, code) {
      if (new.target !== SqliteError) {
        return new SqliteError(message, code);
      }
      if (typeof code !== "string") {
        throw new TypeError("Expected second argument to be a string");
      }
      Error.call(this, message);
      descriptor.value = "" + message;
      Object.defineProperty(this, "message", descriptor);
      Error.captureStackTrace(this, SqliteError);
      this.code = code;
    }
    Object.setPrototypeOf(SqliteError, Error);
    Object.setPrototypeOf(SqliteError.prototype, Error.prototype);
    Object.defineProperty(SqliteError.prototype, "name", descriptor);
    module.exports = SqliteError;
  }
});

// node_modules/file-uri-to-path/index.js
var require_file_uri_to_path = __commonJS({
  "node_modules/file-uri-to-path/index.js"(exports, module) {
    var sep = __require("path").sep || "/";
    module.exports = fileUriToPath;
    function fileUriToPath(uri) {
      if ("string" != typeof uri || uri.length <= 7 || "file://" != uri.substring(0, 7)) {
        throw new TypeError("must pass in a file:// URI to convert to a file path");
      }
      var rest = decodeURI(uri.substring(7));
      var firstSlash = rest.indexOf("/");
      var host = rest.substring(0, firstSlash);
      var path = rest.substring(firstSlash + 1);
      if ("localhost" == host) host = "";
      if (host) {
        host = sep + sep + host;
      }
      path = path.replace(/^(.+)\|/, "$1:");
      if (sep == "\\") {
        path = path.replace(/\//g, "\\");
      }
      if (/^.+\:/.test(path)) {
      } else {
        path = sep + path;
      }
      return host + path;
    }
  }
});

// node_modules/bindings/bindings.js
var require_bindings = __commonJS({
  "node_modules/bindings/bindings.js"(exports, module) {
    var fs = __require("fs");
    var path = __require("path");
    var fileURLToPath3 = require_file_uri_to_path();
    var join4 = path.join;
    var dirname3 = path.dirname;
    var exists = fs.accessSync && function(path2) {
      try {
        fs.accessSync(path2);
      } catch (e) {
        return false;
      }
      return true;
    } || fs.existsSync || path.existsSync;
    var defaults = {
      arrow: process.env.NODE_BINDINGS_ARROW || " \u2192 ",
      compiled: process.env.NODE_BINDINGS_COMPILED_DIR || "compiled",
      platform: process.platform,
      arch: process.arch,
      nodePreGyp: "node-v" + process.versions.modules + "-" + process.platform + "-" + process.arch,
      version: process.versions.node,
      bindings: "bindings.node",
      try: [
        // node-gyp's linked version in the "build" dir
        ["module_root", "build", "bindings"],
        // node-waf and gyp_addon (a.k.a node-gyp)
        ["module_root", "build", "Debug", "bindings"],
        ["module_root", "build", "Release", "bindings"],
        // Debug files, for development (legacy behavior, remove for node v0.9)
        ["module_root", "out", "Debug", "bindings"],
        ["module_root", "Debug", "bindings"],
        // Release files, but manually compiled (legacy behavior, remove for node v0.9)
        ["module_root", "out", "Release", "bindings"],
        ["module_root", "Release", "bindings"],
        // Legacy from node-waf, node <= 0.4.x
        ["module_root", "build", "default", "bindings"],
        // Production "Release" buildtype binary (meh...)
        ["module_root", "compiled", "version", "platform", "arch", "bindings"],
        // node-qbs builds
        ["module_root", "addon-build", "release", "install-root", "bindings"],
        ["module_root", "addon-build", "debug", "install-root", "bindings"],
        ["module_root", "addon-build", "default", "install-root", "bindings"],
        // node-pre-gyp path ./lib/binding/{node_abi}-{platform}-{arch}
        ["module_root", "lib", "binding", "nodePreGyp", "bindings"]
      ]
    };
    function bindings(opts) {
      if (typeof opts == "string") {
        opts = { bindings: opts };
      } else if (!opts) {
        opts = {};
      }
      Object.keys(defaults).map(function(i2) {
        if (!(i2 in opts)) opts[i2] = defaults[i2];
      });
      if (!opts.module_root) {
        opts.module_root = exports.getRoot(exports.getFileName());
      }
      if (path.extname(opts.bindings) != ".node") {
        opts.bindings += ".node";
      }
      var requireFunc = typeof __webpack_require__ === "function" ? __non_webpack_require__ : __require;
      var tries = [], i = 0, l = opts.try.length, n, b, err;
      for (; i < l; i++) {
        n = join4.apply(
          null,
          opts.try[i].map(function(p) {
            return opts[p] || p;
          })
        );
        tries.push(n);
        try {
          b = opts.path ? requireFunc.resolve(n) : requireFunc(n);
          if (!opts.path) {
            b.path = n;
          }
          return b;
        } catch (e) {
          if (e.code !== "MODULE_NOT_FOUND" && e.code !== "QUALIFIED_PATH_RESOLUTION_FAILED" && !/not find/i.test(e.message)) {
            throw e;
          }
        }
      }
      err = new Error(
        "Could not locate the bindings file. Tried:\n" + tries.map(function(a) {
          return opts.arrow + a;
        }).join("\n")
      );
      err.tries = tries;
      throw err;
    }
    module.exports = exports = bindings;
    exports.getFileName = function getFileName(calling_file) {
      var origPST = Error.prepareStackTrace, origSTL = Error.stackTraceLimit, dummy = {}, fileName;
      Error.stackTraceLimit = 10;
      Error.prepareStackTrace = function(e, st) {
        for (var i = 0, l = st.length; i < l; i++) {
          fileName = st[i].getFileName();
          if (fileName !== __filename) {
            if (calling_file) {
              if (fileName !== calling_file) {
                return;
              }
            } else {
              return;
            }
          }
        }
      };
      Error.captureStackTrace(dummy);
      dummy.stack;
      Error.prepareStackTrace = origPST;
      Error.stackTraceLimit = origSTL;
      var fileSchema = "file://";
      if (fileName.indexOf(fileSchema) === 0) {
        fileName = fileURLToPath3(fileName);
      }
      return fileName;
    };
    exports.getRoot = function getRoot(file) {
      var dir = dirname3(file), prev;
      while (true) {
        if (dir === ".") {
          dir = process.cwd();
        }
        if (exists(join4(dir, "package.json")) || exists(join4(dir, "node_modules"))) {
          return dir;
        }
        if (prev === dir) {
          throw new Error(
            'Could not find module root given file: "' + file + '". Do you have a `package.json` file? '
          );
        }
        prev = dir;
        dir = join4(dir, "..");
      }
    };
  }
});

// node_modules/better-sqlite3/lib/methods/wrappers.js
var require_wrappers = __commonJS({
  "node_modules/better-sqlite3/lib/methods/wrappers.js"(exports) {
    "use strict";
    var { cppdb } = require_util();
    exports.prepare = function prepare(sql) {
      return this[cppdb].prepare(sql, this, false);
    };
    exports.exec = function exec2(sql) {
      this[cppdb].exec(sql);
      return this;
    };
    exports.close = function close() {
      this[cppdb].close();
      return this;
    };
    exports.loadExtension = function loadExtension(...args) {
      this[cppdb].loadExtension(...args);
      return this;
    };
    exports.defaultSafeIntegers = function defaultSafeIntegers(...args) {
      this[cppdb].defaultSafeIntegers(...args);
      return this;
    };
    exports.unsafeMode = function unsafeMode(...args) {
      this[cppdb].unsafeMode(...args);
      return this;
    };
    exports.getters = {
      name: {
        get: function name() {
          return this[cppdb].name;
        },
        enumerable: true
      },
      open: {
        get: function open() {
          return this[cppdb].open;
        },
        enumerable: true
      },
      inTransaction: {
        get: function inTransaction() {
          return this[cppdb].inTransaction;
        },
        enumerable: true
      },
      readonly: {
        get: function readonly() {
          return this[cppdb].readonly;
        },
        enumerable: true
      },
      memory: {
        get: function memory() {
          return this[cppdb].memory;
        },
        enumerable: true
      }
    };
  }
});

// node_modules/better-sqlite3/lib/methods/transaction.js
var require_transaction = __commonJS({
  "node_modules/better-sqlite3/lib/methods/transaction.js"(exports, module) {
    "use strict";
    var { cppdb } = require_util();
    var controllers = /* @__PURE__ */ new WeakMap();
    module.exports = function transaction(fn) {
      if (typeof fn !== "function") throw new TypeError("Expected first argument to be a function");
      const db = this[cppdb];
      const controller = getController(db, this);
      const { apply } = Function.prototype;
      const properties = {
        default: { value: wrapTransaction(apply, fn, db, controller.default) },
        deferred: { value: wrapTransaction(apply, fn, db, controller.deferred) },
        immediate: { value: wrapTransaction(apply, fn, db, controller.immediate) },
        exclusive: { value: wrapTransaction(apply, fn, db, controller.exclusive) },
        database: { value: this, enumerable: true }
      };
      Object.defineProperties(properties.default.value, properties);
      Object.defineProperties(properties.deferred.value, properties);
      Object.defineProperties(properties.immediate.value, properties);
      Object.defineProperties(properties.exclusive.value, properties);
      return properties.default.value;
    };
    var getController = (db, self) => {
      let controller = controllers.get(db);
      if (!controller) {
        const shared = {
          commit: db.prepare("COMMIT", self, false),
          rollback: db.prepare("ROLLBACK", self, false),
          savepoint: db.prepare("SAVEPOINT `	_bs3.	`", self, false),
          release: db.prepare("RELEASE `	_bs3.	`", self, false),
          rollbackTo: db.prepare("ROLLBACK TO `	_bs3.	`", self, false)
        };
        controllers.set(db, controller = {
          default: Object.assign({ begin: db.prepare("BEGIN", self, false) }, shared),
          deferred: Object.assign({ begin: db.prepare("BEGIN DEFERRED", self, false) }, shared),
          immediate: Object.assign({ begin: db.prepare("BEGIN IMMEDIATE", self, false) }, shared),
          exclusive: Object.assign({ begin: db.prepare("BEGIN EXCLUSIVE", self, false) }, shared)
        });
      }
      return controller;
    };
    var wrapTransaction = (apply, fn, db, { begin, commit, rollback, savepoint, release, rollbackTo }) => function sqliteTransaction() {
      let before, after, undo;
      if (db.inTransaction) {
        before = savepoint;
        after = release;
        undo = rollbackTo;
      } else {
        before = begin;
        after = commit;
        undo = rollback;
      }
      before.run();
      try {
        const result = apply.call(fn, this, arguments);
        after.run();
        return result;
      } catch (ex) {
        if (db.inTransaction) {
          undo.run();
          if (undo !== rollback) after.run();
        }
        throw ex;
      }
    };
  }
});

// node_modules/better-sqlite3/lib/methods/pragma.js
var require_pragma = __commonJS({
  "node_modules/better-sqlite3/lib/methods/pragma.js"(exports, module) {
    "use strict";
    var { getBooleanOption, cppdb } = require_util();
    module.exports = function pragma(source, options) {
      if (options == null) options = {};
      if (typeof source !== "string") throw new TypeError("Expected first argument to be a string");
      if (typeof options !== "object") throw new TypeError("Expected second argument to be an options object");
      const simple = getBooleanOption(options, "simple");
      const stmt = this[cppdb].prepare(`PRAGMA ${source}`, this, true);
      return simple ? stmt.pluck().get() : stmt.all();
    };
  }
});

// node_modules/better-sqlite3/lib/methods/backup.js
var require_backup = __commonJS({
  "node_modules/better-sqlite3/lib/methods/backup.js"(exports, module) {
    "use strict";
    var fs = __require("fs");
    var path = __require("path");
    var { promisify: promisify2 } = __require("util");
    var { cppdb } = require_util();
    var fsAccess = promisify2(fs.access);
    module.exports = async function backup(filename, options) {
      if (options == null) options = {};
      if (typeof filename !== "string") throw new TypeError("Expected first argument to be a string");
      if (typeof options !== "object") throw new TypeError("Expected second argument to be an options object");
      filename = filename.trim();
      const attachedName = "attached" in options ? options.attached : "main";
      const handler = "progress" in options ? options.progress : null;
      if (!filename) throw new TypeError("Backup filename cannot be an empty string");
      if (filename === ":memory:") throw new TypeError('Invalid backup filename ":memory:"');
      if (typeof attachedName !== "string") throw new TypeError('Expected the "attached" option to be a string');
      if (!attachedName) throw new TypeError('The "attached" option cannot be an empty string');
      if (handler != null && typeof handler !== "function") throw new TypeError('Expected the "progress" option to be a function');
      await fsAccess(path.dirname(filename)).catch(() => {
        throw new TypeError("Cannot save backup because the directory does not exist");
      });
      const isNewFile = await fsAccess(filename).then(() => false, () => true);
      return runBackup(this[cppdb].backup(this, attachedName, filename, isNewFile), handler || null);
    };
    var runBackup = (backup, handler) => {
      let rate = 0;
      let useDefault = true;
      return new Promise((resolve, reject) => {
        setImmediate(function step() {
          try {
            const progress = backup.transfer(rate);
            if (!progress.remainingPages) {
              backup.close();
              resolve(progress);
              return;
            }
            if (useDefault) {
              useDefault = false;
              rate = 100;
            }
            if (handler) {
              const ret = handler(progress);
              if (ret !== void 0) {
                if (typeof ret === "number" && ret === ret) rate = Math.max(0, Math.min(2147483647, Math.round(ret)));
                else throw new TypeError("Expected progress callback to return a number or undefined");
              }
            }
            setImmediate(step);
          } catch (err) {
            backup.close();
            reject(err);
          }
        });
      });
    };
  }
});

// node_modules/better-sqlite3/lib/methods/serialize.js
var require_serialize = __commonJS({
  "node_modules/better-sqlite3/lib/methods/serialize.js"(exports, module) {
    "use strict";
    var { cppdb } = require_util();
    module.exports = function serialize(options) {
      if (options == null) options = {};
      if (typeof options !== "object") throw new TypeError("Expected first argument to be an options object");
      const attachedName = "attached" in options ? options.attached : "main";
      if (typeof attachedName !== "string") throw new TypeError('Expected the "attached" option to be a string');
      if (!attachedName) throw new TypeError('The "attached" option cannot be an empty string');
      return this[cppdb].serialize(attachedName);
    };
  }
});

// node_modules/better-sqlite3/lib/methods/function.js
var require_function = __commonJS({
  "node_modules/better-sqlite3/lib/methods/function.js"(exports, module) {
    "use strict";
    var { getBooleanOption, cppdb } = require_util();
    module.exports = function defineFunction(name, options, fn) {
      if (options == null) options = {};
      if (typeof options === "function") {
        fn = options;
        options = {};
      }
      if (typeof name !== "string") throw new TypeError("Expected first argument to be a string");
      if (typeof fn !== "function") throw new TypeError("Expected last argument to be a function");
      if (typeof options !== "object") throw new TypeError("Expected second argument to be an options object");
      if (!name) throw new TypeError("User-defined function name cannot be an empty string");
      const safeIntegers = "safeIntegers" in options ? +getBooleanOption(options, "safeIntegers") : 2;
      const deterministic = getBooleanOption(options, "deterministic");
      const directOnly = getBooleanOption(options, "directOnly");
      const varargs = getBooleanOption(options, "varargs");
      let argCount = -1;
      if (!varargs) {
        argCount = fn.length;
        if (!Number.isInteger(argCount) || argCount < 0) throw new TypeError("Expected function.length to be a positive integer");
        if (argCount > 100) throw new RangeError("User-defined functions cannot have more than 100 arguments");
      }
      this[cppdb].function(fn, name, argCount, safeIntegers, deterministic, directOnly);
      return this;
    };
  }
});

// node_modules/better-sqlite3/lib/methods/aggregate.js
var require_aggregate = __commonJS({
  "node_modules/better-sqlite3/lib/methods/aggregate.js"(exports, module) {
    "use strict";
    var { getBooleanOption, cppdb } = require_util();
    module.exports = function defineAggregate(name, options) {
      if (typeof name !== "string") throw new TypeError("Expected first argument to be a string");
      if (typeof options !== "object" || options === null) throw new TypeError("Expected second argument to be an options object");
      if (!name) throw new TypeError("User-defined function name cannot be an empty string");
      const start = "start" in options ? options.start : null;
      const step = getFunctionOption(options, "step", true);
      const inverse = getFunctionOption(options, "inverse", false);
      const result = getFunctionOption(options, "result", false);
      const safeIntegers = "safeIntegers" in options ? +getBooleanOption(options, "safeIntegers") : 2;
      const deterministic = getBooleanOption(options, "deterministic");
      const directOnly = getBooleanOption(options, "directOnly");
      const varargs = getBooleanOption(options, "varargs");
      let argCount = -1;
      if (!varargs) {
        argCount = Math.max(getLength(step), inverse ? getLength(inverse) : 0);
        if (argCount > 0) argCount -= 1;
        if (argCount > 100) throw new RangeError("User-defined functions cannot have more than 100 arguments");
      }
      this[cppdb].aggregate(start, step, inverse, result, name, argCount, safeIntegers, deterministic, directOnly);
      return this;
    };
    var getFunctionOption = (options, key, required) => {
      const value = key in options ? options[key] : null;
      if (typeof value === "function") return value;
      if (value != null) throw new TypeError(`Expected the "${key}" option to be a function`);
      if (required) throw new TypeError(`Missing required option "${key}"`);
      return null;
    };
    var getLength = ({ length }) => {
      if (Number.isInteger(length) && length >= 0) return length;
      throw new TypeError("Expected function.length to be a positive integer");
    };
  }
});

// node_modules/better-sqlite3/lib/methods/table.js
var require_table = __commonJS({
  "node_modules/better-sqlite3/lib/methods/table.js"(exports, module) {
    "use strict";
    var { cppdb } = require_util();
    module.exports = function defineTable(name, factory) {
      if (typeof name !== "string") throw new TypeError("Expected first argument to be a string");
      if (!name) throw new TypeError("Virtual table module name cannot be an empty string");
      let eponymous = false;
      if (typeof factory === "object" && factory !== null) {
        eponymous = true;
        factory = defer(parseTableDefinition(factory, "used", name));
      } else {
        if (typeof factory !== "function") throw new TypeError("Expected second argument to be a function or a table definition object");
        factory = wrapFactory(factory);
      }
      this[cppdb].table(factory, name, eponymous);
      return this;
    };
    function wrapFactory(factory) {
      return function virtualTableFactory(moduleName, databaseName, tableName, ...args) {
        const thisObject = {
          module: moduleName,
          database: databaseName,
          table: tableName
        };
        const def = apply.call(factory, thisObject, args);
        if (typeof def !== "object" || def === null) {
          throw new TypeError(`Virtual table module "${moduleName}" did not return a table definition object`);
        }
        return parseTableDefinition(def, "returned", moduleName);
      };
    }
    function parseTableDefinition(def, verb, moduleName) {
      if (!hasOwnProperty.call(def, "rows")) {
        throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition without a "rows" property`);
      }
      if (!hasOwnProperty.call(def, "columns")) {
        throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition without a "columns" property`);
      }
      const rows = def.rows;
      if (typeof rows !== "function" || Object.getPrototypeOf(rows) !== GeneratorFunctionPrototype) {
        throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "rows" property (should be a generator function)`);
      }
      let columns = def.columns;
      if (!Array.isArray(columns) || !(columns = [...columns]).every((x) => typeof x === "string")) {
        throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "columns" property (should be an array of strings)`);
      }
      if (columns.length !== new Set(columns).size) {
        throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with duplicate column names`);
      }
      if (!columns.length) {
        throw new RangeError(`Virtual table module "${moduleName}" ${verb} a table definition with zero columns`);
      }
      let parameters;
      if (hasOwnProperty.call(def, "parameters")) {
        parameters = def.parameters;
        if (!Array.isArray(parameters) || !(parameters = [...parameters]).every((x) => typeof x === "string")) {
          throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "parameters" property (should be an array of strings)`);
        }
      } else {
        parameters = inferParameters(rows);
      }
      if (parameters.length !== new Set(parameters).size) {
        throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with duplicate parameter names`);
      }
      if (parameters.length > 32) {
        throw new RangeError(`Virtual table module "${moduleName}" ${verb} a table definition with more than the maximum number of 32 parameters`);
      }
      for (const parameter of parameters) {
        if (columns.includes(parameter)) {
          throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with column "${parameter}" which was ambiguously defined as both a column and parameter`);
        }
      }
      let safeIntegers = 2;
      if (hasOwnProperty.call(def, "safeIntegers")) {
        const bool = def.safeIntegers;
        if (typeof bool !== "boolean") {
          throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "safeIntegers" property (should be a boolean)`);
        }
        safeIntegers = +bool;
      }
      let directOnly = false;
      if (hasOwnProperty.call(def, "directOnly")) {
        directOnly = def.directOnly;
        if (typeof directOnly !== "boolean") {
          throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "directOnly" property (should be a boolean)`);
        }
      }
      const columnDefinitions = [
        ...parameters.map(identifier).map((str) => `${str} HIDDEN`),
        ...columns.map(identifier)
      ];
      return [
        `CREATE TABLE x(${columnDefinitions.join(", ")});`,
        wrapGenerator(rows, new Map(columns.map((x, i) => [x, parameters.length + i])), moduleName),
        parameters,
        safeIntegers,
        directOnly
      ];
    }
    function wrapGenerator(generator, columnMap, moduleName) {
      return function* virtualTable(...args) {
        const output = args.map((x) => Buffer.isBuffer(x) ? Buffer.from(x) : x);
        for (let i = 0; i < columnMap.size; ++i) {
          output.push(null);
        }
        for (const row of generator(...args)) {
          if (Array.isArray(row)) {
            extractRowArray(row, output, columnMap.size, moduleName);
            yield output;
          } else if (typeof row === "object" && row !== null) {
            extractRowObject(row, output, columnMap, moduleName);
            yield output;
          } else {
            throw new TypeError(`Virtual table module "${moduleName}" yielded something that isn't a valid row object`);
          }
        }
      };
    }
    function extractRowArray(row, output, columnCount, moduleName) {
      if (row.length !== columnCount) {
        throw new TypeError(`Virtual table module "${moduleName}" yielded a row with an incorrect number of columns`);
      }
      const offset = output.length - columnCount;
      for (let i = 0; i < columnCount; ++i) {
        output[i + offset] = row[i];
      }
    }
    function extractRowObject(row, output, columnMap, moduleName) {
      let count = 0;
      for (const key of Object.keys(row)) {
        const index = columnMap.get(key);
        if (index === void 0) {
          throw new TypeError(`Virtual table module "${moduleName}" yielded a row with an undeclared column "${key}"`);
        }
        output[index] = row[key];
        count += 1;
      }
      if (count !== columnMap.size) {
        throw new TypeError(`Virtual table module "${moduleName}" yielded a row with missing columns`);
      }
    }
    function inferParameters({ length }) {
      if (!Number.isInteger(length) || length < 0) {
        throw new TypeError("Expected function.length to be a positive integer");
      }
      const params = [];
      for (let i = 0; i < length; ++i) {
        params.push(`$${i + 1}`);
      }
      return params;
    }
    var { hasOwnProperty } = Object.prototype;
    var { apply } = Function.prototype;
    var GeneratorFunctionPrototype = Object.getPrototypeOf(function* () {
    });
    var identifier = (str) => `"${str.replace(/"/g, '""')}"`;
    var defer = (x) => () => x;
  }
});

// node_modules/better-sqlite3/lib/methods/inspect.js
var require_inspect = __commonJS({
  "node_modules/better-sqlite3/lib/methods/inspect.js"(exports, module) {
    "use strict";
    var DatabaseInspection = function Database2() {
    };
    module.exports = function inspect(depth, opts) {
      return Object.assign(new DatabaseInspection(), this);
    };
  }
});

// node_modules/better-sqlite3/lib/database.js
var require_database = __commonJS({
  "node_modules/better-sqlite3/lib/database.js"(exports, module) {
    "use strict";
    var fs = __require("fs");
    var path = __require("path");
    var util = require_util();
    var SqliteError = require_sqlite_error();
    var DEFAULT_ADDON;
    function Database2(filenameGiven, options) {
      if (new.target == null) {
        return new Database2(filenameGiven, options);
      }
      let buffer;
      if (Buffer.isBuffer(filenameGiven)) {
        buffer = filenameGiven;
        filenameGiven = ":memory:";
      }
      if (filenameGiven == null) filenameGiven = "";
      if (options == null) options = {};
      if (typeof filenameGiven !== "string") throw new TypeError("Expected first argument to be a string");
      if (typeof options !== "object") throw new TypeError("Expected second argument to be an options object");
      if ("readOnly" in options) throw new TypeError('Misspelled option "readOnly" should be "readonly"');
      if ("memory" in options) throw new TypeError('Option "memory" was removed in v7.0.0 (use ":memory:" filename instead)');
      const filename = filenameGiven.trim();
      const anonymous = filename === "" || filename === ":memory:";
      const readonly = util.getBooleanOption(options, "readonly");
      const fileMustExist = util.getBooleanOption(options, "fileMustExist");
      const timeout = "timeout" in options ? options.timeout : 5e3;
      const verbose = "verbose" in options ? options.verbose : null;
      const nativeBinding = "nativeBinding" in options ? options.nativeBinding : null;
      if (readonly && anonymous && !buffer) throw new TypeError("In-memory/temporary databases cannot be readonly");
      if (!Number.isInteger(timeout) || timeout < 0) throw new TypeError('Expected the "timeout" option to be a positive integer');
      if (timeout > 2147483647) throw new RangeError('Option "timeout" cannot be greater than 2147483647');
      if (verbose != null && typeof verbose !== "function") throw new TypeError('Expected the "verbose" option to be a function');
      if (nativeBinding != null && typeof nativeBinding !== "string" && typeof nativeBinding !== "object") throw new TypeError('Expected the "nativeBinding" option to be a string or addon object');
      let addon;
      if (nativeBinding == null) {
        addon = DEFAULT_ADDON || (DEFAULT_ADDON = require_bindings()("better_sqlite3.node"));
      } else if (typeof nativeBinding === "string") {
        const requireFunc = typeof __non_webpack_require__ === "function" ? __non_webpack_require__ : __require;
        addon = requireFunc(path.resolve(nativeBinding).replace(/(\.node)?$/, ".node"));
      } else {
        addon = nativeBinding;
      }
      if (!addon.isInitialized) {
        addon.setErrorConstructor(SqliteError);
        addon.isInitialized = true;
      }
      if (!anonymous && !fs.existsSync(path.dirname(filename))) {
        throw new TypeError("Cannot open database because the directory does not exist");
      }
      Object.defineProperties(this, {
        [util.cppdb]: { value: new addon.Database(filename, filenameGiven, anonymous, readonly, fileMustExist, timeout, verbose || null, buffer || null) },
        ...wrappers.getters
      });
    }
    var wrappers = require_wrappers();
    Database2.prototype.prepare = wrappers.prepare;
    Database2.prototype.transaction = require_transaction();
    Database2.prototype.pragma = require_pragma();
    Database2.prototype.backup = require_backup();
    Database2.prototype.serialize = require_serialize();
    Database2.prototype.function = require_function();
    Database2.prototype.aggregate = require_aggregate();
    Database2.prototype.table = require_table();
    Database2.prototype.loadExtension = wrappers.loadExtension;
    Database2.prototype.exec = wrappers.exec;
    Database2.prototype.close = wrappers.close;
    Database2.prototype.defaultSafeIntegers = wrappers.defaultSafeIntegers;
    Database2.prototype.unsafeMode = wrappers.unsafeMode;
    Database2.prototype[util.inspect] = require_inspect();
    module.exports = Database2;
  }
});

// node_modules/better-sqlite3/lib/index.js
var require_lib = __commonJS({
  "node_modules/better-sqlite3/lib/index.js"(exports, module) {
    "use strict";
    module.exports = require_database();
    module.exports.SqliteError = require_sqlite_error();
  }
});

// src/lib/features/spend.ts
var spend_exports = {};
__export(spend_exports, {
  getPeriodCost: () => getPeriodCost,
  getTodayCostV2: () => getTodayCostV2,
  saveSessionV2: () => saveSessionV2
});
import { join as join2, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync as existsSync2 } from "node:fs";
async function getDatabase() {
  if (!dbChecked) {
    dbChecked = true;
    try {
      const module = await Promise.resolve().then(() => __toESM(require_lib(), 1));
      Database = module.default;
    } catch {
    }
  }
  return Database;
}
async function initDb() {
  const DB = await getDatabase();
  if (!DB) {
    throw new Error("better-sqlite3 not available");
  }
  const db = new DB(DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      period_id TEXT,
      cost_usd REAL,
      duration_ms REAL,
      tokens INTEGER,
      model_name TEXT
    )
  `);
  return db;
}
async function saveSessionV2(input, periodId) {
  const DB = await getDatabase();
  if (!DB) {
    return;
  }
  try {
    const db = await initDb();
    const stmt = db.prepare(`
      INSERT INTO sessions (period_id, cost_usd, duration_ms, tokens, model_name)
      VALUES (?, ?, ?, ?, ?)
    `);
    const tokens = (input.context_window?.current_usage?.input_tokens || 0) + (input.context_window?.current_usage?.cache_creation_input_tokens || 0) + (input.context_window?.current_usage?.cache_read_input_tokens || 0);
    stmt.run(
      periodId,
      input.cost.total_cost_usd,
      input.cost.total_duration_ms,
      tokens,
      input.model.display_name
    );
    db.close();
  } catch {
  }
}
async function executeSumQuery(sql, params = []) {
  const DB = await getDatabase();
  if (!DB || !existsSync2(DB_PATH)) {
    return 0;
  }
  try {
    const db = new DB(DB_PATH);
    const stmt = db.prepare(sql);
    const result = stmt.get(...params);
    db.close();
    return result?.total || 0;
  } catch {
    return 0;
  }
}
async function getPeriodCost(periodId) {
  return executeSumQuery(
    "SELECT SUM(cost_usd) as total FROM sessions WHERE period_id = ?",
    [periodId]
  );
}
async function getTodayCostV2() {
  return executeSumQuery(`
    SELECT SUM(cost_usd) as total
    FROM sessions
    WHERE DATE(timestamp) = DATE('now')
  `);
}
var __filename2, __dirname, DB_PATH, Database, dbChecked;
var init_spend = __esm({
  "src/lib/features/spend.ts"() {
    "use strict";
    __filename2 = fileURLToPath(import.meta.url);
    __dirname = dirname(__filename2);
    DB_PATH = join2(__dirname, "..", "..", "..", "data", "spend.db");
    Database = null;
    dbChecked = false;
  }
});

// src/index.ts
import { readFile as readFile2, writeFile } from "node:fs/promises";
import { existsSync as existsSync3 } from "node:fs";
import { join as join3, dirname as dirname2 } from "node:path";
import { fileURLToPath as fileURLToPath2 } from "node:url";
import { mkdir } from "node:fs/promises";
import { homedir as homedir2 } from "node:os";

// src/defaults.ts
var defaultConfigJson = {
  features: {
    usageLimits: true,
    spendTracking: true
  },
  oneLine: true,
  showSonnetModel: false,
  pathDisplayMode: "truncated",
  git: {
    enabled: true,
    showBranch: true,
    showDirtyIndicator: true,
    showChanges: true,
    showStaged: true,
    showUnstaged: true
  },
  separator: "\u2022",
  session: {
    infoSeparator: null,
    cost: { enabled: true, format: "decimal1" },
    duration: { enabled: true },
    tokens: { enabled: true, showMax: false, showDecimals: false },
    percentage: {
      enabled: true,
      showValue: true,
      progressBar: {
        enabled: true,
        length: 10,
        style: "braille",
        color: "progressive",
        background: "none"
      }
    }
  },
  context: {
    usePayloadContextWindow: true,
    maxContextTokens: 2e5,
    autocompactBufferTokens: 45e3,
    useUsableContextOnly: true,
    overheadTokens: 0,
    includeBaseContext: true,
    baseContextPath: "~/.claude",
    showContextBreakdown: false
  },
  limits: {
    enabled: true,
    showTimeLeft: true,
    showPacingDelta: true,
    cost: { enabled: false, format: "decimal1" },
    percentage: {
      enabled: true,
      showValue: true,
      progressBar: {
        enabled: true,
        length: 10,
        style: "braille",
        color: "progressive",
        background: "none"
      }
    }
  },
  weeklyUsage: {
    enabled: "90%",
    showTimeLeft: true,
    showPacingDelta: true,
    cost: { enabled: false, format: "decimal1" },
    percentage: {
      enabled: true,
      showValue: true,
      progressBar: {
        enabled: true,
        length: 10,
        style: "braille",
        color: "progressive",
        background: "none"
      }
    }
  },
  dailySpend: {
    cost: { enabled: false, format: "decimal1" }
  }
};

// src/lib/config.ts
var defaultConfig = defaultConfigJson;
function mergeConfig(userConfig) {
  return {
    ...defaultConfig,
    ...userConfig,
    session: { ...defaultConfig.session, ...userConfig.session },
    context: { ...defaultConfig.context, ...userConfig.context },
    git: { ...defaultConfig.git, ...userConfig.git },
    limits: { ...defaultConfig.limits, ...userConfig.limits },
    weeklyUsage: { ...defaultConfig.weeklyUsage, ...userConfig.weeklyUsage },
    dailySpend: { ...defaultConfig.dailySpend, ...userConfig.dailySpend }
  };
}

// src/index.ts
init_context();

// src/lib/formatters.ts
var colors = {
  reset: "\x1B[0m",
  bold: "\x1B[1m",
  dim: "\x1B[2m",
  red: "\x1B[31m",
  green: "\x1B[32m",
  yellow: "\x1B[33m",
  blue: "\x1B[34m",
  magenta: "\x1B[35m",
  cyan: "\x1B[36m",
  gray: "\x1B[90m",
  orange: "\x1B[38;5;208m",
  white: "\x1B[97m"
};
function formatBranch(git, config) {
  if (!config.enabled || !git.branch) {
    return "";
  }
  const parts = [git.branch];
  if (config.showChanges && git.isDirty) {
    if (git.additions > 0) {
      parts.push(`${colors.green}+${git.additions}${colors.reset}`);
    }
    if (git.deletions > 0) {
      parts.push(`${colors.red}-${git.deletions}${colors.reset}`);
    }
    if (git.modifications > 0 && git.additions === 0 && git.deletions === 0) {
      parts.push(`${colors.yellow}*${git.modifications}${colors.reset}`);
    }
  } else if (config.showDirtyIndicator && git.isDirty) {
    parts.push("*");
  }
  if (config.showStaged && git.staged > 0) {
    parts.push(`${colors.green}S${git.staged}${colors.reset}`);
  }
  if (config.showUnstaged && git.unstaged > 0) {
    parts.push(`${colors.yellow}U${git.unstaged}${colors.reset}`);
  }
  return parts.join(` ${colors.gray}\u2022${colors.reset} `);
}
function formatCost(cost, format) {
  const decimals = {
    decimal1: 1,
    decimal2: 2,
    decimal3: 3
  };
  return `$${cost.toFixed(decimals[format])}`;
}
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1e3);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}
function formatPath(path, mode) {
  let normalizedPath = path.replace(/\\/g, "/");
  const homeDir = process.env.HOME || process.env.USERPROFILE || "";
  if (homeDir && normalizedPath.startsWith(homeDir)) {
    normalizedPath = "~" + normalizedPath.slice(homeDir.length);
  } else if (process.platform === "win32") {
    const match = path.match(/^.:\\/);
    if (match) {
      normalizedPath = normalizedPath.substring(3);
    }
  }
  if (mode === "basename") {
    const parts = normalizedPath.split("/").filter((p) => p && p !== ".");
    const basename = parts.pop() || normalizedPath;
    if (parts.length > 0) {
      const parent = parts.pop();
      return parent ? `${parent}/${basename}` : basename;
    }
    return basename;
  }
  if (mode === "truncated") {
    const parts = normalizedPath.split("/").filter((p) => p && p !== ".");
    if (parts.length <= 3) {
      return normalizedPath;
    }
    return `${parts[0]}/.../${parts.slice(-2).join("/")}`;
  }
  return normalizedPath;
}
function formatTokens(tokens, showDecimals) {
  if (tokens < 1e3) {
    return tokens.toString();
  }
  const k = tokens / 1e3;
  const roundedK = Math.round(k);
  if (showDecimals && roundedK >= 100) {
    return `${k.toFixed(1)}K`;
  }
  return `${roundedK}K`;
}
function getProgressBarColor(percentage, color) {
  if (color === "single") {
    return colors.blue;
  }
  if (percentage >= 90) {
    return colors.red;
  }
  if (percentage >= 70) {
    return colors.yellow;
  }
  if (percentage >= 40) {
    return colors.green;
  }
  if (percentage >= 20) {
    return colors.cyan;
  }
  return colors.blue;
}
function getEmptyChar(background) {
  const emptyChars = {
    none: " ",
    shade: "\u2591",
    dots: "\xB7"
  };
  return emptyChars[background];
}
function formatProgressBar(percentage, length, style, color, background) {
  if (style === "percentage") {
    return `${percentage}%`;
  }
  let filled = Math.round(percentage / 100 * length);
  if (percentage > 0 && filled === 0) {
    filled = 1;
  }
  const empty = length - filled;
  const barColor = getProgressBarColor(percentage, color);
  if (style === "braille") {
    const emptyChar2 = getEmptyChar(background);
    const filledPart2 = barColor + "\u2588".repeat(Math.ceil(filled / 2)) + colors.reset;
    const emptyPart2 = colors.dim + emptyChar2.repeat(length - Math.ceil(filled / 2)) + colors.reset;
    return filledPart2 + emptyPart2;
  }
  const emptyChar = getEmptyChar(background);
  const filledPart = barColor + "\u2588".repeat(filled) + colors.reset;
  const emptyPart = colors.dim + emptyChar.repeat(empty) + colors.reset;
  return filledPart + emptyPart;
}

// src/lib/git.ts
import { exec } from "node:child_process";
import { promisify } from "node:util";
var execAsync = promisify(exec);
async function execGit(cmd) {
  try {
    const { stdout } = await execAsync(cmd, {
      timeout: 500,
      // 500ms timeout
      windowsHide: true
    });
    return stdout.toString().trim();
  } catch {
    return "";
  }
}
async function getGitStatus() {
  const result = {
    branch: null,
    changes: 0,
    staged: 0,
    unstaged: 0,
    isDirty: false,
    additions: 0,
    deletions: 0,
    modifications: 0
  };
  try {
    const branchOutput = await execGit("git branch --show-current");
    result.branch = branchOutput || null;
    const statusOutput = await execGit("git status --porcelain");
    if (statusOutput) {
      const statusLines = statusOutput.split("\n").filter(Boolean);
      for (const line of statusLines) {
        if (!line) continue;
        const index = line[0];
        const workTree = line[1];
        if (index !== " " && index !== "?") {
          result.staged++;
        }
        if (workTree !== " ") {
          result.unstaged++;
          result.modifications++;
        }
        result.changes++;
      }
      result.isDirty = result.changes > 0;
    }
    const diffOutput = await execGit("git diff --numstat");
    if (diffOutput) {
      const lines = diffOutput.split("\n").filter(Boolean);
      for (const line of lines) {
        const parts = line.split("	");
        if (parts.length >= 2) {
          const additions = parseInt(parts[0], 10) || 0;
          const deletions = parseInt(parts[1], 10) || 0;
          result.additions += additions;
          result.deletions += deletions;
        }
      }
    }
  } catch {
    return result;
  }
  return result;
}

// src/lib/render-pure.ts
function getPercentageColor(percentage, color) {
  if (color === "single") {
    return colors.blue;
  }
  if (percentage >= 90) {
    return colors.red;
  }
  if (percentage >= 70) {
    return colors.yellow;
  }
  if (percentage >= 40) {
    return colors.green;
  }
  if (percentage >= 20) {
    return colors.cyan;
  }
  return colors.blue;
}
function renderStatusline(data, config) {
  const parts = [];
  if (config.git.enabled && data.branch) {
    const branchName = data.branch.split(/[•\s]/)[0];
    parts.push(`${colors.white}${branchName}${colors.reset}`);
  }
  if (config.session.tokens.enabled && data.contextTokens !== null) {
    const maxTokens = config.context.maxContextTokens;
    const userTokens = data.userTokens ?? data.contextTokens;
    const totalTokens = data.contextTokens;
    let tokensStr;
    if (userTokens < 1e3 && totalTokens >= 1e3) {
      tokensStr = formatTokens(totalTokens, config.session.tokens.showDecimals);
    } else if (userTokens !== totalTokens) {
      tokensStr = `${formatTokens(userTokens, config.session.tokens.showDecimals)}`;
    } else {
      tokensStr = formatTokens(userTokens, config.session.tokens.showDecimals);
    }
    parts.push(`${colors.magenta}${tokensStr}${colors.reset}`);
    if (config.session.percentage.enabled) {
      const { progressBar, showValue } = config.session.percentage;
      const maxTokensVal = config.context.maxContextTokens || 2e5;
      const percentage = maxTokensVal > 0 && totalTokens > 0 ? Math.min(100, Math.round(totalTokens / maxTokensVal * 100)) : 0;
      if (totalTokens > 0 && maxTokensVal > 0) {
        if (progressBar.enabled) {
          const bar = formatProgressBar(
            percentage,
            progressBar.length,
            progressBar.style,
            progressBar.color,
            progressBar.background
          );
          parts.push(bar);
        }
        if (showValue) {
          const percentColor = getPercentageColor(percentage, progressBar.color);
          parts.push(`${percentColor}${percentage}%${colors.reset}`);
        }
      }
    }
  }
  const modelDisplay = config.showSonnetModel || !data.modelName.includes("Sonnet") ? data.modelName : "Sonnet";
  parts.push(`${colors.orange}${modelDisplay}${colors.reset}`);
  if (config.session.cost.enabled) {
    parts.push(data.sessionCost);
  }
  if (config.session.duration.enabled) {
    parts.push(data.sessionDuration);
  }
  if (config.git.showChanges && data.branch) {
    const changes = data.branch.split(/[•\s]+/).slice(1);
    const filtered = changes.filter((c) => c && c !== "\u2022");
    if (filtered.length > 0) {
      parts.push(filtered.join(" "));
    }
  }
  return parts.join(` ${colors.gray}${config.separator}${colors.reset} `);
}

// src/index.ts
var getUsageLimits2 = null;
var getPeriodCost2 = null;
var getTodayCostV22 = null;
var saveSessionV22 = null;
try {
  const limitsModule = await Promise.resolve().then(() => (init_limits(), limits_exports));
  getUsageLimits2 = limitsModule.getUsageLimits;
} catch {
}
try {
  const spendModule = await Promise.resolve().then(() => (init_spend(), spend_exports));
  getPeriodCost2 = spendModule.getPeriodCost;
  getTodayCostV22 = spendModule.getTodayCostV2;
  saveSessionV22 = spendModule.saveSessionV2;
} catch {
}
var __filename3 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename3);
var CONFIG_FILE_PATH = join3(__dirname2, "..", "statusline.config.json");
var LAST_PAYLOAD_PATH = join3(__dirname2, "..", "data", "last_payload.txt");
var CACHE_FILE_PATH = join3(__dirname2, "..", "data", "context_cache.json");
var TOKEN_TRACKER_PATH = join3(homedir2(), ".claude", ".token-tracker.json");
var TOKEN_DIFF_TIMEOUT = 5e3;
var SESSION_TIMEOUT = 18e5;
var contextCache = null;
var CACHE_TTL = 2e3;
async function shouldTrustPayload(actualTranscriptPath, payloadTranscriptPath, payloadTokens) {
  const { normalize: normalize2 } = await import("node:path");
  const normalizedActual = normalize2(actualTranscriptPath);
  const normalizedPayload = normalize2(payloadTranscriptPath);
  if (normalizedActual === normalizedPayload) {
    return { trust: payloadTokens >= 0, reason: "same session" };
  }
  console.error(`[DEBUG] Session mismatch: payload=${payloadTranscriptPath}, actual=${actualTranscriptPath}`);
  return { trust: false, reason: "session mismatch" };
}
async function findActualTranscriptPath(payloadPath) {
  try {
    const { existsSync: existsSync4, readdirSync, statSync } = await import("node:fs");
    const { join: join4, normalize: normalize2 } = await import("node:path");
    const transcriptDir = join4(payloadPath, "..");
    if (!existsSync4(transcriptDir)) {
      return payloadPath;
    }
    const normalizedPayloadPath = normalize2(payloadPath);
    const files = readdirSync(transcriptDir);
    const jsonlFiles = files.filter((f) => f.endsWith(".jsonl"));
    let newestFile = null;
    let newestMtime = 0;
    for (const file of jsonlFiles) {
      const filePath = join4(transcriptDir, file);
      try {
        const stats = statSync(filePath);
        if (stats.mtimeMs > newestMtime) {
          newestMtime = stats.mtimeMs;
          newestFile = filePath;
        }
      } catch {
        continue;
      }
    }
    if (newestFile) {
      const normalizedNewestFile = normalize2(newestFile);
      if (normalizedNewestFile !== normalizedPayloadPath) {
        try {
          const payloadStats = statSync(payloadPath);
          if (newestMtime - payloadStats.mtimeMs > 1e3) {
            console.error(`[DEBUG] Detected new session: payload has ${payloadPath} but newest is ${newestFile}`);
            return newestFile;
          }
        } catch {
          console.error(`[DEBUG] Payload file missing, using newest: ${newestFile}`);
          return newestFile;
        }
      }
    }
    return payloadPath;
  } catch (e) {
    console.error(`[DEBUG] Error finding actual transcript: ${e}`);
    return payloadPath;
  }
}
async function loadTokenTracker(currentUsage, sessionId) {
  try {
    if (existsSync3(TOKEN_TRACKER_PATH)) {
      const content = await readFile2(TOKEN_TRACKER_PATH, "utf-8");
      const tracker = JSON.parse(content);
      const now = Date.now();
      if (now - tracker.timestamp > SESSION_TIMEOUT || sessionId && tracker.sessionId && sessionId !== tracker.sessionId) {
        return {
          lastUsage: currentUsage,
          timestamp: now,
          lastDiffTime: now,
          sessionId
        };
      }
      if (sessionId && !tracker.sessionId) {
        tracker.sessionId = sessionId;
      }
      return tracker;
    }
  } catch (e) {
  }
  return {
    lastUsage: currentUsage,
    timestamp: Date.now(),
    lastDiffTime: Date.now(),
    sessionId
  };
}
async function saveTokenTracker(tracker) {
  try {
    tracker.timestamp = Date.now();
    await writeFile(
      TOKEN_TRACKER_PATH,
      JSON.stringify(tracker, null, 2),
      "utf-8"
    );
  } catch (e) {
  }
}
function getTokenDiff(currentUsage, tracker) {
  const tokenDiff = currentUsage - tracker.lastUsage;
  const now = Date.now();
  const timeSinceLastDiff = now - (tracker.lastDiffTime || 0);
  const shouldShow = tokenDiff > 0 && timeSinceLastDiff < TOKEN_DIFF_TIMEOUT;
  return { diff: tokenDiff, shouldShow };
}
function updateTracker(tracker, currentUsage) {
  const tokenDiff = currentUsage - tracker.lastUsage;
  const now = Date.now();
  const timeSinceLastDiff = now - (tracker.lastDiffTime || 0);
  if (tokenDiff > 0) {
    if (timeSinceLastDiff >= TOKEN_DIFF_TIMEOUT) {
      tracker.lastUsage = currentUsage;
      tracker.lastDiffTime = now;
    } else {
      tracker.lastDiffTime = now;
    }
  } else if (tokenDiff < 0) {
    tracker.lastUsage = currentUsage;
  }
  return tracker;
}
var currentWorkingDir = null;
async function trackWorkingDirectory(transcriptPath, initialDir) {
  if (!currentWorkingDir) {
    currentWorkingDir = initialDir;
  }
  try {
    const content = await readFile2(transcriptPath, "utf-8");
    const transcript = JSON.parse(content);
    const recentEntries = transcript.slice(-20);
    for (const entry of recentEntries) {
      if (entry.type === "user" || entry.type === "assistant") {
        const entryContent = entry.content || "";
        let bashCommands = [];
        const functionMatches = entryContent.match(/<function=Bash>([\s\S]*?)<\/function>/g);
        if (functionMatches) {
          for (const match of functionMatches) {
            const innerContent = match.replace(/<\/?function=Bash>/g, "");
            const commandMatch = innerContent.match(/"command"\s*:\s*"([^"]*cd[^"]*)"/);
            if (commandMatch) {
              bashCommands.push(commandMatch[1]);
            } else if (innerContent.includes("cd")) {
              bashCommands.push(innerContent);
            }
          }
        }
        if (bashCommands.length === 0) {
          const directCdMatch = entryContent.match(/(?:^\s*|\n)(cd\s+[^\n]+)/g);
          if (directCdMatch) {
            bashCommands.push(...directCdMatch);
          }
        }
        for (const cmd of bashCommands) {
          const normalizedCmd = cmd.replace(/\\'/g, "'").replace(/\\"/g, '"');
          const cdPatterns = [
            /(?:^|&&\s*|;\s*)cd\s+([^\s&;]+)/,
            /cd\s+&&/,
            /cd\s+"([^"]+)"/,
            /cd\s+'([^']+)'/
          ];
          for (const pattern of cdPatterns) {
            const match = normalizedCmd.match(pattern);
            if (match) {
              let targetDir = match[1];
              if (!targetDir && match[0]?.includes("cd &&")) {
                continue;
              }
              if (targetDir) {
                targetDir = targetDir.replace(/^["']|["']$/g, "").trim();
                if (targetDir.startsWith("/") || targetDir.match(/^[A-Za-z]:\\/)) {
                  currentWorkingDir = targetDir;
                } else if (targetDir === "..") {
                  const parts = (currentWorkingDir || initialDir).split(/[/\\]/);
                  parts.pop();
                  currentWorkingDir = parts.join("/");
                } else if (targetDir === "~") {
                  const workspaceParts = initialDir.split(/[/\\]/);
                  if (workspaceParts.length >= 2) {
                    currentWorkingDir = workspaceParts.slice(0, 2).join("/");
                  } else {
                    currentWorkingDir = initialDir;
                  }
                } else {
                  const basePath = currentWorkingDir || initialDir;
                  const separator = basePath.includes("/") ? "/" : "\\";
                  currentWorkingDir = basePath + separator + targetDir;
                }
                if (currentWorkingDir) {
                  currentWorkingDir = currentWorkingDir.replace(/\\/g, "/");
                }
              }
            }
          }
        }
      }
    }
    return currentWorkingDir || initialDir;
  } catch {
    return initialDir;
  }
}
async function loadConfig() {
  try {
    const content = await readFile2(CONFIG_FILE_PATH, "utf-8");
    const userConfig = JSON.parse(content);
    return mergeConfig(userConfig);
  } catch {
    return defaultConfig;
  }
}
async function getContextInfo(input, config, actualTranscriptPath) {
  const now = Date.now();
  let result;
  console.error(`[DEBUG] usePayloadContextWindow: ${config.context.usePayloadContextWindow}`);
  console.error(`[DEBUG] input.transcript_path: ${input.transcript_path}`);
  console.error(`[DEBUG] actualTranscriptPath: ${actualTranscriptPath}`);
  console.error(`[DEBUG] detectedClearSession: ${actualTranscriptPath !== input.transcript_path}`);
  console.error(`[DEBUG] input.context_window: ${!!input.context_window}`);
  if (input.context_window) {
    console.error(`[DEBUG] total_input_tokens: ${input.context_window.total_input_tokens}`);
    console.error(`[DEBUG] current_usage:`, input.context_window.current_usage);
  }
  let usePayloadContext = config.context.usePayloadContextWindow && !!input.context_window;
  if (usePayloadContext && input.context_window) {
    const payloadTokens = input.context_window.total_input_tokens || 0;
    const { trust: trustPayload, reason } = await shouldTrustPayload(
      actualTranscriptPath,
      input.transcript_path,
      payloadTokens
    );
    console.error(`[DEBUG] Trust payload: ${trustPayload} (reason: ${reason})`);
    if (!trustPayload) {
      usePayloadContext = false;
    }
  }
  if (usePayloadContext && input.context_window) {
    const current = input.context_window.current_usage;
    let tokens = 0;
    let maxTokens = input.context_window.context_window_size || config.context.maxContextTokens;
    if (current) {
      tokens = (current.input_tokens || 0) + (current.cache_creation_input_tokens || 0) + (current.cache_read_input_tokens || 0);
    }
    if (tokens === 0 && input.context_window.total_input_tokens) {
      tokens = input.context_window.total_input_tokens;
    }
    if (tokens > 0) {
      const percentage = Math.min(
        100,
        Math.round(tokens / maxTokens * 100)
      );
      console.error(`[DEBUG] Using payload context: ${tokens} tokens (${percentage}%)`);
      let baseContextTokens = 0;
      if (config.context.includeBaseContext && config.context.baseContextPath) {
        try {
          const { getBaseContextTokens: getBaseContextTokens2 } = await Promise.resolve().then(() => (init_context(), context_exports));
          baseContextTokens = await getBaseContextTokens2(
            config.context.baseContextPath
          );
          if (!isFinite(baseContextTokens) || baseContextTokens < 0) {
            baseContextTokens = 0;
          }
        } catch {
          baseContextTokens = 0;
        }
      }
      const transcriptTokens = Math.max(0, tokens - baseContextTokens);
      result = {
        tokens,
        percentage,
        lastOutputTokens: null,
        baseContext: baseContextTokens,
        transcriptContext: transcriptTokens,
        userTokens: transcriptTokens
        // User tokens exclude system/base context
      };
      contextCache = { timestamp: now, sessionId: actualTranscriptPath, data: result };
      return result;
    }
    console.error(`[DEBUG] Payload context not available, falling back to transcript`);
  }
  if (contextCache && contextCache.sessionId === actualTranscriptPath && // ✅ Check by transcript path
  now - contextCache.timestamp < CACHE_TTL * 3 && contextCache.data.tokens !== null && contextCache.data.tokens > 0) {
    return contextCache.data;
  }
  const contextData = await getContextData({
    transcriptPath: actualTranscriptPath,
    maxContextTokens: config.context.maxContextTokens,
    autocompactBufferTokens: config.context.autocompactBufferTokens,
    useUsableContextOnly: config.context.useUsableContextOnly,
    overheadTokens: config.context.overheadTokens,
    includeBaseContext: config.context.includeBaseContext,
    baseContextPath: config.context.baseContextPath
    // NOTE: workspaceDir removed - we don't count project .claude/ in base context
  });
  result = {
    tokens: contextData.tokens,
    percentage: contextData.percentage,
    lastOutputTokens: contextData.lastOutputTokens,
    baseContext: contextData.baseContext,
    transcriptContext: contextData.transcriptContext,
    userTokens: contextData.userTokens
  };
  if (contextData.tokens !== null && contextData.percentage !== null) {
    contextCache = { timestamp: now, sessionId: actualTranscriptPath, data: result };
  }
  return result;
}
async function getSpendInfo(currentResetsAt) {
  if (!getPeriodCost2 || !getTodayCostV22) {
    return {};
  }
  const normalizedPeriodId = currentResetsAt ?? null;
  const periodCost = normalizedPeriodId ? await getPeriodCost2(normalizedPeriodId) : 0;
  const todayCost = await getTodayCostV22();
  return { periodCost, todayCost };
}
async function main() {
  try {
    const chunks = [];
    for await (const chunk of Bun.stdin.stream()) {
      chunks.push(Buffer.from(chunk));
    }
    const stdinContent = Buffer.concat(chunks).toString();
    const input = JSON.parse(stdinContent);
    const dataDir = dirname2(LAST_PAYLOAD_PATH);
    try {
      await mkdir(dataDir, { recursive: true });
    } catch {
    }
    await writeFile(LAST_PAYLOAD_PATH, JSON.stringify(input, null, 2));
    const actualTranscriptPath = await findActualTranscriptPath(input.transcript_path);
    const config = await loadConfig();
    const usageLimits = getUsageLimits2 ? await getUsageLimits2(config.features.usageLimits) : { five_hour: null, seven_day: null };
    const currentResetsAt = usageLimits.five_hour?.resets_at ?? void 0;
    if (saveSessionV22) {
      await saveSessionV22(input, currentResetsAt ?? null);
    }
    const git = await getGitStatus();
    const contextInfo = await getContextInfo(input, config, actualTranscriptPath);
    const spendInfo = await getSpendInfo(currentResetsAt);
    const currentUsage = contextInfo.tokens || 0;
    const sessionId = actualTranscriptPath;
    const tokenTracker = await loadTokenTracker(currentUsage, sessionId);
    let { diff: tokenDiff, shouldShow: showTokenDiff } = getTokenDiff(
      currentUsage,
      tokenTracker
    );
    const SPURIOUS_DIFF_THRESHOLD = 5e4;
    if (Math.abs(tokenDiff) > SPURIOUS_DIFF_THRESHOLD) {
      showTokenDiff = false;
      tokenTracker.lastUsage = currentUsage;
      tokenTracker.timestamp = Date.now();
      await saveTokenTracker(tokenTracker);
    } else {
      const updatedTracker = updateTracker(tokenTracker, currentUsage);
      await saveTokenTracker(updatedTracker);
    }
    let workingDir = await trackWorkingDirectory(
      actualTranscriptPath,
      input.workspace.current_dir
    );
    try {
      if (actualTranscriptPath) {
        const transcriptContent = await readFile2(actualTranscriptPath, "utf-8");
        const transcript = JSON.parse(transcriptContent);
        for (let i = transcript.length - 1; i >= 0; i--) {
          const entry = transcript[i];
          if (entry.type === "assistant" && entry.content) {
            const cwdMatch = entry.content.match(/"cwd"\s*:\s*"([^"]+)"/);
            if (cwdMatch && cwdMatch[1]) {
              workingDir = cwdMatch[1];
              break;
            }
          }
        }
      }
    } catch (e) {
    }
    const data = {
      branch: formatBranch(git, config.git),
      dirPath: formatPath(workingDir, config.pathDisplayMode),
      modelName: input.model.display_name,
      sessionCost: formatCost(
        input.cost.total_cost_usd,
        config.session.cost.format
      ),
      sessionDuration: formatDuration(input.cost.total_duration_ms),
      contextTokens: contextInfo.tokens,
      contextPercentage: contextInfo.percentage,
      lastOutputTokens: contextInfo.lastOutputTokens,
      tokenDiff: showTokenDiff ? tokenDiff : void 0,
      baseContext: contextInfo.baseContext,
      transcriptContext: contextInfo.transcriptContext,
      userTokens: contextInfo.userTokens,
      ...getUsageLimits2 && {
        usageLimits: {
          five_hour: usageLimits.five_hour ? {
            utilization: usageLimits.five_hour.utilization,
            resets_at: usageLimits.five_hour.resets_at
          } : null,
          seven_day: usageLimits.seven_day ? {
            utilization: usageLimits.seven_day.utilization,
            resets_at: usageLimits.seven_day.resets_at
          } : null
        }
      },
      ...(getPeriodCost2 || getTodayCostV22) && spendInfo
    };
    const output = renderStatusline(data, config);
    console.log(output);
    try {
      await writeFile(LAST_PAYLOAD_PATH.replace(".txt", "_debug.txt"), JSON.stringify({
        input_transcript: input.transcript_path,
        actual_transcript: actualTranscriptPath,
        detected_clear: actualTranscriptPath !== input.transcript_path,
        context_tokens: contextInfo.tokens,
        user_tokens: contextInfo.userTokens,
        total_input_tokens: input.context_window?.total_input_tokens
      }, null, 2));
    } catch {
    }
    if (config.oneLine) {
      console.log("");
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`${colors.red}Error:${colors.reset} ${errorMessage}`);
    console.log(`${colors.gray}Check statusline configuration${colors.reset}`);
  }
}
main();
export {
  renderStatusline
};
