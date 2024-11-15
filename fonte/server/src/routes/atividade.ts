import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { server } from "../lib/server";

const dias_semana_int = [
    'Domingo',
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta',
    'Sábado'
];

//Status de atividades:
//Pendente
//Atrasada
//Concluída
//Concluída com Atraso

// Criar Atividade
server.post("/atividade", async (req: Request, res: Response) => {

    //formato de datas = ano-mes-dia

    //izzyId = id do izzy de qual vai ser a atividade
    //userId = id do usuario que esta criando a atividade
    //titulo = titulo da atividade
    //descricao = descricao da atividade - opcional
    //data_inicio = data de inicio da atividade
    //tipo = tipo da atividade - Única || Iterativa
    //data_limite(usada com atividade do tipo Única) = data limite para a atividade ser realizada
    //data_final(usada com atividade do tipo Iterativa) = ate que data a atividade vai ser continuada - opcional
    //dias_semana(usada com atividade do tipo Iterativa) = indica os dias da semana que a atividade vai ser realizada - array (valores: Domingo, Segunda, Terça, Quarta, Quinta, Sexta,  Sábado)
    //responsaveis = email dos resposaveis pela atividade, caso seja vazio todos os usuarios do izzy serao responsaveis - array || vazio
    const { izzyId, userId, titulo, descricao, data_inicio, tipo, data_limite, dias_semana, data_final, responsaveis } = req.body;

    if(tipo != "Iterativa" && tipo != "Única") {
        return res.status(400).send("Tipo de atividade inválido");
    }

    try {
        // Validação: Data Inicial não pode ser anterior à data atual
        const dataAtual = new Date();
        if(dataAtual.getUTCHours() < 3) dataAtual.setUTCDate(dataAtual.getUTCDate()-1);
        dataAtual.setUTCHours(0, 0, 0, 0);

        const dataInicioAtividade = new Date(data_inicio);
        dataInicioAtividade.setUTCHours(0, 0, 0, 0);

        let data_lim, data_fim;

        if (dataInicioAtividade < dataAtual) {
            return res.status(400).send("A Data Inicial não pode ser anterior à data atual");
        }

        // Validação: Data Limite ou Data Final não podem ser anteriores à Data Inicial, se informadas
        if (data_limite) {
            data_lim = new Date(data_limite);
            data_lim.setUTCHours(0, 0, 0, 0);
            if(data_lim < dataInicioAtividade) {
                return res.status(400).send("A Data Limite não pode ser anterior à Data Inicial");
            }
        }

        if (data_final) {
            data_fim = new Date(data_final);
            data_fim.setUTCHours(0, 0, 0, 0);
            if(data_fim < dataInicioAtividade) {
                return res.status(400).send("A Data Final não pode ser anterior à Data Inicial");
            }
        }

        const izzy = await prisma.izzy.findUnique({
            where: {
                id: String(izzyId)
            },
            include: {
                users: {
                    where: {
                        user_id: String(userId)
                    }
                }
            }
        });

        if(!izzy || !izzy.users[0].responsavel) {
            return res.status(400).send("Você não tem permissão para criar uma atividade nesse IZZY");
        }

        // Se os responsáveis forem fornecidos, busca os usuários pelos emails
        let responsaveisAtividade = [];
        if (responsaveis && responsaveis.length > 0) {
            responsaveisAtividade = await prisma.user.findMany({
                where: {
                    AND: [
                        {
                            email: {
                                in: responsaveis
                            }
                        },
                        {
                            izzys: {
                                some: {
                                    izzy_id: izzyId
                                }
                            }
                        }
                    ]
                }
            });
            
            if (responsaveisAtividade.length !== responsaveis.length) {
                return res.status(404).send("Alguns dos emails fornecidos não correspondem a membros do IZZY");
            }
            

            responsaveisAtividade = responsaveisAtividade.map((resp) => ({
                user_id: resp.id
            }));

        } else {
            // Se não forem fornecidos responsáveis, todos os membros do IZZY serão responsáveis
            responsaveisAtividade = await prisma.user_izzy.findMany({
                where: {
                    izzy_id: izzyId,
                    saiu: false
                },
                select: {
                    user: true
                }
            });
            responsaveisAtividade = responsaveisAtividade.map((resp) => ({
                user_id: resp.user.id
            }));
        }

        let diasAtividade = [];
        const datasAtividade = [];
        if(tipo == "Iterativa") {
            if(dias_semana && dias_semana.length > 0) {
                //armazenar dias da semana que a atividade é realizada
                diasAtividade = dias_semana.map((dia: string) => ({
                    dia: dia
                }));

                //dias da semana que a atividade é realizada mas em inteiros
                const diasInt = dias_semana.map((dia: string) => dias_semana_int.indexOf(dia));

                //datas que a atividade tem que ser realizada, limitando a um período de uma semana
                let dataAux = dataInicioAtividade;
                for(let i=0; i<7; i++) {
                    if(data_fim && dataAux.getTime() > data_fim.getTime()) break;
                    //se o dia da semana atual pertence aos dias que a atividade deve ser realizada, para cada usuário responsável pela atividade adiciona a data
                    if(diasInt.indexOf(dataAux.getUTCDay()) != -1) {
                        for(const resp of responsaveisAtividade) {
                            datasAtividade.push({
                                user_id: resp.user_id,
                                data_limite: new Date(dataAux)
                            })
                        }
                    }
                    dataAux.setUTCDate(dataAux.getUTCDate()+1);
                }

            } else {
                return res.status(400).send("Formato inválido de atividade");
            }
        } else {
            for(const resp of responsaveisAtividade) {
                datasAtividade.push({
                    user_id: resp.user_id,
                    data_limite: new Date(data_limite)
                })
            }
        }

        // Criar a atividade
        await prisma.atividade.create({
            data: {
                titulo: titulo,
                descricao: descricao,
                tipo: tipo,
                data_inicio: new Date(data_inicio),
                data_limite: tipo === 'Única' ? data_lim : null,
                data_final: tipo === 'Iterativa' ? data_final ? data_fim : null : null,
                criador_id: userId, // Criador é o usuário atual
                izzy_id: izzyId,
                users: {
                    createMany: {
                        data: datasAtividade
                    }
                },
                dias_semana: {
                    createMany: {
                        data: diasAtividade
                    }
                }
            }
        });

        res.status(200).send("Atividade criada com sucesso");

    } catch (error: any) {

        res.status(400).send("Erro ao criar a atividade, tente novamente mais tarde");

    }
});

