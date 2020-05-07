import { slice } from 'lodash'
import { NextFunction, Response, Request } from 'express'
import { insertVisit, listVisits, Visit } from '../models/Visit'

export const visitController = async (req: Request, res: Response, next: NextFunction) => {
	const visit = {
		timestamp: new Date(),
		userIp: req.ip,
	}

	try {
		await insertVisit(visit)
		const entities = await listVisits()
		const visits = slice(entities, 0, 10).map(
			(entity: Visit) => `Time: ${entity.timestamp}, AddrHash: ${entity.userIp}`
		)
		res
			.status(200)
			.set('Content-Type', 'text/plain')
			.send(`Last 10 visits:\n${visits.join('\n')}`)
			.end()
	} catch (error) {
		console.log(error)
		next(error)
	}
}
