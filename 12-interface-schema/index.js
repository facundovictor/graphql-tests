'use strict';

const express = require('express');
const graphqlHTTP = require('express-graphql');
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt,
  GraphQLBoolean
} = require('graphql');

const src_path = './src/';
const { getVideoById, getVideos, createVideo } = require(src_path + 'data');
const nodeInterface = require(src_path + 'node');

const PORT   = process.env.PORT || 3000;
const server = express();

const videoType = new GraphQLObjectType({
  name        : 'Video',
  description : 'A video on some place',
  fields      : {
    id       : { 
      type        : new GraphQLNonNull(GraphQLID),
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
  },
  interfaces : [nodeInterface]
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

const VideoInputType = new GraphQLInputObjectType({
  name   : 'VideoInput',
  fields : {
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

  }
});


const mutationType = new GraphQLObjectType({
  name        : 'Mutation',
  description : 'The root Mutation type.',
  fields      : {
    createVideo : {
      type : videoType,
      args : { 
        video : {
          type : new GraphQLNonNull(VideoInputType)
        }
      },
      resolve : (_, args) => {
        return createVideo(args.video);
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
    createVideo(video :{
      title:"FOOO",
      duration: 300,
      released:false
    }) {
      id
      title
    }
  }

*/
