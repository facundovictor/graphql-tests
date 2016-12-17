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

const {
  globalIdField,
  connectionDefinitions,
  connectionFromPromisedArray,
  connectionArgs,
  mutationWithClientMutationId
} = require('graphql-relay');

const src_path = './src/';
const { getVideoById, getVideos, createVideo } = require(src_path + 'data');
const { nodeInterface, nodeField } = require(src_path + 'node');

const PORT   = process.env.PORT || 3000;
const server = express();

const videoType = new GraphQLObjectType({
  name        : 'Video',
  description : 'A video on some place',
  fields      : {
    id       : globalIdField(),
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

exports.videoType = videoType

const { connectionType : VideoConnection } = connectionDefinitions({
  nodeType         : videoType,
  connectionFields : () => ({
    totalCount: {
      type        : GraphQLInt,
      description : 'A count of the total number of objects in this connection.',
      resolve     : (conn) => {
        return conn.edges.length;
      }
    }
  })
});

const queryType = new GraphQLObjectType({
  name        : 'QueryType',
  description : 'The root query type.',
  fields      : {
    node   : nodeField,
    videos : {
      type    : VideoConnection,
      args    : connectionArgs,
      resolve : (_, args) => connectionFromPromisedArray(
        getVideos(),
        args
      )
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

const videoMutation = mutationWithClientMutationId({
  name                : 'AddVideo',
  inputFields         : {
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
  outputFields        : {
    video : {
      type : videoType
    }
  },
  mutateAndGetPayload : (args) => new Promise((resolve, reject) => {
    Promise.resolve(createVideo(args))
           .then((video) => resolve({ video }))
           .catch(reject);
  })
});

const mutationType = new GraphQLObjectType({
  name        : 'Mutation',
  description : 'The root Mutation type.',
  fields      : {
    createVideo : videoMutation
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

  mutation AddVideoQuery($input: AddVideoInput!) {
    createVideo(input: $input) {
      video {
        title
      }
    }
  }

  query AllVideosQuery {
    videos {
      edges {
        node {
          title
        }
      }
    }
  }

*/
