[graphql-to-parsequery](README.md) / Modules

# graphql-to-parsequery

## Table of contents

### Type aliases

- [GraphQLWhere](modules.md#graphqlwhere)
- [ParseClass](modules.md#parseclass)
- [ParseClasses](modules.md#parseclasses)

### Functions

- [transformGraphQLWhereToParse](modules.md#transformgraphqlwheretoparse)
- [transformQueryConstraintInputToParse](modules.md#transformqueryconstraintinputtoparse)

## Type aliases

### GraphQLWhere

Ƭ **GraphQLWhere**: `Object`

This is the type definition of the GraphQL where.
It is recommended that you import your own typedefinitions from your GraphQL code generators (e.g. graphql-codegen or relay).

Example:
```js
const where: GraphQLWhere = {
  name: {
    equalTo: "John Doe"
  }
}
```

#### Index signature

▪ [key: `string`]: `any`

#### Defined in

[transformGraphQLWhereToParse.ts:60](https://github.com/richardguerre/graphql-to-parsequery/blob/af7caff/src/transformGraphQLWhereToParse.ts#L60)

___

### ParseClass

Ƭ **ParseClass**: `Object`

This is the type definition of a Parse class defintion.
You can get all Parse classes by calling `Parse.Schema.all()`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `classLevelPermissions?` | `Object` |
| `classLevelPermissions.addField` | `Object` |
| `classLevelPermissions.count` | `Object` |
| `classLevelPermissions.create` | `Object` |
| `classLevelPermissions.delete` | `Object` |
| `classLevelPermissions.find` | `Object` |
| `classLevelPermissions.get` | `Object` |
| `classLevelPermissions.protectedFields` | `Object` |
| `classLevelPermissions.update` | `Object` |
| `className` | `string` |
| `fields` | `Object` |
| `indexes?` | `Object` |

#### Defined in

[transformGraphQLWhereToParse.ts:66](https://github.com/richardguerre/graphql-to-parsequery/blob/af7caff/src/transformGraphQLWhereToParse.ts#L66)

___

### ParseClasses

Ƭ **ParseClasses**: [`ParseClass`](modules.md#parseclass)[]

This is the type definition of the Parse classes, which is an array of the `ParseClass` type.

#### Defined in

[transformGraphQLWhereToParse.ts:93](https://github.com/richardguerre/graphql-to-parsequery/blob/af7caff/src/transformGraphQLWhereToParse.ts#L93)

## Functions

### transformGraphQLWhereToParse

▸ `Const` **transformGraphQLWhereToParse**(`graphQLWhere`, `parseClassName`, `parseClasses`): `void`

Function that takes in a GraphQLWhere statement and converts into a Parse query input constraint.

This function also takes care of GraphQLWhere statements that start with a `AND`, `OR`, or `NOR`.

Note: Renamed from parse-server/src/GraphQL/... transformQueryInputToParse

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `graphQLWhere` | `Object` | (object) GraphQL where input for the specified parseClassName. See type definition of `GraphQLWhere` for more information. |
| `parseClassName` | `string` | (string) the Parse className (i.e. tablename) on which the where is being done. |
| `parseClasses` | [`ParseClasses`](modules.md#parseclasses) | (array) Array of parse classes, which you can get by calling `Parse.schema.all()`. See type definition of `GraphQLWhere` for more information. |

#### Returns

`void`

void

#### Defined in

[transformGraphQLWhereToParse.ts:329](https://github.com/richardguerre/graphql-to-parsequery/blob/af7caff/src/transformGraphQLWhereToParse.ts#L329)

___

### transformQueryConstraintInputToParse

▸ `Const` **transformQueryConstraintInputToParse**(`graphQLWhere`, `parentFieldName`, `parseClassName`, `parentGraphQLWhere`, `parseClasses`): `void`

Traversal function that takes in GraphQLWhere statement and converts into a Parse query input constraint. Recommended to use `tranformGraphQLWhereToParse` instead.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `graphQLWhere` | [`GraphQLWhere`](modules.md#graphqlwhere) | (object) GraphQL where input for the specified parseClassName. See type definition of `GraphQLWhere` for more information. |
| `parentFieldName` | `string` | (string) |
| `parseClassName` | `string` | (string) the Parse className (i.e. tablename) on which the where is being done. |
| `parentGraphQLWhere` | [`GraphQLWhere`](modules.md#graphqlwhere) | (object) parent GraphQL where. Similar to @param graphQLWhere, see type definition of `GraphQLWhere` for more information. |
| `parseClasses` | [`ParseClasses`](modules.md#parseclasses) | (array) Array of parse classes, which you can get by calling `Parse.schema.all()`. See type definition of `GraphQLWhere` for more information. |

#### Returns

`void`

#### Defined in

[transformGraphQLWhereToParse.ts:104](https://github.com/richardguerre/graphql-to-parsequery/blob/af7caff/src/transformGraphQLWhereToParse.ts#L104)
