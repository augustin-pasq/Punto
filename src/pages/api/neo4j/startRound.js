import neo4j from "../../../../libs/neo4j.mjs"
import arrayShuffle from "array-shuffle"
import {v4 as uuidv4} from "uuid"

const colors = arrayShuffle(["#ED1D23", "#00B9F1", "#F9AE19", "#70BE44"])

export default async function handle(req, res) {
    try {
        await neo4j.executeQuery(
            `MATCH (g:Game {id: $id}) SET g.isOpen = false RETURN g;`,
            { id: req.body.gameId },
            { database: 'punto' }
        )

        const round = await neo4j.executeQuery(
            `MATCH (g:Game {id: $gameId}) CREATE (r:Round {id: $roundId})-[:is_from]->(g)`,
            { gameId: req.body.gameId, roundId: uuidv4() },
            { database: 'punto' }
        )

        let p1Colors, p2Colors, p3Colors, p4Colors
        let p1Cards = []
        let p2Cards = []
        let p3Cards = []
        let p4Cards = []
        let decks = {}

        for (let colorIndex in colors) {
            for (let i = 1; i <= 2; i++) {
                for (let value = 1; value <= 9; value++) {
                    let color = colors[colorIndex]
                    let card = {color: color, value: value}

                    switch (req.body.players.length) {
                        case 2:
                            p1Colors = [colors[0], colors[1]]
                            p2Colors = [colors[2], colors[3]]

                            if (p1Colors.includes(color)) {
                                p1Cards.push(card)
                            } else if (p2Colors.includes(color)) {
                                p2Cards.push(card)
                            }

                            decks = {
                                [req.body.players[0].id]: arrayShuffle(p1Cards), [req.body.players[1].id]: arrayShuffle(p2Cards)
                            }
                            break
                        case 3:
                        case 4:
                            p1Colors = colors[0]
                            p2Colors = colors[1]
                            p3Colors = colors[2]
                            p4Colors = colors[3]

                            switch (color) {
                                case p1Colors:
                                    p1Cards.push(card)
                                    break
                                case p2Colors:
                                    p2Cards.push(card)
                                    break
                                case p3Colors:
                                    p3Cards.push(card)
                                    break
                                case p4Colors:
                                    if (req.body.players.length === 3) {
                                        if ([1, 4, 7].includes(value)) p1Cards.push(card)
                                        if ([2, 5, 8].includes(value)) p2Cards.push(card)
                                        if ([3, 6, 9].includes(value)) p3Cards.push(card)

                                        decks = {
                                            [req.body.players[0].id]: arrayShuffle(p1Cards),
                                            [req.body.players[1].id]: arrayShuffle(p2Cards),
                                            [req.body.players[2].id]: arrayShuffle(p3Cards)
                                        }
                                    } else if (req.body.players.length === 4) {
                                        p4Cards.push(card)

                                        decks = {
                                            [req.body.players[0].id]: arrayShuffle(p1Cards),
                                            [req.body.players[1].id]: arrayShuffle(p2Cards),
                                            [req.body.players[2].id]: arrayShuffle(p3Cards),
                                            [req.body.players[3].id]: arrayShuffle(p4Cards)
                                        }
                                    }

                                    break
                            }
                            break
                    }
                }
            }
        }

        res.status(200).json({decks: decks, players: req.body.players, roundId: round.summary.query.parameters.roundId})
    } catch (err) {
        res.status(500).json(err)
    }
}