import type { CodegenConfig } from '@graphql-codegen/cli';

const schema = process.env.GRAPHQL_SCHEMA_URL ?? 'http://localhost:3000/graphql';

const config: CodegenConfig = {
  schema,
  documents: ['apps/web/src/**/*.graphql'],
  ignoreNoDocuments: true,
  generates: {
    'apps/web/src/app/graphql/generated/': {
      preset: 'client',
      presetConfig: {
        gqlTagName: 'gql',
      },
    },
  },
};

export default config;
