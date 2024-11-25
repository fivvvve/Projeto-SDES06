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
});

// Consultar membros de um IZZY
server.get('/izzy/membros', async (req: Request, res: Response) => {
  // id = id do izzy, nome = nome do usuário - opcional
  const { id, nome } = req.query // ID do IZZY

  try {
    // Verifica se o IZZY existe
    const izzy = await prisma.izzy.findUnique({
      where: {
        id: String(id),
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    })

    // Se o IZZY não existir
    if (!izzy) {
      return res.status(404).send('IZZY não encontrado')
    }

    // Filtra os membros pelo nome, se o nome for fornecido
    let membros = izzy.users.map((membro: any) => {
      return {
        responsavel: membro.responsavel,
        saiu: membro.saiu,
        nome: membro.user.nome,
        email: membro.user.email,
      }
    })

    if (nome) {
      membros = membros.filter((membro: any) =>
        membro.nome.toLowerCase().includes(String(nome).toLowerCase()),
      )
    }

    // Retorna a lista de membros
    res.status(200).send(membros)
  } catch (error) {
    res
      .status(400)
      .send(
        'Desculpe, não foi possível consultar os membros. Tente novamente mais tarde',
      )
  }
})


server.post('/gerarcodigo', async (req: Request, res: Response) => {
  // id = id do izzy
  const { id } = req.body

  const code = nanoid(8)
  const senha = nanoid(10)

  try {
    await prisma.izzy.update({
      where: {
        id: String(id),
      },
      data: {
        codigo_convite: code,
        senha: String(senha),
      },
    })

    res.status(200).send({ code, senha })
  } catch (error) {
    res
      .status(400)
      .send(
        'Desculpe, não foi possível gerar o código de convite. Tente novamente',
      )
  }
})

// Entrar em um IZZY
server.post('/izzy/entrar', async (req: Request, res: Response) => {
  // codigo = codigo de convite do izzy, senha = senha necessaria para entrar no izzy, id = id do usuario
  const { codigo, senha, userId } = req.body

  try {
    // Verifica se o IZZY com o código de convite existe
    const izzy = await prisma.izzy.findUnique({
      where: {
        codigo_convite: codigo,
        senha,
      },
      include: {
        users: {
          select: {
            user_id: true,
            saiu: true,
          },
        },
      },
    })

    // Se o IZZY não existir
    if (!izzy) {
      return res.status(404).send('Código de convite ou senha inválidos')
    }

    // Verifica se o usuário já faz parte do IZZY
    const alreadyMember = izzy.users.filter(
      (user: any) => user.user_id === userId,
    )[0]

    // Se o usuário já faz ou fazia parte do IZZY
    if (alreadyMember) {
      // fazia parte mas saiu
      if (alreadyMember.saiu) {
        await prisma.user_izzy.update({
          where: {
            user_id_izzy_id: {
              user_id: alreadyMember.user_id,
              izzy_id: izzy.id,
            },
          },
          data: {
            saiu: false,
          },
        })

        return res.status(200).send('Você entrou novamente no IZZY com sucesso')
      } else {
        // caso realmente ja faca parte
        return res
          .status(200)
          .send('Você já faz parte deste IZZY. Redirecionando...')
      }
    }

    // Adiciona o usuário à lista de membros do IZZY
    await prisma.user_izzy.create({
      data: {
        user_id: userId,
        izzy_id: izzy.id,
        responsavel: false, // Não será o responsável, apenas um membro
      },
    })

    // Confirma a adição do usuário ao IZZY
    res.status(200).send('Você entrou no IZZY com sucesso')
  } catch (error) {
    res
      .status(400)
      .send(
        'Desculpe, não foi possível entrar no IZZY. Tente novamente mais tarde',
      )
  }
})

// Consultar membros de um IZZY
server.get('/izzy/membros', async (req: Request, res: Response) => {
  // id = id do izzy, nome = nome do usuário - opcional
  const { id, nome } = req.query // ID do IZZY

  try {
    // Verifica se o IZZY existe
    const izzy = await prisma.izzy.findUnique({
      where: {
        id: String(id),
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    })

    // Se o IZZY não existir
    if (!izzy) {
      return res.status(404).send('IZZY não encontrado')
    }

    // Filtra os membros pelo nome, se o nome for fornecido
    let membros = izzy.users.map((membro: any) => {
      return {
        responsavel: membro.responsavel,
        saiu: membro.saiu,
        nome: membro.user.nome,
        email: membro.user.email,
      }
    })

    if (nome) {
      membros = membros.filter((membro: any) =>
        membro.nome.toLowerCase().includes(String(nome).toLowerCase()),
      )
    }

    // Retorna a lista de membros
    res.status(200).send(membros)
  } catch (error) {
    res
      .status(400)
      .send(
        'Desculpe, não foi possível consultar os membros. Tente novamente mais tarde',
      )
  }
})

// Sair de um IZZY
server.post('/izzy/sair', async (req: Request, res: Response) => {
  // id = id do izzy, userId = id do usuario que vai sair do izzy
  const { id, userId } = req.body // ID do IZZY

  try {
    // Busca o IZZY pelo ID
    const izzy = await prisma.izzy.findUnique({
      where: {
        id: String(id),
      },
      include: {
        users: {
          where: {
            saiu: false,
          },
        },
        _count: {
          select: {
            users: {
              where: {
                responsavel: true,
                saiu: false,
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

    // busca objeto do usuário que está saindo do izzy
    const user = izzy.users.find((user: any) => user.user_id === userId)

    if (!user) {
      return res.status(400).send('Você não tem acesso a esse IZZY')
    }

    // Verifica se o usuário é o único no IZZY
    if (izzy.users.length === 1) {
      await prisma.$transaction([
        // Remove o IZZY
        prisma.user_izzy.deleteMany({
          where: {
            izzy_id: String(id),
          },
        }),

        prisma.izzy.delete({
          where: { id: String(id) },
        }),
      ])

      return res
        .status(200)
        .send(
          'Removido do IZZY com sucesso. Como não haviam outros usuários o IZZY foi removido.',
        )
    }

    if (!user.responsavel) {
      await prisma.user_izzy.delete({
        where: {
          user_id_izzy_id: {
            user_id: String(userId),
            izzy_id: String(id),
          },
        }
      })

      await prisma.atividade_user.deleteMany({
        where: {
          user_id: String(userId),
          atividade: {
            izzy_id: String(id),
          }
        }
      })

      return res.status(200).send('Removido do IZZY com sucesso.')
    } else {
      // caso usuario seja o unico responsavel
      if (izzy._count.users === 1) {
        // transfere a responsabilidade para o primeiro usuário encontrado
        // primeiro usuario encontrado
        let newResponsible
        for (const user of izzy.users) {
          if (user.user_id !== userId) {
            newResponsible = user
            break
          }
        }

        // atualiza o usuario que vai sair do IZZY
        await prisma.user_izzy.delete({
          where: {
            user_id_izzy_id: {
              izzy_id: String(id),
              user_id: String(userId),
            },
          }
        })

        await prisma.atividade_user.deleteMany({
          where: {
            user_id: String(userId),
            atividade: {
              izzy_id: String(id),
            }
          }
        })

        if (!newResponsible) {
          res.status(404).send('Usuários não encontrados')
          return
        }

        // atualiza o IZZY para atribuir o responsavel ao primeiro usuario
        await prisma.user_izzy.update({
          where: {
            user_id_izzy_id: {
              user_id: newResponsible.user_id,
              izzy_id: String(id),
            },
          },
          data: {
            responsavel: true,
          },
        })

        return res
          .status(200)
          .send(
            'Removido do IZZY com sucesso. A responsabilidade foi transferida para um novo membro',
          )
      } else {
        // caso haja outros responsaveis
        await prisma.user_izzy.delete({
          where: {
            user_id_izzy_id: {
              user_id: String(userId),
              izzy_id: String(id),
            },
          }
        })

        await prisma.atividade_user.deleteMany({
          where: {
            user_id: String(userId),
            atividade: {
              izzy_id: String(id),
            }
          }
        })

        return res.status(200).send('Removido do IZZY com sucesso.')
      }
    }
  } catch (error) {
    res
      .status(400)
      .send(
        'Desculpe, não foi possível sair do IZZY. Tente novamente mais tarde',
      )
  }
})

// Remover Membro de um IZZY
server.post('/izzy/remover-membro', async (req: Request, res: Response) => {
  // izzyId = id do izzy que vai ter o usuario removido, userEmailtoRemove = email do usuario que vai ser removido, userId = id de quem tá removendo
  const { izzyId, userEmailtoRemove, userId } = req.body

  try {
    // Verifica se o IZZY existe e se o usuário é o responsável
    const izzy = await prisma.izzy.findUnique({
      where: { id: izzyId },
      include: {
        users: {
          where: {
            user_id: String(userId),
            responsavel: true,
          },
        },
      },
    })

    // Se o IZZY não existir ou o usuário não for o responsável
    if (!izzy || izzy.users.length === 0) {
      return res
        .status(403)
        .send('Você não tem permissão para remover membros deste IZZY')
    }

    // busca usuario a ser removido
    const userToRemove = await prisma.user.findUnique({
      where: {
        email: userEmailtoRemove,
        excluido: false,
      },
    })

    if (!userToRemove) {
      return res.status(404).send('Usuário a ser removido não encontrado')
    }

    // Verifica se o membro a ser removido faz parte do IZZY
    const memberToRemove = await prisma.user_izzy.findUnique({
      where: {
        user_id_izzy_id: {
          user_id: userToRemove.id,
          izzy_id: izzyId,
        },
        saiu: false,
      },
    })

    // Se o membro a ser removido não fizer parte do IZZY
    if (!memberToRemove) {
      return res
        .status(404)
        .send(
          'O membro que você está tentando remover não faz parte deste IZZY',
        )
    }

    await prisma.user_izzy.delete({
      where: {
        user_id_izzy_id: {
          user_id: userToRemove.id,
          izzy_id: izzyId
        }
      }
    })

    await prisma.atividade_user.deleteMany({
      where: {
        user_id: userToRemove.id,
        atividade: {
          izzy_id: izzyId
        }
      }
    })

    // Remove o membro da lista de membros do IZZY
    // await prisma.user_izzy.update({
    //   where: {
    //     user_id_izzy_id: {
    //       user_id: userToRemove.id,
    //       izzy_id: izzyId,
    //     },
    //   },
    //   data: {
    //     saiu: true,
    //     responsavel: false,
    //   },
    // })

    res.status(200).send('Membro removido com sucesso')
  } catch (error) {
    res
      .status(400)
      .send(
        'Desculpe, não foi possível remover o membro. Tente novamente mais tarde',
      )
  }
})

// Adicionar Responsável por um IZZY
server.post(
  '/izzy/adicionar-responsavel',
  async (req: Request, res: Response) => {
    // izzyId = id do izzy que recebera um novo responsavel, emailToPromote = email do usuario que sera um novo responsavel, userId = id do usuario que esta adicionando um novo responsavel
    const { izzyId, emailToPromote, userId } = req.body

    try {
      // Verifica se o IZZY existe e se o usuário atual é o responsável
      const izzy = await prisma.izzy.findUnique({
        where: { id: izzyId },
        include: {
          users: {
            where: {
              user_id: userId,
              responsavel: true,
            },
          },
        },
      })

      // Se o IZZY não existir ou o usuário atual não for o responsável
      if (!izzy || izzy.users.length === 0) {
        return res
          .status(403)
          .send('Você não tem permissão para adicionar responsáveis neste IZZY')
      }

      // Verifica se o usuário com o email fornecido existe
      const userToPromote = await prisma.user.findUnique({
        where: { email: emailToPromote },
      })

      if (!userToPromote) {
        return res
          .status(404)
          .send('Usuário com o email fornecido não foi encontrado')
      }

      // Verifica se o usuário a ser promovido faz parte do IZZY
      const memberToPromote = await prisma.user_izzy.findUnique({
        where: {
          user_id_izzy_id: {
            user_id: userToPromote.id,
            izzy_id: izzyId,
          },
          saiu: false,
        },
      })

      if (!memberToPromote) {
        return res
          .status(404)
          .send('O membro a ser promovido não faz parte deste IZZY')
      }

      // Atualiza a relação do membro, tornando-o responsável
      await prisma.user_izzy.update({
        where: {
          user_id_izzy_id: {
            user_id: userToPromote.id,
            izzy_id: izzyId,
          },
        },
        data: {
          responsavel: true,
        },
      })

      res.status(200).send('Responsável adicionado com sucesso')
    } catch (error) {
      res
        .status(400)
        .send(
          'Desculpe, não foi possível adicionar o responsável. Tente novamente mais tarde',
        )
    }
  },
)

export default server
