import { FirestoreError } from '@firebase/firestore-types'
import admin from 'firebase-admin'
import { DataSource } from 'apollo-datasource'
import { DataSources } from 'apollo-server-core/dist/graphqlOptions'

let serviceAccountKey = require('../serviceAccountKey.json')

const firebaseApp = admin.initializeApp({
	credential: admin.credential.cert(serviceAccountKey),
})

/**
 * Apollo DataSource Abstraction
 */

export type createInput<T> = {
	obj: T
	path: string // collection path
}

interface IDatabase {
	db: any
	get(id: string, collection: string): any
	create<T>(input: createInput<T>, id?: string): void
	del(id: string, collection: string): void
	list(collection: string): Promise<any[]>
}

/**
 * Firestore CRUD methods
 */
class FirestoreDatabase implements IDatabase {
	db: admin.firestore.Firestore
	constructor(db: admin.firestore.Firestore) {
		this.db = db
	}

	async create<T>(input: createInput<T>, id?: string) {
		id == null
			? this.db.collection(input.path).add(input.obj) // random id
			: this.db.collection(input.path).doc(id).set(input.obj)
		return
	}

	async get(id: string, collection: string) {
		let firstItem: any
		await this.db
			.collection(collection)
			.doc(id)
			.get()
			.then((doc: admin.firestore.DocumentData) => {
				if (doc.exists) {
					firstItem = doc.data()
				}
			})
			.catch((err: FirestoreError) => {
				console.log('404: Error getting documents', err)
			})
		return firstItem
	}

	async del(id: string, collection: string) {
		this.db.collection(collection).doc(id).delete()
	}

	async list(collection: string) {
		let list = Array()
		await this.db
			.collection(collection)
			.get()
			.then((snapshot: admin.firestore.QuerySnapshot) => {
				snapshot.forEach((doc: admin.firestore.DocumentData) => {
					let visit = doc.data()
					list.push(visit)
				})
			})
			.catch((err: FirestoreError) => {
				console.log('404: Error getting documents', err)
			})

		return list
	}
}

class FirebaseDataSource extends DataSource {
	adminApp: admin.app.App
	firestore: FirestoreDatabase

	constructor(adminApp: admin.app.App) {
		super()
		this.adminApp = adminApp
		this.firestore = new FirestoreDatabase(this.adminApp.firestore())
	}

	get app(): admin.app.App {
		return this.adminApp
	}

	db(): FirestoreDatabase {
		return this.firestore
	}
}

interface IDataSources {
	firebase: FirebaseDataSource
}

const firestoreDataSourceInstance = new FirebaseDataSource(firebaseApp)

// Another way to get db instance outside of Context
export const firestoreInstance = firestoreDataSourceInstance.db()

export const dataSources: DataSources<IDataSources> = {
	firebase: firestoreDataSourceInstance,
}

export interface IContext {
	dataSources: IDataSources
}
