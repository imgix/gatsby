import * as t from 'io-ts';
interface AspectRatioBrand {
    readonly StringAspectRatio: unique symbol;
}
export declare const StringAspectRatio: t.BrandC<t.StringC, AspectRatioBrand>;
export declare type StringAspectRatio = t.TypeOf<typeof StringAspectRatio>;
export declare const parseStringARParam: (ar: StringAspectRatio) => number;
export {};
//# sourceMappingURL=ar.d.ts.map