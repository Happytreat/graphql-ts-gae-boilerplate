import { gql } from 'apollo-server-express'
import { IContext } from '../datastore'

// Types
export type UserPref = {
	theme: string
	currentSemester: number
}

export type User = {
	id: string
	userPref: UserPref
}

// GraphQL TypeDefs
export const typeDefs = gql`
	type Query {
		users: [User]
		user(id: ID!): User
	}

	type Mutation {
		createOrUpdateUser(input: UpdateUserInput!): UpdateUserResponse
		deleteUser(id: ID!): DeleteUserResponse
	}

	type UpdateUserResponse {
		user: User
	}

	type DeleteUserResponse {
		id: ID
	}

	input UpdateUserInput {
		id: ID!
		theme: String
		currentSemester: Int
	}

	type User {
		id: ID!
		userPref: UserPref
	}

	type UserPref {
		theme: String
		currentSemester: Int
	}
`

let collection = 'users'

export const resolvers = {
	Query: {
		users: (_: any, __: any, context: IContext) =>
			context.dataSources.firebase.db().list(collection),
		user: async (_: any, args: any, context: IContext) => {
			const { id } = args
			let db = context.dataSources.firebase.db()
			if (id == '') {
				return
			}
			return db.get(id, collection)
		},
	},
	Mutation: {
		createOrUpdateUser: async (_: any, args: any, context: IContext) => {
			const { id, theme, currentSemester } = args.input
			let user: User = {
				id,
				userPref: {
					theme,
					currentSemester,
				},
			}
			let db = context.dataSources.firebase.db()
			await db.create({ obj: user, path: collection }, user.id)
			return { user }
		},
		deleteUser: async (_: any, args: any, context: IContext) => {
			const { id } = args
			let db = context.dataSources.firebase.db()
			db.del(id, collection)
			return { id }
		},
	},
}
