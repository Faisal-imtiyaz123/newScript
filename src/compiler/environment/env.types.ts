export type Binding = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value:any;
    isConstant:boolean;
    type?:string // e.g number | string | boolean | any
}