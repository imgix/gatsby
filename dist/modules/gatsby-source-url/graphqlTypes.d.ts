import { GatsbyCache } from 'gatsby';
/**
 * The GraphQL type of the fluid field.
 * Corresponding TS type is FluidObject from gatsby-image.
 */
import { FixedObject, FluidObject } from 'gatsby-image';
import { GraphQLInputObjectType, GraphQLObjectType } from 'graphql';
export declare const ImgixUrlParamsInputType: GraphQLInputObjectType;
export declare const createGatsbySourceImgixFluidFieldType: (cache: GatsbyCache) => GraphQLObjectType<FluidObject, unknown, {
    [argName: string]: any;
}>;
export declare const createGatsbySourceImgixFixedFieldType: (cache: GatsbyCache) => GraphQLObjectType<FixedObject>;
export declare type IGatsbySourceImgixUrlField = string;
export declare const gatsbySourceImgixUrlFieldType: import("graphql").GraphQLScalarType;
//# sourceMappingURL=graphqlTypes.d.ts.map