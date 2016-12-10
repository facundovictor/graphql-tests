'use strict';

const {
  nodeDefinitions,
  fromGlobalId
} = require('graphql-relay');

const { getObjectById } = require('./data');

const { nodeInterface, nodeField } = nodeDefinitions(
  (globalId) => {
    // Resolve any kind of ID to an individual object
    const { type, id } = fromGlobalId(globalId);
    return getObjectById(type.toLowerCase(), id);
  },
  (object) => {
    // Takes an object and tells the type
    const { videoType } = require('../');
    if (object.title)
      return videoType;

    return null;
  }
);

exports.nodeInterface = nodeInterface;
exports.nodeField     = nodeField;
