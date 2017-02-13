const datas = require('./datas.json')

const express     = require('express')
const graphQLHTTP = require('express-graphql')
const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLScalarType,
  GraphQLError,
  Kind,
  GraphQLSchema
} = require('graphql')

const EmailType = new GraphQLScalarType({
  name: 'Email',
  serialize: value => value,
  parseValue: value => value,
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError('Query error: Email must be a string ' + ast.kind, [ast]);
    }
    if (!ast.value.match(/@/)) {
      throw new GraphQLError('Query error: Not a valid Email', [ast]);
    }
    return ast.value
  }
})

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
    getUserByMail: {
      type: UserType,
      args: {
        email: {
          type: EmailType
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
