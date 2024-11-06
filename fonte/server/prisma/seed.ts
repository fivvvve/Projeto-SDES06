const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Criar dois usuários
    const user1 = await prisma.user.create({
        data: {
            email: 'user1@example.com',
            nome: 'Usuário Um',
            senha: 'senha123',
        },
    });

    const user2 = await prisma.user.create({
        data: {
            email: 'user2@example.com',
            nome: 'Usuário Dois',
            senha: 'senha456',
        },
    });

    // Criar dois izzy's
    const izzyWithCode = await prisma.izzy.create({
        data: {
            nome: 'Izzy Com Código',
            descricao: 'Descrição do Izzy com código',
            codigo_convite: 'IZZY789',
            senha: 'senhaIzzy1',
        },
    });

    const izzyWithoutCode = await prisma.izzy.create({
        data: {
            nome: 'Izzy Sem Código',
            descricao: 'Descrição do Izzy sem código',
        },
    });

    // Associar usuários ao izzy com código
    await prisma.user_izzy.create({
        data: {
            user: { connect: { id: user1.id } },
            izzy: { connect: { id: izzyWithCode.id } },
            responsavel: true, // Usuário Um é responsável
        },
    });

    await prisma.user_izzy.create({
        data: {
            user: { connect: { id: user2.id } },
            izzy: { connect: { id: izzyWithCode.id } },
            responsavel: false, // Usuário Dois não é responsável
        },
    });

    await prisma.user_izzy.create({
        data: {
            user: { connect: { id: user2.id } },
            izzy: { connect: { id: izzyWithoutCode.id } },
            responsavel: true,
        },
    });

    atividade(izzyWithCode.id,
        user1.id,
        'Cronograma de',
        'Descrição do Cronograma de',
        new Date(),
        'Única',
        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        null,
        null,
        null
    );

    atividade(izzyWithCode.id,
        user1.id,
        'Trabaia Demais',
        'Descrição da atividade trabaia demais que consiste em trabaiar muito, o que pode acarretar em diversos consequências em que em determinadas circunstâncias pode vir a causar muito trabaio',
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        'Iterativa',
        null,
        ['Segunda', 'Quarta', 'Sábado'],
        null,
        null
    );

    atividade(izzyWithoutCode.id,
        user2.id,
        'Ir descansar Demais',
        'Às vezes, descansar é bom. Descansar né, o omi nu é di ferro',
        new Date(),
        'Iterativa',
        null,
        ['Terça', 'Domingo'],
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        null
    );

    atividade(izzyWithoutCode.id,
        user2.id,
        'Ir descansar Demais de novo',
        'Às vezes, descansar é bom, ainda mais quando é de novo. Descansar né, o omi nu é di ferro',
        new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        'Iterativa',
        null,
        ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
        null,
        null
    );
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });


const dias_semana_int = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
];

async function atividade(izzyId: string, userId: string, titulo: string, descricao: string | null, data_inicio: Date, tipo: string, data_limite: Date | null, dias_semana: string[] | null, data_final: Date | null, responsaveis: string[] | null) {
    const dataAtual = new Date();
    dataAtual.setUTCHours(0, 0, 0, 0);

    const dataInicioAtividade = new Date(data_inicio);
    dataInicioAtividade.setUTCHours(0, 0, 0, 0);

    let data_lim, data_fim;

    // Validação: Data Limite ou Data Final não podem ser anteriores à Data Inicial, se informadas
    if (data_limite) {
        data_lim = new Date(data_limite);
        data_lim.setUTCHours(0, 0, 0, 0);
    }

    if (data_final) {
        data_fim = new Date(data_final);
        data_fim.setUTCHours(0, 0, 0, 0);
    }

    const izzy = await prisma.izzy.findUnique({
        where: {
            id: String(izzyId),
        },
        include: {
            users: {
                where: {
                    user_id: String(userId),
                },
            },
        },
    });

    // Se os responsáveis forem fornecidos, busca os usuários pelos emails
    let responsaveisAtividade = [];
    if (responsaveis && responsaveis.length > 0) {
        responsaveisAtividade = await prisma.user.findMany({
            where: {
                AND: [
                    {
                        email: {
                            in: responsaveis,
                        },
                    },
                    {
                        izzys: {
                            some: {
                                izzy_id: izzyId,
                            },
                        },
                    },
                ],
            },
        });

        responsaveisAtividade = responsaveisAtividade.map((resp: any) => ({
            user_id: resp.id,
        }));
    } else {
        // Se não forem fornecidos responsáveis, todos os membros do IZZY serão responsáveis
        responsaveisAtividade = await prisma.user_izzy.findMany({
            where: {
                izzy_id: izzyId,
                saiu: false,
            },
            select: {
                user: true,
            },
        });
        responsaveisAtividade = responsaveisAtividade.map((resp: any) => ({
            user_id: resp.user.id,
        }));
    }

    let diasAtividade: any = [];
    const datasAtividade = [];
    if (tipo === "Iterativa") {
        if (dias_semana && dias_semana.length > 0) {
            // armazenar dias da semana que a atividade é realizada
            diasAtividade = dias_semana.map((dia: string) => ({
                dia,
            }));

            // dias da semana que a atividade é realizada mas em inteiros
            const diasInt = dias_semana.map((dia: string) =>
                dias_semana_int.indexOf(dia)
            );

            // datas que a atividade tem que ser realizada, limitando a um período de uma semana
            const dataAux = dataInicioAtividade;
            for (let i = 0; i < 7; i++) {
                if (data_fim && dataAux > data_fim) break;
                // se o dia da semana atual pertence aos dias que a atividade deve ser realizada, para cada usuário responsável pela atividade adiciona a data
                if (diasInt.indexOf(dataAux.getUTCDay()) !== -1) {
                    for (const resp of responsaveisAtividade) {
                        datasAtividade.push({
                            user_id: resp.user_id,
                            data_limite: new Date(dataAux),
                        });
                    }
                }
                dataAux.setUTCDate(dataAux.getUTCDate() + 1);
            }
        }
    } else {
        if (!data_limite) return;
        for (const resp of responsaveisAtividade) {
            datasAtividade.push({
                user_id: resp.user_id,
                data_limite: new Date(data_limite),
            });
        }
    }

    // Criar a atividade
    await prisma.atividade.create({
        data: {
            titulo,
            descricao,
            tipo,
            data_inicio: new Date(data_inicio),
            data_limite: tipo === "Única" ? data_lim : null,
            data_final:
                tipo === "Iterativa" ? (data_final ? data_fim : null) : null,
            criador_id: userId, // Criador é o usuário atual
            izzy_id: izzyId,
            users: {
                createMany: {
                    data: datasAtividade,
                },
            },
            dias_semana: {
                createMany: {
                    data: diasAtividade,
                },
            },
        },
    });
}