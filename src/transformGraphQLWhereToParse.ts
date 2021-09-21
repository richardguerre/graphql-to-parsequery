import { fromGlobalId } from 'graphql-relay/node/node';

const parseQueryMap: { [key: string]: string } = {
  OR: '$or',
  AND: '$and',
  NOR: '$nor',
};

const parseConstraintMap: { [key: string]: string } = {
  equalTo: '$eq',
  notEqualTo: '$ne',
  lessThan: '$lt',
  lessThanOrEqualTo: '$lte',
  greaterThan: '$gt',
  greaterThanOrEqualTo: '$gte',
  in: '$in',
  notIn: '$nin',
  exists: '$exists',
  inQueryKey: '$select',
  notInQueryKey: '$dontSelect',
  inQuery: '$inQuery',
  notInQuery: '$notInQuery',
  containedBy: '$containedBy',
  contains: '$all',
  matchesRegex: '$regex',
  options: '$options',
  text: '$text',
  search: '$search',
  term: '$term',
  language: '$language',
  caseSensitive: '$caseSensitive',
  diacriticSensitive: '$diacriticSensitive',
  nearSphere: '$nearSphere',
  maxDistance: '$maxDistance',
  maxDistanceInRadians: '$maxDistanceInRadians',
  maxDistanceInMiles: '$maxDistanceInMiles',
  maxDistanceInKilometers: '$maxDistanceInKilometers',
  within: '$within',
  box: '$box',
  geoWithin: '$geoWithin',
  polygon: '$polygon',
  centerSphere: '$centerSphere',
  geoIntersects: '$geoIntersects',
  point: '$point',
};

/**
 * This is the type definition of the GraphQL where.
 * It is recommended that you import your own typedefinitions from your GraphQL code generators (e.g. graphql-codegen or relay).
 *
 * Example:
 * ```js
 * const where: GraphQLWhere = {
 *   name: {
 *     equalTo: "John Doe"
 *   }
 * }
 * ```
 */
export type GraphQLWhere = { [key: string]: any };

/**
 * This is the type definition of a Parse class defintion.
 * You can get all Parse classes by calling `Parse.Schema.all()`
 */
export type ParseClass = {
  className: string;
  fields: {
    [fieldName: string]: {
      type: string;
      targetClass?: string;
      required?: boolean;
    };
  };
  classLevelPermissions?: {
    find: { [key: string]: any };
    count: { [key: string]: any };
    get: { [key: string]: any };
    create: { [key: string]: any };
    update: { [key: string]: any };
    delete: { [key: string]: any };
    addField: { [key: string]: any };
    protectedFields: { [key: string]: Array<string> };
  };
  indexes?: {
    [key: string]: { [key: string]: any };
  };
};

/**
 * This is the type definition of the Parse classes, which is an array of the `ParseClass` type.
 */
export type ParseClasses = ParseClass[];

/**
 * Traversal function that takes in GraphQLWhere statement and converts into a Parse query input constraint. Recommended to use `tranformGraphQLWhereToParse` instead.
 *
 * @param graphQLWhere (object) GraphQL where input for the specified parseClassName. See type definition of `GraphQLWhere` for more information.
 * @param parentFieldName (string)
 * @param parseClassName (string) the Parse className (i.e. tablename) on which the where is being done.
 * @param parentGraphQLWhere (object) parent GraphQL where. Similar to @param graphQLWhere, see type definition of `GraphQLWhere` for more information.
 * @param parseClasses (array) Array of parse classes, which you can get by calling `Parse.schema.all()`. See type definition of `GraphQLWhere` for more information.
 */