// Alterar Atividade
server.patch("/atividade", async (req: Request, res: Response) => {

    //atividadeId = id da atividade a ser atualizada
    //titulo = novo titulo da atividade
    //descricao = nova descrição da atividade (opcional)
    //data_limite = nova data limite da atividade a ser atualizada - somente para atividades do tipo Única (opcional)
    //data_final = nova data final da atividade a ser atualizada - somente para atividades do tipo Iterativa (opcional)
    //userId = id do usuário que está atualizando a atividade
    const { atividadeId, titulo, descricao, data_limite, data_final, userId } = req.body; // Recebendo os novos dados a serem alterados

    try {
        // Buscar a atividade pelo ID para verificar a data de início e se o usuário é responsável
        const atividade = await prisma.atividade.findUnique({
            where: {
                id: String(atividadeId),
            },
            include: {
                izzy: {
                    include: {
                        users: {
                            where: {
                                user_id: userId,
                                responsavel: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        dias_semana: true
                    }
                }
            }
        });

        // Verificar se a atividade existe e se o usuário é responsável
        if (!atividade || atividade.izzy.users.length === 0) {
            return res.status(403).send("Você não tem permissão para alterar esta atividade.");
        }

        const dataAtual = new Date();
        if(dataAtual.getUTCHours() < 3) dataAtual.setUTCDate(dataAtual.getUTCDate()-1);
        dataAtual.setUTCHours(0, 0, 0, 0);

        // Validação: Data Limite e Data Final não podem ser anteriores à Data Inicial ou à Data Atual
        let data_lim;
        if (data_limite && atividade.tipo === 'Única') {
            data_lim = new Date(data_limite);
            data_lim.setUTCHours(0, 0, 0, 0);
            if (data_lim < atividade.data_inicio || data_lim < dataAtual) {
                return res.status(400).send("A Data Limite não pode ser anterior à Data Inicial ou à Data Atual.");
            }
        }

        let data_fim;
        if (data_final && atividade.tipo === 'Iterativa') {
            data_fim = new Date(data_final);
            data_fim.setUTCHours(0, 0, 0, 0);
            if (data_fim < atividade.data_inicio || data_fim < dataAtual) {
                return res.status(400).send("A Data Final não pode ser anterior à Data Inicial ou à Data Atual.");
            }
        }


        // Atualizar os campos permitidos da atividade
        await prisma.atividade.update({
            where: {
                id: atividade.id
            },
            data: {
                titulo: titulo || atividade.titulo,  // Se o título for fornecido, altera, senão mantém o atual
                descricao: descricao || atividade.descricao,  // Descrição opcional
                data_limite: data_lim || atividade.data_limite,  // Atualizar a data limite, se fornecida
                data_final: data_fim || atividade.data_final  // Atualizar a data final, se fornecida
            }
        });

        if(data_lim && atividade.tipo === "Única" && data_lim !== atividade.data_limite) {

            //atualiza as atividades dos usuários indicando a nova data limite
            await prisma.atividade_user.updateMany({
                where: {
                    atividade_id: atividade.id
                },
                data: {
                    data_limite: data_lim
                }
            });

        } else if(data_fim && atividade.tipo === "Iterativa" && data_fim !== atividade.data_final) {


            //caso a atividade não tivesse data final ou a nova data final for menor que a data final anterior, exclui as atividades que possuem data maior que a nova data final
            if(!atividade.data_final || data_fim < atividade.data_final) {

                //apaga as atividades dos usuários que possuem data limite maior que a nova data final
                await prisma.atividade_user.deleteMany({
                    where: {
                        atividade_id: atividade.id,
                        data_limite: {
                            gt: data_fim
                        }
                    }
                });

            }
            //caso a nova data final seja maior que a data final anterior
            else if(data_fim > atividade.data_final) {

                //busca as atividades que ainda precisam ser realizadas
                const atividadesUser = await prisma.atividade_user.findMany({
                    where: {
                        atividade_id: atividade.id,
                        data_limite: {
                            gte: dataAtual
                        }
                    },
                    distinct: 'data_limite',
                    orderBy: {
                        data_limite: 'desc'
                    }
                });

                //caso a quantidade de atividades armazenadas para cada usuário seja menor que a quantidade de dias da semana que a atividade possui
                if(atividadesUser.length < atividade._count.dias_semana) {

                    //busca dados auxiliares da atividade
                    const atividadeDados = await prisma.atividade.findUnique({
                        where: {
                            id: atividade.id,
                        },
                        include: {
                            dias_semana: true,
                            users: {
                                distinct: 'user_id'
                            }
                        }
                    });

                    if(!atividadeDados) {
                        return res.status(500).send("Erro ao alterar a atividade. Tente novamente mais tarde.");
                    }

                    //data a partir de qual será tentado inserir novas datas
                    let dataAux = new Date(atividadesUser[0].data_limite);
                    dataAux.setUTCDate(dataAux.getUTCDate()+1);

                    //dias da semana que a atividade é realizada mas em inteiros
                    const diasInt = atividadeDados.dias_semana.map((dia) => dias_semana_int.indexOf(dia.dia));

                    //novas datas que serão inseridas
                    const datasAtividade = [];

                    //contador indicando quantos dias estão armazenados, é no máximo a quantidade de dias da semana que a atividade é realizada
                    let cont = atividadesUser.length;
                    while(cont < atividade._count.dias_semana && dataAux.getTime() <= data_fim.getTime()) {

                        //se o dia da semana atual pertence aos dias que a atividade deve ser realizada, para cada usuário responsável pela atividade adiciona a data
                        if(diasInt.indexOf(dataAux.getUTCDay()) != -1) {
                            for(const resp of atividadeDados.users) {
                                datasAtividade.push({
                                    atividade_id: atividade.id,
                                    user_id: resp.user_id,
                                    data_limite: new Date(dataAux)
                                });
                            }
                            cont++;
                        }
                        dataAux.setUTCDate(dataAux.getUTCDate()+1);

                    }

                    if(datasAtividade.length > 0) {
                        //insere os dados que foram criados
                        await prisma.atividade_user.createMany({
                            data: datasAtividade
                        });
                    }
                }

            }

        }

        res.status(200).send("Atividade alterada com sucesso.");

    } catch (error: any) {
        res.status(500).send("Erro ao alterar a atividade. Tente novamente mais tarde.");
    }
});

export default server;
