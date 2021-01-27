import Uri from 'jsuri';
export const parseHost = (uri: string) => new Uri(uri).host();

export const parsePath = (uri: string) => new Uri(uri).path();
