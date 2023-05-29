"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/dotenv/package.json
var require_package = __commonJS({
  "node_modules/dotenv/package.json"(exports, module2) {
    module2.exports = {
      name: "dotenv",
      version: "16.0.3",
      description: "Loads environment variables from .env file",
      main: "lib/main.js",
      types: "lib/main.d.ts",
      exports: {
        ".": {
          require: "./lib/main.js",
          types: "./lib/main.d.ts",
          default: "./lib/main.js"
        },
        "./config": "./config.js",
        "./config.js": "./config.js",
        "./lib/env-options": "./lib/env-options.js",
        "./lib/env-options.js": "./lib/env-options.js",
        "./lib/cli-options": "./lib/cli-options.js",
        "./lib/cli-options.js": "./lib/cli-options.js",
        "./package.json": "./package.json"
      },
      scripts: {
        "dts-check": "tsc --project tests/types/tsconfig.json",
        lint: "standard",
        "lint-readme": "standard-markdown",
        pretest: "npm run lint && npm run dts-check",
        test: "tap tests/*.js --100 -Rspec",
        prerelease: "npm test",
        release: "standard-version"
      },
      repository: {
        type: "git",
        url: "git://github.com/motdotla/dotenv.git"
      },
      keywords: [
        "dotenv",
        "env",
        ".env",
        "environment",
        "variables",
        "config",
        "settings"
      ],
      readmeFilename: "README.md",
      license: "BSD-2-Clause",
      devDependencies: {
        "@types/node": "^17.0.9",
        decache: "^4.6.1",
        dtslint: "^3.7.0",
        sinon: "^12.0.1",
        standard: "^16.0.4",
        "standard-markdown": "^7.1.0",
        "standard-version": "^9.3.2",
        tap: "^15.1.6",
        tar: "^6.1.11",
        typescript: "^4.5.4"
      },
      engines: {
        node: ">=12"
      }
    };
  }
});

// node_modules/dotenv/lib/main.js
var require_main = __commonJS({
  "node_modules/dotenv/lib/main.js"(exports, module2) {
    var fs = require("fs");
    var path = require("path");
    var os = require("os");
    var packageJson = require_package();
    var version = packageJson.version;
    var LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
    function parse(src) {
      const obj = {};
      let lines = src.toString();
      lines = lines.replace(/\r\n?/mg, "\n");
      let match;
      while ((match = LINE.exec(lines)) != null) {
        const key = match[1];
        let value = match[2] || "";
        value = value.trim();
        const maybeQuote = value[0];
        value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
        if (maybeQuote === '"') {
          value = value.replace(/\\n/g, "\n");
          value = value.replace(/\\r/g, "\r");
        }
        obj[key] = value;
      }
      return obj;
    }
    function _log(message) {
      console.log(`[dotenv@${version}][DEBUG] ${message}`);
    }
    function _resolveHome(envPath) {
      return envPath[0] === "~" ? path.join(os.homedir(), envPath.slice(1)) : envPath;
    }
    function config(options) {
      let dotenvPath = path.resolve(process.cwd(), ".env");
      let encoding = "utf8";
      const debug = Boolean(options && options.debug);
      const override = Boolean(options && options.override);
      if (options) {
        if (options.path != null) {
          dotenvPath = _resolveHome(options.path);
        }
        if (options.encoding != null) {
          encoding = options.encoding;
        }
      }
      try {
        const parsed = DotenvModule.parse(fs.readFileSync(dotenvPath, { encoding }));
        Object.keys(parsed).forEach(function(key) {
          if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
            process.env[key] = parsed[key];
          } else {
            if (override === true) {
              process.env[key] = parsed[key];
            }
            if (debug) {
              if (override === true) {
                _log(`"${key}" is already defined in \`process.env\` and WAS overwritten`);
              } else {
                _log(`"${key}" is already defined in \`process.env\` and was NOT overwritten`);
              }
            }
          }
        });
        return { parsed };
      } catch (e) {
        if (debug) {
          _log(`Failed to load ${dotenvPath} ${e.message}`);
        }
        return { error: e };
      }
    }
    var DotenvModule = {
      config,
      parse
    };
    module2.exports.config = DotenvModule.config;
    module2.exports.parse = DotenvModule.parse;
    module2.exports = DotenvModule;
  }
});

