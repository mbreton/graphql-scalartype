const datas = require('./datas.json')

const express     = require('express')
const graphQLHTTP = require('express-graphql')
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
    },
    'ip_address': {
      'type': GraphQLString,
      'description': 'User ip address'
    }
  })
})
