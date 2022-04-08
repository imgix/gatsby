import Joi from 'joi';
import { roundToDP } from './number';

const StringAspectRatioSchema = Joi.string()
  .pattern(/^\d+(\.\d+)?:\d+(\.\d+)?$/)
  .required();

export type StringAspectRatio = string;

/**
 * Parse a string AR into a float.
 */
export const parseStringARParam = (ar: StringAspectRatio): number => {
  const validatedAR = StringAspectRatioSchema.validate(ar);
  if (validatedAR.error) {
    throw new Error('AR is not valid');
  }
  const splitAR = validatedAR.value.split(':') as [string, string];
  const [parsedWidth, parsedHeight] = splitAR.map((part) => parseFloat(part));
  if (Number.isNaN(parsedWidth) || Number.isNaN(parsedHeight)) {
    throw new Error('AR is not valid');
  }
  const arFloat = parsedWidth / parsedHeight;
  return roundToDP(3, arFloat);
};
