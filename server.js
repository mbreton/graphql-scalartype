const datas = require('./datas.json')

const express     = require('express')
const graphQLHTTP = require('express-graphql')
const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLSchema
} = require('graphql')

const UserType = new GraphQLObjectType({
  name: 'User',
  description: 'Define a user',
  fields: () => ({
    'id': {
      'type': GraphQLInt,
      'description': 'User id'
    },
    'first_name': {
      'type': GraphQLString,
      'description': 'User first name'
    },
    'last_name': {
      'type': GraphQLString,
      'description': 'User last name'
    },
    'email': {
      'type': GraphQLString,
      'description': 'User email'
    },
    'gender': {
      'type': GraphQLString,
      'description': 'User gender'
    },
    'ip_address': {
      'type': GraphQLString,
      'description': 'User ip address'
    }
  })
})

const query = new GraphQLObjectType({
  name: 'Queries',
  description: 'Define queries',
  fields: () => ({
    getUser: {
      type: UserType,
      args: {
        email: {
          type: GraphQLString
        }
      },
      resolve: (_, { email }) => datas.find(user => email === user.email)
    }
  })
})

const schema = new GraphQLSchema({
  query
})

const app  = express()
const PORT = 8083

app.use('/', graphQLHTTP({
  schema: schema,
  graphiql: true,
  pretty: true,
  formatError: error => ({
    message: error.message,
    locations: error.locations,
    stack: error.stack
  })
}))

app.listen(PORT, _ => console.log(`server running on port %s`, PORT))
