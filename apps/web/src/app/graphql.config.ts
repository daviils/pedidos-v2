import { provideHttpClient } from '@angular/common/http';
import { inject, type ApplicationConfig } from '@angular/core';
import { InMemoryCache } from '@apollo/client';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';

const GRAPHQL_URI = 'http://localhost:3000/graphql';

export const graphqlProviders: ApplicationConfig['providers'] = [
  provideHttpClient(),
  provideApollo(() => {
    const httpLink = inject(HttpLink);

    return {
      link: httpLink.create({
        uri: GRAPHQL_URI,
      }),
      cache: new InMemoryCache(),
    };
  }),
];
