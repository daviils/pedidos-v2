/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "fragment User on UserAdmin {\n  id\n  email\n  name\n}": typeof types.UserFragmentDoc,
    "mutation Login($email: String!, $password: String!) {\n  loginAdmin(email: $email, password: $password) {\n    accessToken\n    tokenType\n  }\n}": typeof types.LoginDocument,
    "query Me {\n  getMeAdmin {\n    ...User\n  }\n}": typeof types.MeDocument,
};
const documents: Documents = {
    "fragment User on UserAdmin {\n  id\n  email\n  name\n}": types.UserFragmentDoc,
    "mutation Login($email: String!, $password: String!) {\n  loginAdmin(email: $email, password: $password) {\n    accessToken\n    tokenType\n  }\n}": types.LoginDocument,
    "query Me {\n  getMeAdmin {\n    ...User\n  }\n}": types.MeDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "fragment User on UserAdmin {\n  id\n  email\n  name\n}"): (typeof documents)["fragment User on UserAdmin {\n  id\n  email\n  name\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "mutation Login($email: String!, $password: String!) {\n  loginAdmin(email: $email, password: $password) {\n    accessToken\n    tokenType\n  }\n}"): (typeof documents)["mutation Login($email: String!, $password: String!) {\n  loginAdmin(email: $email, password: $password) {\n    accessToken\n    tokenType\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query Me {\n  getMeAdmin {\n    ...User\n  }\n}"): (typeof documents)["query Me {\n  getMeAdmin {\n    ...User\n  }\n}"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;
