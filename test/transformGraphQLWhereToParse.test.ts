import { transformGraphQLWhereToParse, ParseClasses } from '../src';

describe('transformQueryInputToParse', () => {
  it('converts basic wheres', () => {
    let where = {
      username: {
        equalTo: 'johndoe',
      },
    };
    transformGraphQLWhereToParse(where, '_User', parseClasses);
    expect(where).toEqual({
      username: {
        $eq: 'johndoe',
      },
    });
  });

  it('converts nested wheres', () => {
    let where = {
      owner2: {
        have: {
          username: {
            equalTo: 'johndoe@gmail.com',
          },
        },
      },
    };
    transformGraphQLWhereToParse(where, 'Project', parseClasses);
    expect(where).toEqual({
      owner2: {
        $inQuery: {
          where: {
            username: {
              $eq: 'johndoe@gmail.com',
            },
          },
          className: '_User',
        },
      },
    });
  });
});

const parseClasses: ParseClasses = [
  {
    className: '_User',
    fields: {
      objectId: { type: 'String' },
      createdAt: { type: 'Date' },
      updatedAt: { type: 'Date' },
      ACL: { type: 'ACL' },
      username: { type: 'String' },
      password: { type: 'String' },
      email: { type: 'String' },
      emailVerified: { type: 'Boolean' },
      authData: { type: 'Object' },
      profile: { type: 'Pointer', targetClass: 'UserProfile', required: false },
      avatarTest: { type: 'File', required: false },
      userProfile: {
        type: 'Relation',
        targetClass: 'UserProfile',
        required: false,
      },
      project: { type: 'Relation', targetClass: 'Project', required: false },
    },
    classLevelPermissions: {
      find: {},
      count: {},
      get: {},
      create: { requiresAuthentication: true },
      update: { requiresAuthentication: true },
      delete: { requiresAuthentication: true },
      addField: { requiresAuthentication: true },
      protectedFields: { '*': ['email'] },
    },
    indexes: {
      _id_: { _id: 1 },
      username_1: { username: 1 },
      case_insensitive_username: { username: 1 },
      email_1: { email: 1 },
      case_insensitive_email: { email: 1 },
      '_created_at_-1__id_-1': { _created_at: -1, _id: -1 },
      polymorphicObj_1__id_1: { polymorphicObj: 1, _id: 1 },
    },
  },
  {
    className: '_Role',
    fields: {
      objectId: { type: 'String' },
      createdAt: { type: 'Date' },
      updatedAt: { type: 'Date' },
      ACL: { type: 'ACL' },
      name: { type: 'String' },
      users: { type: 'Relation', targetClass: '_User' },
      roles: { type: 'Relation', targetClass: '_Role' },
    },
    classLevelPermissions: {
      find: { '*': true },
      count: { '*': true },
      get: { '*': true },
      create: { '*': true },
      update: { '*': true },
      delete: { '*': true },
      addField: { '*': true },
      protectedFields: { '*': [] },
    },
    indexes: { _id_: { _id: 1 }, name_1: { name: 1 } },
  },
  {
    className: 'Project',
    fields: {
      objectId: { type: 'String' },
      createdAt: { type: 'Date' },
      updatedAt: { type: 'Date' },
      ACL: { type: 'ACL' },
      name: { type: 'String', required: true },
      avatar: { type: 'File', required: false },
      owner2: { type: 'Pointer', targetClass: '_User', required: false },
      members: { type: 'Relation', targetClass: '_User', required: false },
    },
    classLevelPermissions: {
      find: { '*': true },
      count: { '*': true },
      get: { '*': true },
      create: { '*': true },
      update: { '*': true },
      delete: { '*': true },
      addField: { '*': true },
      protectedFields: { '*': [] },
    },
    indexes: { _id_: { _id: 1 } },
  },
  {
    className: 'UserProfile',
    fields: {
      objectId: { type: 'String' },
      createdAt: { type: 'Date' },
      updatedAt: { type: 'Date' },
      ACL: { type: 'ACL' },
      handle: { type: 'String', required: true },
      user: { type: 'Pointer', targetClass: '_User', required: false },
      projects: { type: 'Relation', targetClass: 'Project', required: false },
    },
    classLevelPermissions: {
      find: { '*': true },
      count: { '*': true },
      get: { '*': true },
      create: { '*': true },
      update: { '*': true },
      delete: { '*': true },
      addField: { '*': true },
      protectedFields: { '*': [] },
    },
    indexes: {
      _id_: { _id: 1 },
      '_created_at_-1__id_-1': { _created_at: -1, _id: -1 },
    },
  },
];
