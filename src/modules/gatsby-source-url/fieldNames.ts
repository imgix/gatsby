export const getTypeName = ({
  namespace,
  typeName,
}: {
  namespace?: string;
  typeName: 'Fluid' | 'Fixed' | 'ParamsInput' | 'Placeholder';
}) => `${namespace ?? 'Imgix'}${typeName}`;
