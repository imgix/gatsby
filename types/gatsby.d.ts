import * as gatsby from 'gatsby';
import * as GraphQL from 'graphql';
declare module 'gatsby' {
  type IGraphQLTypeMap = {
    [k: string]: GraphQL.GraphQLFieldConfig<any, any, any> | IGraphQLTypeMap;
  };
  type IRootGraphQLTypeMap = {
    // ensure Query isn't resolved directly
    Query?: IGraphQLTypeMap;
  } & IGraphQLTypeMap;

  export type ICreateResolversFn = (typeMap: IRootGraphQLTypeMap) => void;

  export interface PluginOptions<TCustomPluginOpts>
    extends gatsby.PluginOptions {
    [T in TCustomPluginOpts]: TCustomPluginOpts[T];
  }

  export interface CreateResolversArgsPatched extends ParentSpanPluginArgs {
    intermediateSchema: object;
    createResolvers: ICreateResolversFn;
    traceId: 'initial-createResolvers';
  }
  export interface GatsbyNode {
    createResolvers?<TCustomPluginOpts = {}>(
      args: CreateResolversArgsPatched,
      options: PluginOptions<TCustomPluginOpts>,
    ): void;
  }
}