export const transformQueryConstraintInputToParse = (
  graphQLWhere: GraphQLWhere,
  parentFieldName: string,
  parseClassName: string,
  parentGraphQLWhere: GraphQLWhere,
  parseClasses: ParseClasses
) => {
  const fields = parseClasses.find(
    parseClass => parseClass.className === parseClassName
  )?.fields;
  if (parentFieldName === 'id' && parseClassName) {
    Object.keys(graphQLWhere).forEach(constraintName => {
      const constraintValue = graphQLWhere[constraintName];
      if (typeof constraintValue === 'string') {
        const globalIdObject = fromGlobalId(constraintValue);

        if (globalIdObject.type === parseClassName) {
          graphQLWhere[constraintName] = globalIdObject.id;
        }
      } else if (Array.isArray(constraintValue)) {
        graphQLWhere[constraintName] = constraintValue.map(value => {
          const globalIdObject = fromGlobalId(value);

          if (globalIdObject.type === parseClassName) {
            return globalIdObject.id;
          }

          return value;
        });
      }
    });
    parentGraphQLWhere.objectId = graphQLWhere;
    delete parentGraphQLWhere.id;
  }
  Object.keys(graphQLWhere).forEach(fieldName => {
    let fieldValue = graphQLWhere[fieldName];
    if (parseConstraintMap[fieldName]) {
      graphQLWhere[parseConstraintMap[fieldName]] = graphQLWhere[fieldName];
      delete graphQLWhere[fieldName];
    }
    /**
     * If we have a key-value pair, we need to change the way the constraint is structured.
     *
     * Example:
     *   From:
     *   {
     *     "someField": {
     *       "lessThan": {
     *         "key":"foo.bar",
     *         "value": 100
     *       },
     *       "greaterThan": {
     *         "key":"foo.bar",
     *         "value": 10
     *       }
     *     }
     *   }
     *
     *   To:
     *   {
     *     "someField.foo.bar": {
     *       "$lt": 100,
     *       "$gt": 10
     *      }
     *   }
     */
    if (
      fieldValue.key &&
      fieldValue.value &&
      parentGraphQLWhere &&
      parentFieldName
    ) {
      delete parentGraphQLWhere[parentFieldName];
      parentGraphQLWhere[`${parentFieldName}.${fieldValue.key}`] = {
        ...parentGraphQLWhere[`${parentFieldName}.${fieldValue.key}`],
        [parseConstraintMap[fieldName]]: fieldValue.value,
      };
    } else if (
      fields?.[parentFieldName] &&
      (fields[parentFieldName].type === 'Pointer' ||
        fields[parentFieldName].type === 'Relation')
    ) {
      const { targetClass } = fields[parentFieldName];
      if (fieldName === 'exists') {
        if (fields[parentFieldName].type === 'Relation') {
          const whereTarget = fieldValue ? 'where' : 'notWhere';
          if (graphQLWhere[whereTarget]) {
            if (graphQLWhere[whereTarget].objectId) {
              graphQLWhere[whereTarget].objectId = {
                ...graphQLWhere[whereTarget].objectId,
                $exists: fieldValue,
              };
            } else {
              graphQLWhere[whereTarget].objectId = {
                $exists: fieldValue,
              };
            }
          } else {
            const parseWhereTarget = fieldValue ? '$inQuery' : '$notInQuery';
            parentGraphQLWhere[parentFieldName][parseWhereTarget] = {
              where: { objectId: { $exists: true } },
              className: targetClass,
            };
          }
          delete graphQLWhere.$exists;
        } else {
          parentGraphQLWhere[parentFieldName].$exists = fieldValue;
        }
        return;
      }
      switch (fieldName) {
        case 'have':
          parentGraphQLWhere[parentFieldName].$inQuery = {
            where: fieldValue,
            className: targetClass,
          };
          if (targetClass) {
            transformGraphQLWhereToParse(
              parentGraphQLWhere[parentFieldName].$inQuery.where,
              targetClass,
              parseClasses
            );
          }
          break;
        case 'haveNot':
          parentGraphQLWhere[parentFieldName].$notInQuery = {
            where: fieldValue,
            className: targetClass,
          };
          if (targetClass) {
            transformGraphQLWhereToParse(
              parentGraphQLWhere[parentFieldName].$notInQuery.where,
              targetClass,
              parseClasses
            );
          }
          break;
      }
      delete graphQLWhere[fieldName];
      return;
    }
    switch (fieldName) {
      case 'point':
        if (typeof fieldValue === 'object' && !fieldValue.__type) {
          fieldValue.__type = 'GeoPoint';
        }
        break;
      case 'nearSphere':
        if (typeof fieldValue === 'object' && !fieldValue.__type) {
          fieldValue.__type = 'GeoPoint';
        }
        break;
      case 'box':
        if (
          typeof fieldValue === 'object' &&
          fieldValue.bottomLeft &&
          fieldValue.upperRight
        ) {
          fieldValue = [
            {
              __type: 'GeoPoint',
              ...fieldValue.bottomLeft,
            },
            {
              __type: 'GeoPoint',
              ...fieldValue.upperRight,
            },
          ];
          graphQLWhere[parseConstraintMap[fieldName]] = fieldValue;
        }
        break;
      case 'polygon':
        if (fieldValue instanceof Array) {
          fieldValue.forEach(geoPoint => {
            if (typeof geoPoint === 'object' && !geoPoint.__type) {
              geoPoint.__type = 'GeoPoint';
            }
          });
        }
        break;
      case 'centerSphere':
        if (
          typeof fieldValue === 'object' &&
          fieldValue.center &&
          fieldValue.distance
        ) {
          fieldValue = [
            {
              __type: 'GeoPoint',
              ...fieldValue.center,
            },
            fieldValue.distance,
          ];
          graphQLWhere[parseConstraintMap[fieldName]] = fieldValue;
        }
        break;
    }
    if (typeof fieldValue === 'object') {
      if (fieldName === 'where') {
        transformGraphQLWhereToParse(fieldValue, parseClassName, parseClasses);
      } else {
        transformQueryConstraintInputToParse(
          fieldValue,
          fieldName,
          parseClassName,
          graphQLWhere,
          parseClasses
        );
      }
    }
  });
};

/**
 * Function that takes in a GraphQLWhere statement and converts into a Parse query input constraint.
 *
 * This function also takes care of GraphQLWhere statements that start with a `AND`, `OR`, or `NOR`.
 *
 * Note: Renamed from parse-server/src/GraphQL/... transformQueryInputToParse
 *
 * @param graphQLWhere (object) GraphQL where input for the specified parseClassName. See type definition of `GraphQLWhere` for more information.
 * @param parseClassName (string) the Parse className (i.e. tablename) on which the where is being done.
 * @param parseClasses (array) Array of parse classes, which you can get by calling `Parse.schema.all()`. See type definition of `GraphQLWhere` for more information.
 * @returns void
 */
export const transformGraphQLWhereToParse = (
  graphQLWhere: { [key: string]: any },
  parseClassName: string,
  parseClasses: ParseClasses
) => {
  if (!graphQLWhere || typeof graphQLWhere !== 'object') {
    return;
  }

  Object.keys(graphQLWhere).forEach(fieldName => {
    const fieldValue = graphQLWhere[fieldName];

    if (parseQueryMap[fieldName]) {
      delete graphQLWhere[fieldName];
      fieldName = parseQueryMap[fieldName];
      graphQLWhere[fieldName] = fieldValue;
      fieldValue.forEach((fieldValueItem: GraphQLWhere) => {
        transformGraphQLWhereToParse(
          fieldValueItem,
          parseClassName,
          parseClasses
        );
      });
      return;
    } else {
      transformQueryConstraintInputToParse(
        fieldValue,
        fieldName,
        parseClassName,
        graphQLWhere,
        parseClasses
      );
    }
  });
};