// node_modules/dotenv/lib/env-options.js
var require_env_options = __commonJS({
  "node_modules/dotenv/lib/env-options.js"(exports, module2) {
    var options = {};
    if (process.env.DOTENV_CONFIG_ENCODING != null) {
      options.encoding = process.env.DOTENV_CONFIG_ENCODING;
    }
    if (process.env.DOTENV_CONFIG_PATH != null) {
      options.path = process.env.DOTENV_CONFIG_PATH;
    }
    if (process.env.DOTENV_CONFIG_DEBUG != null) {
      options.debug = process.env.DOTENV_CONFIG_DEBUG;
    }
    if (process.env.DOTENV_CONFIG_OVERRIDE != null) {
      options.override = process.env.DOTENV_CONFIG_OVERRIDE;
    }
    module2.exports = options;
  }
});

// node_modules/dotenv/lib/cli-options.js
var require_cli_options = __commonJS({
  "node_modules/dotenv/lib/cli-options.js"(exports, module2) {
    var re = /^dotenv_config_(encoding|path|debug|override)=(.+)$/;
    module2.exports = function optionMatcher(args) {
      return args.reduce(function(acc, cur) {
        const matches = cur.match(re);
        if (matches) {
          acc[matches[1]] = matches[2];
        }
        return acc;
      }, {});
    };
  }
});

// src/server.ts
var server_exports = {};
__export(server_exports, {
  VerifyUserAgente: () => VerifyUserAgente
});
module.exports = __toCommonJS(server_exports);
var import_fastify = __toESM(require("fastify"));
var import_client = require("@prisma/client");
var import_zod = require("zod");
var import_cors = __toESM(require("@fastify/cors"));

// node_modules/dotenv/config.js
(function() {
  require_main().config(
    Object.assign(
      {},
      require_env_options(),
      require_cli_options()(process.argv)
    )
  );
})();

