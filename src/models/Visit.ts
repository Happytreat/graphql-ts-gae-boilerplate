import { createInput, firestoreInstance } from '../datastore'

interface Visit {
	timestamp: Date
	userIp: string
}

/**
 * Insert a visit record into the database.
 *
 * @param {Visit} visit The visit record to insert.
 */
const insertVisit = async (visit: Visit) => {
	let dbObject: createInput<Visit> = {
		obj: visit,
		path: 'visits',
	}

	firestoreInstance.create(dbObject)
}

/**
 * Retrieve the latest 10 visit records from the database.
 */
const listVisits = async () => {
	return firestoreInstance.list('visits') as Promise<Array<Visit>>
}

export { insertVisit, listVisits, Visit }
