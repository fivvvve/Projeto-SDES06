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

export default server
