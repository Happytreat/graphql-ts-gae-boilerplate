import { makeExecutableSchema } from 'apollo-server-express'
import { merge } from 'lodash'
import { typeDefs as user, resolvers as userResolvers } from './models/User'

export default makeExecutableSchema({
	typeDefs: [user],
	resolvers: merge(userResolvers),
})
