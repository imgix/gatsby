import { GatsbyNode } from 'gatsby';
import imgixUrlParameters from 'imgix-url-params/dist/parameters.json';
import { mapObjIndexed } from 'ramda';
import { IImgixGatsbyOptions } from '../../publicTypes';

/**
 * Run during the bootstrap phase. Plugins can use this to define a schema for
 * their options using Joi to validate the options users pass to the plugin.
 *
 * @see https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/#pluginOptionsSchema
 */
export const pluginOptionsSchema: NonNullable<
  GatsbyNode['pluginOptionsSchema']
> = function (args) {
  const { Joi } = args;

  const ImgixSourceTypeJOI = Joi.string().valid(
    's3',
    'gcs',
    'azure',
    'webFolder',
    'webProxy',
  );

  const ImgixParamValueJOI = Joi.alternatives()
    .try(
      Joi.string(),
      Joi.number(),
      Joi.boolean(),
      Joi.array().items(Joi.string()),
      Joi.array().items(Joi.number()),
      Joi.array().items(Joi.boolean()),
    )
    .optional()
    .allow(null);

  const mapToImgixParamJOIValue = <TKey extends string>(
    obj: Record<TKey, unknown>,
  ): Record<TKey, typeof ImgixParamValueJOI> =>
    mapObjIndexed(() => ImgixParamValueJOI, obj);

  const ImgixParamsJOI = Joi.object().keys({
    ...mapToImgixParamJOIValue(imgixUrlParameters.aliases),
    ...mapToImgixParamJOIValue(imgixUrlParameters.parameters),
  });

  const ImgixGatsbyFieldsJOI = Joi.array().items(
    Joi.object()
      .keys({
        nodeType: Joi.string()
          .required()
          .description('The GraphQL node type to modify.'),
        fieldName: Joi.string()
          .required()
          .description(
            'The name for the imgix field that will be added to the corresponding node type',
          ),
        URLPrefix: Joi.string()
          .optional()
          .description(
            'The prefix to add to the image URL resolved from the node data',
          ),
        rawURLKeys: Joi.array()
          .items(Joi.string())
          .description('Where to get the image URL from the node data'),
        rawURLKey: Joi.string().description(
          'The path to get the image URL from the node data',
        ),
      })
      .xor('rawURLKeys', 'rawURLKey'),
  );

  const schema = Joi.object<IImgixGatsbyOptions & { plugins: any }>().keys({
    domain: Joi.string()
      .required()
      .description(
        "This is the domain of your imgix source, which can be created at https://dashboard.imgix.com/. The source specified must be a 'Web Proxy' source type.",
      ),
    secureURLToken: Joi.string()
      .optional()
      .description(
        "This is the source's secure token. Can be found under the 'Security' heading in your source's configuration page, and revealed by tapping 'Show Token'.",
      ),
    defaultImgixParams: ImgixParamsJOI.optional().description(
      'These are the default imgix parameters to apply to every image.',
    ),
    disableIxlibParam: Joi.boolean()
      .optional()
      .description(
        'Set to `true` to remove the `ixlib` param from every request.',
      ),
    sourceType: ImgixSourceTypeJOI.optional().description(
      'This should specify the type of imgix source that is used for this plugin',
    ),
    fields: ImgixGatsbyFieldsJOI.optional().description(
      'If set, the plugin will transform these node types to add imgixImage fields to the corresponding types.',
    ),
    // This seems to be added by Gatsby automatically, although it has no
    // relevance to our plugin. We have to include this otherwise validation
    // fails
    plugins: Joi.any(),
  });

  return schema;
};
