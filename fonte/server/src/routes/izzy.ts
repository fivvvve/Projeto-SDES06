import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { nanoid } from 'nanoid'
import { server } from '../lib/server'

// Criar IZZY
server.post('/izzy/create', async (req: Request, res: Response) => {
  // Dados para criar o IZZY
  const { nome, descricao, responsavelId } = req.body

  try {
    // Verifica se o responsável (usuário) existe
    const userExists = await prisma.user.count({
      where: {
        id: responsavelId,
      },
    })

    if (userExists === 0) {
      res.status(404).send('Usuário não encontrado')
      return
    }

    // Cria o novo IZZY com os dados fornecidos
    await prisma.izzy.create({
      data: {
        nome,
        descricao,
        users: {
          // Adiciona o usuário criador como o primeiro membro do IZZY
          create: [
            {
              user_id: responsavelId,
              responsavel: true,
            },
          ],
        },
      },
    })

    res.status(201).send(`IZZY criado com sucesso.`)
  } catch (error) {
    res.status(400).send('Desculpe, não foi possível criar o IZZY. Tente novamente mais tarde')
  }
})

// Alterar IZZY
server.patch('/izzy', async (req: Request, res: Response) => {
  // id = id do izzy, responsavelId = id de quem tá atualizando
  const { id, responsavelId, nome, descricao } = req.body

  try {
    // Verifica se o usuário é responsável pelo IZZY
    const isResponsavel = await prisma.user_izzy.findFirst({
      where: {
        izzy_id: id,
        user_id: responsavelId,
        responsavel: true,
      },
    })

    if (!isResponsavel) {
      res.status(403).send('Somente o responsável pode alterar este IZZY')
      return
    }

    // Atualiza os dados do IZZY
    await prisma.izzy.update({
      where: {
        id,
      },
      data: {
        nome,
        descricao,
      },
    })

    res.status(200).send('IZZY atualizado com sucesso')
  } catch (error) {
    res.status(400).send('Desculpe, não foi possível alterar o IZZY. Tente novamente mais tarde')
  }
})

// Pesquisar IZZYs
server.get('/izzys', async (req: Request, res: Response) => {
  // responsavel = "sim" indica que tá buscando izzys que o usuário é responsável
  // responsavel = "nao" indica que tá buscando izzys que o usuário não precisa ser responsável
  // responsavel = undefined indica que tá buscando qualquer izzy que o usuário faz parte
  // userId = id de quem tá fazendo a busca
  const { nome, responsavel, userId } = req.query

  const isResponsavel = responsavel === 'sim'

  try {
    // Constrói a consulta para buscar os IZZYs
    const izzys = await prisma.izzy.findMany({
      where: {
        AND: [
          {
            nome: {
              contains: nome ? String(nome) : '', // Filtra pelo nome se fornecido
            },
          },
          {
            users: {
              some: {
                user_id: String(userId), // ID do usuário que está realizando a pesquisa
                ...(responsavel && {
                  responsavel: isResponsavel, // Filtra por responsável se necessário
                }),
              },
            },
          },
        ],
      },
      orderBy: {
        nome: 'asc', // Ordena os resultados pelo nome em ordem alfabética
      },
      select: {
        nome: true,
        descricao: true,
        id: true,
      },
    })

    res.status(200).send(izzys)
  } catch (error) {
    res.status(400).send('Desculpe, não foi possível realizar a pesquisa. Tente novamente mais tarde')
  }
})

// Consultar IZZY
server.post('/izzyinfo', async (req: Request, res: Response) => {
  // id = id do izzy
  const { id, userId } = req.body

  try {
    // Busca o IZZY pelo ID fornecido
    const izzy = await prisma.izzy.findUnique({
      where: {
        id: String(id),
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                nome: true,
                email: true,
              },
            },
          },
        },
      },
    })

    // Verifica se o IZZY foi encontrado
    if (!izzy) {
      return res.status(404).send('IZZY não encontrado')
    }

    const user = izzy.users.find((user: any) => {
      return user.user_id === userId
    })

    if (!user) {
      return res.status(404).send('Você não faz parte desse IZZY')
    }

    if (!user.responsavel) {
      izzy.codigo_convite = izzy.senha = ''
    }

    // Retorna os dados do IZZY, incluindo os membros
    for (const user of izzy.users) {
      user.user_id = ''
    }

    res.status(200).send(izzy)
  } catch (error) {
    res.status(400).send('Desculpe, não foi possível consultar o IZZY. Tente novamente mais tarde')
  }
})

export default server