// src/server.ts
var import_axios = __toESM(require("axios"));
var import_jwt = __toESM(require("@fastify/jwt"));
var import_multipart = __toESM(require("@fastify/multipart"));
var import_crypto = require("crypto");
var import_path = require("path");
var import_fs = require("fs");
var import_stream = require("stream");
var import_util = require("util");
var import_process = require("process");
var pump = (0, import_util.promisify)(import_stream.pipeline);
var app = (0, import_fastify.default)();
app.register(require("@fastify/static"), {
  // posso acessar todos os arquivos da pasta uploads agora
  root: (0, import_path.resolve)(__dirname, "../uploads"),
  prefix: "/uploads"
});
app.register(import_multipart.default);
app.register(import_cors.default, {
  origin: true
});
app.register(import_jwt.default, {
  // um token usado pra identificação do usuario pra ver se está logado e o backend pode definir quanto tempo até ser deslogado
  secret: "spacetime"
});
var prisma = new import_client.PrismaClient({
  log: ["query"]
});
app.get("/memories", async (request) => {
  await request.jwtVerify();
  const memories = await prisma.memory.findMany({
    /* estou pegando a memoria que vem do banco de dados */
    where: {
      // userId = sub(id do usuario)
      userId: request.user.sub
    },
    orderBy: {
      /* orderBy significa ordernar as memorias */
      createdAt: "asc"
    }
  });
  return memories.map((memory) => {
    return {
      id: memory.id,
      coverUrl: memory.coverUrl,
      excerpt: memory.content,
      // .substring(0, 115)
      //   .concat(
      //     '...',
      //   )
      createdAt: memory.createdAt
      // data da memoria quando foi criada
    };
  });
});
app.post("/memories", async (request) => {
  await request.jwtVerify();
  const bodySchema = import_zod.z.object({
    content: import_zod.z.string(),
    coverUrl: import_zod.z.string(),
    isPublic: import_zod.z.coerce.boolean().default(false)
  });
  const { content, coverUrl, isPublic } = bodySchema.parse(request.body);
  const memory = await prisma.memory.create({
    data: {
      content,
      coverUrl,
      isPublic,
      userId: request.user.sub
    }
  });
  return memory;
});
app.put(
  "/memories/:id",
  async (request, replay) => {
    await request.jwtVerify();
    const paramsSchema = import_zod.z.object({
      /* meu params é um objeto e dentro dele eu espero que tenha um id do tipo string */
      id: import_zod.z.string().uuid()
    });
    const { id } = paramsSchema.parse(
      request.params
    );
    const bodySchema = import_zod.z.object({
      content: import_zod.z.string(),
      // É obrigatório
      coverUrl: import_zod.z.string(),
      // É obrigatório
      isPublic: import_zod.z.coerce.boolean().default(false)
      // É obrigatório, mas se não passar nada será false
    });
    const { content, coverUrl, isPublic } = bodySchema.parse(request.body);
    let memory = await prisma.memory.findUnique({
      where: {
        id
      }
    });
    if (memory?.userId !== request.user.sub) {
      return replay.status(401).send();
    }
    memory = await prisma.memory.update({
      /* atualizar a memoria do id que seja igual o id que estou recebendo na requisição */
      where: {
        id
      },
      /* dados que eu vou atualizar */
      data: {
        content,
        coverUrl,
        isPublic
      }
    });
    return memory;
  }
);
app.post("/register", async (request) => {
  const bodySchema = import_zod.z.object({
    // validação para garantir que dentro do corpo da requisição venha o código
    code: import_zod.z.string()
  });
  const { code } = bodySchema.parse(request.body);
  const accessTokenResponse = await import_axios.default.post(
    "https://github.com/login/oauth/access_token",
    null,
    // como não tem o corpo da requisição eu passo nulo
    {
      params: {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      },
      headers: {
        Accept: "application/json"
        // esse Accept eu to dizendo nesse caso pro github que eu quero a reposta da requisição (json)
      }
    }
  );
  const { access_token } = accessTokenResponse.data;
  const userResponse = await import_axios.default.get("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${access_token}`
    }
  });
  const userSchema = import_zod.z.object({
    id: import_zod.z.number(),
    login: import_zod.z.string(),
    name: import_zod.z.string(),
    avatar_url: import_zod.z.string().url()
  });
  const userInfo = userSchema.parse(userResponse.data);
  let user = await prisma.user.findUnique({
    // verificação para ver se o usuario ja existi no banco de dados
    where: {
      githubid: userInfo.id
    }
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        githubid: userInfo.id,
        login: userInfo.login,
        name: userInfo.name,
        avatarUrl: userInfo.avatar_url
      }
    });
  }
  const token = app.jwt.sign(
    // criação do token jwt
    {
      // primeiro objeto é pra saber quais informações eu quero que esteja contida dentro do token(info não sensivel)
      name: user.name,
      avatarUrl: user.avatarUrl
    },
    {
      sub: user.id,
      expiresIn: "30 days"
      // tempo que esse token vai durar, quando bater 15 dias após o login ele vai deslogar a pessoa
    }
  );
  return {
    token
  };
});
app.post("/upload", async (request, replay) => {
  const uploadIMG = await request.file({
    limits: {
      // limitando o tamnhanho do arquivo que pode entrar
      fileSize: 5242880
      // 5 megabytes
    }
  });
  if (!uploadIMG) {
    return replay.status(400).send();
  }
  const mimeTypeRegex = /^(image|video)\/[a-zA-Z]+/;
  const isValidFormat = mimeTypeRegex.test(uploadIMG.mimetype);
  if (!isValidFormat) {
    return replay.status(400).send();
  }
  const fileID = (0, import_crypto.randomUUID)();
  const extension = (0, import_path.extname)(uploadIMG.filename);
  const filename = fileID.concat(extension);
  const writeStream = (0, import_fs.createWriteStream)(
    (0, import_path.resolve)(__dirname, "../uploads", filename)
    // salvando o nome do arquivo(filename) na pasta uploads
  );
  await pump(uploadIMG.file, writeStream);
  const fullUrl = request.protocol.concat("://").concat(request.hostname);
  const fileUrl = new URL(`/uploads/${filename}`, fullUrl).toString();
  return { fileUrl };
});
async function VerifyUserAgente(request, replay) {
  const requestOrigin = request.headers["x-request-origin"];
  if (requestOrigin && requestOrigin.includes("web")) {
    import_process.env.GITHUB_CLIENT_ID = import_process.env.GITHUB_WEB_CLIENT_ID;
    import_process.env.GITHUB_CLIENT_SECRET = import_process.env.GITHUB_WEB_CLIENT_SECRET;
  } else if (requestOrigin && requestOrigin.includes("mobile")) {
    import_process.env.GITHUB_CLIENT_ID = import_process.env.GITHUB_MOBILE_CLIENT_ID;
    import_process.env.GITHUB_CLIENT_SECRET = import_process.env.GITHUB_MOBILE_CLIENT_SECRET;
  } else {
    replay.status(400).send({ message: "Invalid user agent" });
  }
}
app.delete(
  "/memories/:id",
  async (request, replay) => {
    const paramsSchema = import_zod.z.object({
      /* eu espero que tenha um id do tipo string(validação) */
      id: import_zod.z.string().uuid()
    });
    const { id } = paramsSchema.parse(
      request.params
    );
    let memory = await prisma.memory.findUnique({
      where: {
        // estou procurando o id de alguma memoria
        id
      }
    });
    memory = await prisma.memory.delete({
      /* deletando a memoria */
      where: {
        id
      }
    });
    return memory;
  }
);
app.listen({
  port: 3333,
  host: "0.0.0.0"
}).then(() => {
  console.log("HTTP server running on http://localhost:3333");
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  VerifyUserAgente
});
