type Func0<R> = () => R;
type Func1<T1, R> = (a1: T1) => R;
type Func2<T1, T2, R> = (a1: T1, a2: T2) => R;
type Func3<T1, T2, T3, R> = (a1: T1, a2: T2, a3: T3, ...args: any[]) => R;
