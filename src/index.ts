import express from 'express'
import { ApolloServer } from 'apollo-server-express'

import schema from './schema'
import { visitController } from './controllers/VisitController'
import { dataSources } from './datastore'

const server = new ApolloServer({
	schema,
	dataSources: () => dataSources,
	formatError: (err) => {
		// Don't give the specific errors to the client.
		if (err.message.startsWith('Database Error: ')) {
			return new Error('Internal server error')
		}
		return err
	},
})

const app: express.Application = express()
server.applyMiddleware({ app })

app.get('/', visitController)

// Start the server
const port = process.env.PORT || 4000
app.listen({ port: port }, () =>
	console.log(`Server is ready at http://localhost:4000${server.graphqlPath}`)
)
