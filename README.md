# Introduction au GraphQLScalarType

GraphQL propose de controler les données via différents objets repésentant chacun un type de donnée.

Voici leur liste non exhaustive:

- [GraphQLID](http://graphql.org/graphql-js/type/#graphqlid)
- [GraphQLBoolean](http://graphql.org/graphql-js/type/#graphqlboolean)
- [GraphQLInt](http://graphql.org/graphql-js/type/#graphqlint)
- [GraphQLFloat](http://graphql.org/graphql-js/type/#graphqlfloat)
- [GraphQLString](http://graphql.org/graphql-js/type/#graphqlstring)
- [GraphQLList](http://graphql.org/graphql-js/type/#graphqllist)

GraphQL propose également l'objet [**GraphQLScalarType**](http://graphql.org/graphql-js/type/#graphqlscalartype) qui va nous permettre de créer des typages personnalisé ! C'est cet objet qui va nous intéresser ici.

Mais avant de créer notre typage personnalisé avec **GraphQLScalarType**, nous allons mettre en place un server GraphQL avec Express.

Un peu de code:

```js
// server.js
const datas = require('./datas.json')

const express     = require('express')
const graphQLHTTP = require('express-graphql')
const {
  GraphQLObjectType
} = require('graphql')

const app  = express()
const PORT = 8083

app.listen(PORT, _ => console.log(`server running on port %s`, PORT))
```
Nous avons importé **express**, **express-graphql** et **graphql** puis mis en place notre serveur en écoute sur le port 8083

```js
const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString
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
    }
  })
})
```
Nous avons créer un type **User** avec l'objet **GraphQLObjectType** sur la base des données de notre [datas.json](https://github.com/baxterio/graphql-scalartype/blob/master/datas.json). Chaque champs est ici typé via les objets de typage GraphQL. Nous avons utilisé **GraphQLInt** et **GraphQLString** sans oublier biensur de les importer.

```js
/** code **/

  GraphQLString,
  GraphQLSchema
} = require('graphql')

/** code **/

const query = new GraphQLObjectType({
  name: 'Queries',
  description: 'Define queries',
  fields: () => ({
    getUserByMail: {
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
```
Notre résolver **getUserByMail** est maintenant en place et nous permet de requeter nos données en donnant un email en argument. Nous avons également utilisé le **graphql-js** comme middleware. Ici notre url racine est maintenant bindé à notre middleware.

Lancer le server *(node server.js ou yarn watch si vous avez cloné le dépot)*, vous avez accès à l'interface graphique graphQL **graphiql** via l'url [http://localhost:8083](http://localhost:8083)

Vous pouvez tester que notre resolver fonctionne correctement avec cette requete:
```js
{
  user: getUserByMail(email: "ehuntern@huffingtonpost.com") {
    id
    first_name
    last_name
  }
}
```
* ici "**user**" est un alias de notre resolver getUserByMail *

Tous fonctionne correctement, je vous propose d'utiliser l'objet **GraphQLScalarType** afin de créer un type personnalisé pour les emails. Un **EmailType**.

```js
/** code **/

  GraphQLString,
  GraphQLScalarType,
  GraphQLError,
  Kind,
  GraphQLSchema
} = require('graphql')

/** code **/

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
```
Nous avons donc instancié l'objet **GraphQLScalarType** en lui donnant un objet de paramètres.
TODO ...
- *name*:
- *serialize*:
- *parseValue*:

- [Le github contenant la source](https://github.com/baxterio/graphql-scalartype)
  > yarn & yarn watch
- Jeu de données généré avec [Mockaroo](https://www.mockaroo.com)


