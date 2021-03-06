# Introduction au GraphQLScalarType

**GraphQL** propose de controler les données via différents objets repésentant chacun un type de données.

Voici leur liste non exhaustive:

- [`GraphQLID`](http://graphql.org/graphql-js/type/#graphqlid)
- [`GraphQLBoolean`](http://graphql.org/graphql-js/type/#graphqlboolean)
- [`GraphQLInt`](http://graphql.org/graphql-js/type/#graphqlint)
- [`GraphQLFloat`](http://graphql.org/graphql-js/type/#graphqlfloat)
- [`GraphQLString`](http://graphql.org/graphql-js/type/#graphqlstring)
- [`GraphQLList`](http://graphql.org/graphql-js/type/#graphqllist)

**GraphQL** propose également l'objet [`GraphQLScalarType`](http://graphql.org/graphql-js/type/#graphqlscalartype) qui va nous permettre de créer des types personnalisés ! C'est cet objet qui va nous intéresser ici.

Mais avant de créer notre type personnalisé avec `GraphQLScalarType`, nous allons mettre en place un server **GraphQL** avec **Express**.

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
Nous avons importé `express`, `express-graphql` et `graphql` puis mis en place notre serveur en écoute sur le port `8083`

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
Nous avons créé un type `User` avec l'objet `GraphQLObjectType` sur la base des données de notre [`datas.json`](https://github.com/baxterio/graphql-scalartype/blob/master/datas.json). Chaque champs est ici typé via les objets de type **GraphQL**. Nous avons utilisé `GraphQLInt` et `GraphQLString` sans oublier bien sûr de les importer.

```js
// ...
  GraphQLString,
  GraphQLSchema
} = require('graphql')

/** ... **/

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
Notre résolveur `getUserByMail` est maintenant en place et nous permet de requêter nos données en donnant un email en argument. Nous avons également utiliser le module `graphql-js` et l'objet `graphQLHTTP` comme middleware. Ici notre url racine est maintenant bindé à notre middleware et notre schema `GraphQLSchema`.

Pour lancer le serveur, il suffit d'exécuter la commande suivante

```shell
 node server.js #ou `yarn watch` si vous avez cloné le dépot
```
Vous aurez accès à l'interface graphique graphQL `graphiql` via l'url [http://localhost:8083](http://localhost:8083)

Vous pouvez tester que notre `resolver` fonctionne correctement avec cette requête:
```js
{
  user: getUserByMail(email: "ehuntern@huffingtonpost.com") {
    id
    first_name
    last_name
  }
}
```

> *ici "`user`" est un alias de notre resolver getUserByMail*

Maintenant que notre serveur fonctionne correctement, je vous propose d'utiliser l'objet `GraphQLScalarType` afin de créer un type personnalisé pour les emails. Un `EmailType`.

```js
// ...
  GraphQLString,
  GraphQLScalarType,
  GraphQLError,
  Kind,
  GraphQLSchema
} = require('graphql')

/** ... **/

const EmailType = new GraphQLScalarType({
  name: 'Email',
  serialize: value => value,
  parseValue: value => value,
  parseLiteral(ast) {
    return ast.value
  }
})
```
Nous avons donc une instance de l'objet `GraphQLScalarType` et nous lui donnons un objet en argument.

L'attribut `name` permet de nommer notre nouveau type de données.

Les attributs `serialize` et `parseValue` sont deux fonctions de "sérialization" qui permettent de s'assurer de la validité de la valeur d'entrée.

`parseLiteral` est une fonction qui va nous retourner un objet contenant les informations du noeud `AST` de notre valeur d'entrée.

Voici un exemple de cet objet:
```js
{
  kind: 'StringValue',
  value: 'ehuntern@huffingtonpost.com',
  loc: {
    start: 31,
    end: 60
  }
}
```
C'est donc dans cette fonction `parseLiteral` que nous allons mettre en place les contrôles grâce notamment à cet objet.

Nous avons accès au type de noeud `AST` avec l'attribut `kind` et à sa valeur avec l'attribut `value`.

```js
parseLiteral(ast) {
  if (ast.kind !== Kind.STRING) {
    throw new GraphQLError('Query error: Email must be a string ' + ast.kind, [ast]);
  }
  if (!ast.value.match(/@/)) {
    throw new GraphQLError('Query error: Not a valid Email', [ast]);
  }
  return ast.value
}
```
Ici nous commencons par contrôler que notre valeur est bien de type `String`, via l'objet **GraphQL** `Kind`, qui nous met à disposition la liste des différents types de noeud `AST`.

Ensuite nous faisons une vérification sommaire sur la valeur à contrôler, puis, si les deux conditions sont remplies, nous retournons notre valeur !

Votre `EmailType` est terminé, vous pouvez maintenant l'utiliser dans la description de votre query:

```js
const query = new GraphQLObjectType({
  name: 'Queries',
  description: 'Define queries',
  fields: () => ({
    getUserByMail: {
      type: UserType,
      args: {
        email: {
          type: EmailType // Ici
        }
      },
      resolve: (_, { email }) => datas.find(user => email === user.email)
    }
  })
})
```
Nous demandons maintenant un email en argument correspondant à sont propre type `EmailType` !


- [Le github contenant la source](https://github.com/baxterio/graphql-scalartype)
  > yarn & yarn watch
- Jeu de données généré avec [Mockaroo](https://www.mockaroo.com)
