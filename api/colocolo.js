/*
 * CASIO FAMILY TIME
 * COLO-COLO V6.2
 *
 * Proximo partido de Colo-Colo.
 * Compatible con Vercel.
 *
 * El sistema selecciona automaticamente
 * el primer partido futuro de la lista.
 */

module.exports = async function handler(req, res) {

    /*
     * CABECERAS
     */

    res.setHeader(
        'Access-Control-Allow-Origin',
        '*'
    );

    res.setHeader(
        'Content-Type',
        'application/json; charset=utf-8'
    );

    res.setHeader(
        'Cache-Control',
        'public, s-maxage=300, stale-while-revalidate=600'
    );


    /*
     * PROXIMOS PARTIDOS CONOCIDOS
     *
     * Las horas corresponden a Chile.
     */

    var partidos = [

        {
            fecha: '2026-10-20',
            hora: '18:00',
            rival: 'PUERTO MONTT',
            local: true,
            competencia: 'COPA CHILE'
        },

        {
            fecha: '2026-10-25',
            hora: '17:30',
            rival: 'PALESTINO',
            local: false,
            competencia: 'LIGA DE PRIMERA'
        },

        {
            fecha: '2026-11-01',
            hora: '18:00',
            rival: 'UNIV. DE CONCEPCION',
            local: true,
            competencia: 'LIGA DE PRIMERA'
        },

        {
            fecha: '2026-11-08',
            hora: '18:00',
            rival: 'NUBLENSE',
            local: false,
            competencia: 'LIGA DE PRIMERA'
        }

    ];


    /*
     * FECHA ACTUAL
     */

    var ahora =
        new Date();


    var elegido =
        null;


    var i;


    /*
     * BUSCAR EL PRIMER PARTIDO
     * QUE TODAVIA NO HAYA TERMINADO
     */

    for (
        i = 0;
        i < partidos.length;
        i++
    ) {

        var partesFecha =
            partidos[i].fecha.split('-');


        var partesHora =
            partidos[i].hora.split(':');


        var fechaPartido =
            new Date(
                Number(partesFecha[0]),
                Number(partesFecha[1]) - 1,
                Number(partesFecha[2]),
                Number(partesHora[0]),
                Number(partesHora[1]),
                0
            );


        /*
         * Consideramos aproximadamente
         * 3 horas de duracion.
         */

        fechaPartido.setHours(
            fechaPartido.getHours() + 3
        );


        /*
         * Si aun no ha terminado,
         * este es el proximo partido.
         */

        if (
            fechaPartido.getTime() >
            ahora.getTime()
        ) {

            elegido =
                partidos[i];

            break;
        }
    }


    /*
     * NO HAY MAS PARTIDOS
     * EN LA LISTA
     */

    if (!elegido) {

        return res.status(200).json({

            ok: true,

            available: false,

            message:
                'PROXIMO PARTIDO POR CONFIRMAR'
        });
    }


    /*
     * RESPUESTA
     */

    return res.status(200).json({

        ok: true,

        available: true,

        date:
            elegido.fecha,

        time:
            elegido.hora,

        rival:
            elegido.rival,

        home:
            elegido.local,

        competition:
            elegido.competencia
    });
};
