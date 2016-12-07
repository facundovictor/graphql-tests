'use strict';

const express = require('express');
const graphqlHTTP = require('express-graphql');
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt,
  GraphQLBoolean
} = require('graphql');

const { getVideoById, getVideos, createVideo } = require('../src/data');

const PORT   = process.env.PORT || 3000;
const server = express();

const videoType = new GraphQLObjectType({
  name        : 'Video',
  description : 'A video on some place',
  fields      : {
    id       : { 
      type        : GraphQLID,
      description : 'The id of the video.'
    },
    title    : {
      type        : GraphQLString,
      description : 'The title of the video.'
    },
    duration : {
      type        : GraphQLInt,
      description : 'The duration of the video (in seconds).'
    },
    released : {
      type        : GraphQLBoolean,
      description : 'Whether or not the video is released.'
    }
  }
});

const queryType = new GraphQLObjectType({
  name        : 'QueryType',
  description : 'The root query type.',
  fields      : {
    videos : {
      type    : new GraphQLList(videoType),
      resolve : getVideos
    },
    video  : {
      type    : videoType,
      args    : {
        id : {
          type        : new GraphQLNonNull(GraphQLID),
          description : 'The id of the video.'
        }
      },
      resolve : (_, args) => {
        return getVideoById(args.id);
      }
    }
  }
});


const mutationType = new GraphQLObjectType({
  name        : 'Mutation',
  description : 'The root Mutation type.',
  fields      : {
    createVideo : {
      type : videoType,
      args : { 
        title    : {
          type        : new GraphQLNonNull(GraphQLString),
          description : 'The title of the video.'
        },
        duration : {
          type        : new GraphQLNonNull(GraphQLInt),
          description : 'The duration of the video (in seconds).'
        },
        released : {
          type        : new GraphQLNonNull(GraphQLBoolean),
          description : 'Whether or not the video is released.'
        }
      },
      resolve : (_, args) => {
        return createVideo(args);
      }
    }
  }
});

const schema = new GraphQLSchema({
  query    : queryType,
  mutation : mutationType
});

server.use('/graphql', graphqlHTTP({
  schema,
  graphiql  : true, // A visual editor for viewing graphiql schemas
}));

server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});

/*
  Now, go to http://localhost:3000/graphql and type:

  mutation M {
    createVideo(title:"foo", duration:300, released:false){
      id,
      title
    }
  }

*/
