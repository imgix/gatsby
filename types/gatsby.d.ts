import 'gatsby';
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

  export type PatchedPluginOptions<TCustomPluginOpts> = Pick<
    PluginOptions,
    'plugins'
  > &
    TCustomPluginOpts;

  export interface CreateResolversArgsPatched extends ParentSpanPluginArgs {
    intermediateSchema: object;
    createResolvers: ICreateResolversFn;
    traceId: 'initial-createResolvers';
  }

  export type IOnCreateNodeHook<TOpts = {}> = (
    args: CreateNodeArgs,
    options: PatchedPluginOptions<TOpts>,
  ) => void;

  export type ICreateSchemaCustomizationHook<TOpts = {}> = (
    args: CreateSchemaCustomizationArgs,
    options: PatchedPluginOptions<TOpts>,
  ) => any;

  export type ICreateResolversHook<TOpts = {}> = (
    args: CreateResolversArgsPatched,
    options: PatchedPluginOptions<TOpts>,
  ) => void;

  export interface GatsbyNode<TOpts = {}> {
    createResolvers?: ICreateResolversFn<TOpts>;
    onCreateNode?: IOnCreateNodeHook<TOpts>;
    createSchemaCustomization?: ICreateSchemaCustomizationHook<TOpts>;
  }
}
