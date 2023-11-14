import prisma from "../../../lib/prisma"
import {io} from "socket.io-client"

const socket = io.connect("http://192.168.1.12:4000")

export default async function handle(req, res) {
    try {
        let code
        let game = await prisma.game.findFirst({
            where: {
                accessCode: req.body.accessCode
            }
        })

        if (game === null) {
            code = 404
        } else {
            code = 204

            await prisma.player.update({
                data: {
                    game: game.id
                },
                where: {
                    id: parseInt(req.body.playerId)
                }
            })

            let players = await prisma.player.findMany({
                select: {
                    username: true
                },
                where: {
                    game: game.id
                }
            })

            players.length > 4 ? code = 403 : socket.emit("playerHasJoined", players)
        }

        res.status(code).json()
    } catch (err) {
        res.status(500).json(err)
    }
}