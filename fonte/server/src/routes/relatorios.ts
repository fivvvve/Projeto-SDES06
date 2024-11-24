import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { server } from '../lib/server'
import { differenceInDays } from 'date-fns';

// Relatório de atividades geral
server.post('/relatorio/atividades', async (req: Request, res: Response) => {

    //id - id do usuario
    //dataInicial e dataFinal sao obrigatorias
    //izzyId - array - id's dos izzy's que deseja utilizar para o relatorio - opcional
    const { id, dataInicialParam, dataFinalParam, izzysId } = req.body;


    if (!id) {
      return res.status(400).send()
    }

    try {

        const dataInicial = new Date(dataInicialParam);
        const dataFinal = new Date(dataFinalParam);

        dataInicial.setUTCHours(0, 0, 0, 0);
        dataFinal.setUTCHours(0, 0, 0, 0);

        const atividades = await prisma.atividade_user.findMany({
            where: {
                AND: [
                    {
                        user_id: id,
                    },
                    {
                        data_limite: {
                            gte: dataInicial
                        }
                    },
                    {
                        data_limite: {
                            lte: dataFinal
                        }
                    }
                ],
                ... (izzysId.length > 0 && {
                    atividade: {
                        izzy_id: {
                            in: izzysId
                        }
                    }
                })
            },
            include: {
                atividade: {
                    include: {
                        izzy: {
                            select: {
                                id: true,
                                nome: true
                            }
                        }
                    }
                }
            }
        });

        let izzys: any = {};
        atividades.forEach(atividade => {
            const key = `${atividade.atividade.izzy.id};${atividade.atividade.izzy.nome}`;
            if(izzys[key]) {
                if(atividade.status === "Concluída") {
                    izzys[key].countAtivNoPrazo++;
                } else if(atividade.status === "Concluída com Atraso") {
                    izzys[key].countAtivComAtraso++;
                } else if(atividade.status === "Atrasada") {
                    izzys[key].countQuantAtras++;
                }
            } else {
                izzys[key] = {
                    countAtivNoPrazo: 0,
                    countAtivComAtraso: 0,
                    countQuantAtras: 0
                }
                if(atividade.status === "Concluída") {
                    izzys[key].countAtivNoPrazo++;
                } else if(atividade.status === "Concluída com Atraso") {
                    izzys[key].countAtivComAtraso++;
                } else if(atividade.status === "Atrasada") {
                    izzys[key].countQuantAtras++;
                }
            }
        });

        const izzysArr = [];
        for(let key of Object.keys(izzys)) izzysArr.push({
            izzy: {
                id: key.split(';')[0],
                name: key.split(';')[1],
            },
            data: izzys[key]
        });

        izzysArr.sort((a : {
            izzy: {
                id: string,
                name: string
            },
            data: {
                countAtivNoPrazo : number,
                countAtivComAtraso: number,
                countQuantAtras: number
            }
        },
        b : {
            izzy: {
                id: string,
                name: string
            },
            data: {
                countAtivNoPrazo : number,
                countAtivComAtraso: number,
                countQuantAtras: number
            }
        }) => {
            return b.data.countAtivNoPrazo - a.data.countAtivNoPrazo;
        })

        res.status(200).send(izzysArr);
    } catch (error) {
        console.log(error);
        res.status(400).send('Erro ao gerar o relatório. Tente novamente mais tarde')
    }
});

// Relatório de atividades atrasadas
server.post('/relatorio/atrasadas', async (req: Request, res: Response) => {

    //id - id do usuario
    //titulo - titulo da atividade que o usuario quer ver no relatorio - opcional
    //ordem - ordem de retornos das atividades - undefined = ordem crescente, qualquer coisa = ordem decrescente - opcional
    const { id, titulo, ordem } = req.body;

    try {

        const atividades = await prisma.atividade_user.findMany({
            where: {
                user_id: id,
                status: "Atrasada",
                ... (titulo && {
                    atividade: {
                        titulo: {
                            contains: titulo
                        }
                    }
                })
            },
            orderBy: {
                ... (ordem ? {
                    data_limite: 'desc'
                } : {
                    data_limite: 'asc'
                })
            },
            include: {
                atividade: {
                    include: {
                        izzy: {
                            select: {
                                nome: true
                            }
                        }
                    }
                }
            }
        });

        const dataAtual = new Date();
        if(dataAtual.getUTCHours() < 3) dataAtual.setUTCDate(dataAtual.getUTCDate()-1);
        dataAtual.setUTCHours(0, 0, 0, 0);

        const atividadesReturn : {titulo: string, dataLimite: Date, izzy: string, quantDiasAtrasados: number}[] = [];

        atividades.forEach(atividade => {
            atividadesReturn.push({
                titulo: atividade.atividade.titulo,
                dataLimite: atividade.data_limite,
                izzy: atividade.atividade.izzy.nome,
                quantDiasAtrasados: differenceInDays(dataAtual, atividade.data_limite)
            });
        });

        res.status(200).send(atividadesReturn);
    } catch (error) {
        res.status(400).send('Erro ao gerar o relatório. Tente novamente mais tarde')
    }
});

// Relatório de participacao dos membros
server.post('/relatorio/membros', async (req: Request, res: Response) => {

    //todos os campos são obrigatorios
    //izzyId - id do izzy que sera considerado para gerar o relatorio
    const { dataInicialParam, dataFinalParam, izzyId } = req.body;

    try {

        const dataInicial = new Date(dataInicialParam);
        const dataFinal = new Date(dataFinalParam);

        dataInicial.setUTCHours(0, 0, 0, 0);
        dataFinal.setUTCHours(0, 0, 0, 0);

        const atividades = await prisma.atividade_user.findMany({
            where: {
                atividade: {
                    izzy_id: izzyId
                },
                AND: [
                    {
                        data_limite: {
                            gte: dataInicial
                        }
                    },
                    {
                        data_limite: {
                            lte: dataFinal
                        }
                    }
                ]
            },
            include: {
                atividade: {
                    include: {
                        izzy: {
                            select: {
                                nome: true
                            }
                        }
                    }
                },
                user: {
                    select: {
                        nome: true,
                        email: true
                    }
                }
            }
        });

        let membros : any = {};

        atividades.forEach(atividade => {
            const nome = `${atividade.user.nome} - ${atividade.user.email}`;
            if(membros.nome) {
                if(atividade.status === "Concluída") {
                    membros.nome.quantConcl++;
                } else if(atividade.status === "Concluída com Atraso") {
                    membros.nome.quantConclAtras++;
                } else if(atividade.status === "Atrasada") {
                    membros.nome.quantAtras++;
                }
            } else {
                membros.nome = {
                    quantConcl: 0,
                    quantConclAtras: 0,
                    quantAtras: 0
                }
                if(atividade.status === "Concluída") {
                    membros.nome.quantConcl++;
                } else if(atividade.status === "Concluída com Atraso") {
                    membros.nome.quantConclAtras++;
                } else if(atividade.status === "Atrasada") {
                    membros.nome.quantAtras++;
                }
            }
        });

        for(let key of Object.keys(membros)) {
            membros[key].percentageComplete = 100 * membros[key].quantConcl/(membros[key].quantConcl + membros[key].quantConclAtras + membros[key].quantAtras);
        }

        res.status(200).send(membros);
    } catch (error) {

        console.log(error);

        res.status(400).send('Erro ao gerar o relatório. Tente novamente mais tarde')
    }
});

export default server
