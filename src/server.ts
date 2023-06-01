import fastify, { FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import cors from '@fastify/cors'
import 'dotenv/config'
import axios from 'axios'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import { randomUUID } from 'crypto'
import { extname, resolve } from 'path'
import { createWriteStream } from 'fs'
import { pipeline } from 'stream'
import { promisify } from 'util'
import { env } from 'process'
const pump = promisify(pipeline)

const app = fastify()

app.register(require('@fastify/static'), {
  // posso acessar todos os arquivos da pasta uploads agora
  root: resolve(__dirname, '../uploads'),
  prefix: '/uploads',
})

app.register(multipart)

app.register(cors, {
  origin: true,
})

app.register(jwt, {
  // um token usado pra identificação do usuario pra ver se está logado e o backend pode definir quanto tempo até ser deslogado
  secret: 'spacetime',
})

declare module '@fastify/jwt' {
  export interface FastifyJWT {
    user: {
      sub: string
      name: string
      avatarUrl: string
    }
  }
}

const prisma = new PrismaClient({
  log: ['query'],
})

/* HTTP Method: GET global */
app.get('/memories', async (request: FastifyRequest) => {
  // essa rota vai listar todoas as memorias
  await request.jwtVerify() // verifica se a requisição que o front end ta fazendo  para essa rota esta vindo o token , se n tiver vindo ela mostra o erro

  const memories = await prisma.memory.findMany({
    /* estou pegando a memoria que vem do banco de dados */
    where: {
      // userId = sub(id do usuario)
      userId: request.user.sub,
    },
    orderBy: {
      /* orderBy significa ordernar as memorias */
      createdAt:
        'asc' /* aqui estou ordernando de forma da mais antiga pra mais nova */,
    },
  })

  return memories.map((memory) => {
    return {
      id: memory.id,
      coverUrl: memory.coverUrl,
      excerpt: memory.content,
      // .substring(0, 115)
      //   .concat(
      //     '...',
      //   )
      createdAt: memory.createdAt, // data da memoria quando foi criada
    }
  })
})

/* HTTP Method: GET especifico */
// app.get('/memories/:id', async (request, replay) => {
//   /* essa rota vai listar uma memoria em especifico/detalhe e pra isso tenho que ter acesso ao id da memoria */
//   await request.jwtVerify()
//   const paramsSchema = z.object({
//     /* meu params é um objeto e dentro dele eu espero que tenha um id do tipo string */
//     id: z.string().uuid(),
//   })

//   const { id } = paramsSchema.parse(
//     request.params,
//   ) /* estou pegando o request.params e passando pro paramsSchema para ele fazer a validação */

//   const memory = await prisma.memory.findUnique({
//     /* encontrando apenas uma única memoria onde o id seja igual o id que eu to recebendo como parametro */
//     where: {
//       id,
//     },
//   })

//   if (!memory?.isPublic && memory?.userId !== request.user.sub) {
//     // se a memoria não for publica e se o id do usuario da memoria for diferente do usuario logado eu não posso permitir que a memoria seja retornada
//     return replay.status(401).send()
//   }

//   return memory
// })

/* HTTP Method: POST */
app.post('/memories', async (request: FastifyRequest) => {
  /* essa rota vai criar as memorias */
  await request.jwtVerify()
  const bodySchema = z.object({
    content: z.string(),
    coverUrl: z.string(),
    isPublic: z.coerce.boolean().default(false),
  })

  const { content, coverUrl, isPublic } = bodySchema.parse(request.body)

  const memory = await prisma.memory.create({
    data: {
      content,
      coverUrl,
      isPublic,
      userId: request.user.sub,
    },
  })
  return memory
})
/* HTTP Method: PUT */
app.put(
  '/memories/:id',
  async (request: FastifyRequest, replay: FastifyReply) => {
    /* essa rota vai atualizar o conteúdo das memorias  */
    await request.jwtVerify()
    const paramsSchema = z.object({
      /* meu params é um objeto e dentro dele eu espero que tenha um id do tipo string */
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(
      request.params,
    ) /* estou pegando o request.params e passando pro paramsSchema para ele fazer a validação */

    const bodySchema = z.object({
      content: z.string(), // É obrigatório
      coverUrl: z.string(), // É obrigatório
      isPublic: z.coerce.boolean().default(false), // É obrigatório, mas se não passar nada será false
    })

    const { content, coverUrl, isPublic } = bodySchema.parse(request.body)

    let memory = await prisma.memory.findUnique({
      where: {
        id,
      },
    })

    if (memory?.userId !== request.user.sub) {
      // se o id do usuario que criou a memoria for diferente do id do usuario logado
      return replay.status(401).send()
    }

    memory = await prisma.memory.update({
      /* atualizar a memoria do id que seja igual o id que estou recebendo na requisição */
      where: {
        id,
      },
      /* dados que eu vou atualizar */
      data: {
        content,
        coverUrl,
        isPublic,
      },
    })
    return memory
  },
)

/* PARTE DE AUTH DO LOGIN */
app.post('/register', async (request: FastifyRequest) => {
  const bodySchema = z.object({
    // validação para garantir que dentro do corpo da requisição venha o código
    code: z.string(),
  })

  const { code } = bodySchema.parse(request.body)

  const accessTokenResponse = await axios.post(
    'https://github.com/login/oauth/access_token',
    null, // como não tem o corpo da requisição eu passo nulo
    {
      params: {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },

      headers: {
        Accept: 'application/json', // esse Accept eu to dizendo nesse caso pro github que eu quero a reposta da requisição (json)
      },
    },
  )

  const { access_token } = accessTokenResponse.data

  const userResponse = await axios.get('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })

  const userSchema = z.object({
    id: z.number(),
    login: z.string(),
    name: z.string(),
    avatar_url: z.string().url(),
  })

  const userInfo = userSchema.parse(userResponse.data)

  let user = await prisma.user.findUnique({
    // verificação para ver se o usuario ja existi no banco de dados
    where: {
      githubid: userInfo.id,
    },
  })

  if (!user) {
    // se não existi ele vai criar o usuario
    user = await prisma.user.create({
      data: {
        githubid: userInfo.id,
        login: userInfo.login,
        name: userInfo.name,
        avatarUrl: userInfo.avatar_url,
      },
    })
  }

  const token = app.jwt.sign(
    // criação do token jwt
    {
      // primeiro objeto é pra saber quais informações eu quero que esteja contida dentro do token(info não sensivel)
      name: user.name,
      avatarUrl: user.avatarUrl,
    },
    {
      sub: user.id,
      expiresIn: '30 days', // tempo que esse token vai durar, quando bater 15 dias após o login ele vai deslogar a pessoa
    },
  )

  return {
    token,
  }
})
/* PARTE DE UPLOAD DA IMG NO FRON */
app.post('/upload', async (request: FastifyRequest, replay: FastifyReply) => {
  const uploadIMG = await request.file({
    limits: {
      // limitando o tamnhanho do arquivo que pode entrar
      fileSize: 5_242_880, // 5 megabytes
    },
  })
  if (!uploadIMG) {
    // se não houver upload
    return replay.status(400).send()
  }

  const mimeTypeRegex = /^(image|video)\/[a-zA-Z]+/
  const isValidFormat = mimeTypeRegex.test(uploadIMG.mimetype)

  if (!isValidFormat) {
    return replay.status(400).send()
  }

  const fileID = randomUUID() // gerando um id diferente para cada arquivvo
  const extension = extname(uploadIMG.filename) // retornando a extensão do arquivo

  const filename = fileID.concat(extension) // novo nome do arquivo vai ser o id que gerei junsto da extensão do arquivo

  // EU NÃO PRECISO QUE O ARQUIVO CARREGUE INTEIRO PARA EU SALVAR ELE, NO CASO NA PASTA UPLOADS, SEGUE O CÓDIGO ABAIXO PARA ISSO ACONTECER
  const writeStream = createWriteStream(
    resolve(__dirname, '../uploads', filename), // salvando o nome do arquivo(filename) na pasta uploads
  )

  await pump(uploadIMG.file, writeStream) // pump ou pipilene permite aguardar o processo de upload finalizar

  // url de cada imagem da memoria, da capsula do tempo
  const fullUrl = request.protocol.concat('://').concat(request.hostname) // url do meu servidor
  const fileUrl = new URL(`/uploads/${filename}`, fullUrl).toString() // juntando (localhost... + /uploads + nome da imagem)

  return { fileUrl }
})

// verificando a existência do X-Request-Origin nos headers da requisição. Se ele existir,
// você verifica se o conteúdo dele inclui "web" ou "mobile", se for mobile você usa variáveis do mobile(env) se for web da web(env)
export async function VerifyUserAgente(
  request: FastifyRequest,
  replay: FastifyReply,
) {
  const requestOrigin = request.headers['x-request-origin']

  if (requestOrigin && requestOrigin.includes('web')) {
    env.GITHUB_CLIENT_ID = env.GITHUB_WEB_CLIENT_ID
    env.GITHUB_CLIENT_SECRET = env.GITHUB_WEB_CLIENT_SECRET
  } else if (requestOrigin && requestOrigin.includes('mobile')) {
    env.GITHUB_CLIENT_ID_MOBILE = env.GITHUB_MOBILE_CLIENT_ID
    env.GITHUB_CLIENT_SECRET_MOBILE = env.GITHUB_MOBILE_CLIENT_SECRET
  } else {
    replay.status(400).send({ message: 'Invalid user agent' })
  }
}

/* HTTP Method: DELETE global */
app.delete(
  '/memories/:id',
  async (request: FastifyRequest, replay: FastifyReply) => {
    const paramsSchema = z.object({
      /* eu espero que tenha um id do tipo string(validação) */
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(
      request.params,
    ) /* estou pegando o request.params e passando pro paramsSchema para ele fazer a validação */

    let memory = await prisma.memory.findUnique({
      where: {
        // estou procurando o id de alguma memoria
        id,
      },
    })
    memory = await prisma.memory.delete({
      /* deletando a memoria */
      where: {
        id,
      },
    })
    return memory
  },
)

/* CRIANDO A PORTA DE ONDE ESSA API VAI ME REDIRECIONAR(SERVIDOR) */
app
  .listen({
    port: 3333,
    host: '0.0.0.0',
  })
  .then(() => {
    console.log('HTTP server running on http://localhost:3333')
  })
