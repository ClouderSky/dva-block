
import { ComponentClass } from 'react';
import {
    InferableComponentEnhancerWithProps,
} from 'react-redux';
import { Store } from 'redux';
import { Task } from 'redux-saga';
import { Action, Reducer } from 'redux-actions';
import { Selector } from 'reselect';
import { History } from 'history';


/**
 * utils
 */
interface Dict<T = any> { [key : string] : T }

type Saga<P extends any[] = any[]> =
    (...args : P) => Iterator<any>;
type RunSaga = <P extends any[]>(
    saga : Saga<P>, ...args : P
) => Task;


/**
 * immutable
 */
type Path = string[];
type KeyPath = Path | string;

declare function embedData (keyPath : KeyPath, value : any) : Dict<any>;

declare function immutable (data: Dict<any>) : {
    $set: (path: KeyPath, value: any) => Dict<any>;
    $unset: (path: KeyPath, value: any) => Dict<any>;
    $fetch: (keyPath: KeyPath) => any;
}


/**
 * model
 */
interface IActionDef<A, S> {
    (...args : any[]) : Action<A>;
    reducer ?: Reducer<S, A>;
}

interface IActionFunction<A, S = any, M = any> {
    payload ?: (...args : any[]) => A;
    meta ?: (...args : any[]) => M;
    reducer ?: Reducer<S, A>;
}

type ActionMap<S> = Dict<IActionDef<any, S>>;
type SelectMap = Dict<Selector<any, any>>;

declare class Model<S> {
    constructor(name : string);

    name : string;
    initialState : S;
    action : ActionMap<S>;
    select : SelectMap;

    fetch (state : Dict) : S;
    createAction <A, M = any>(
        type : string, option : IActionFunction<A, S, M>,
    ) : IActionDef<A, S>;
    getReducer () : Reducer<S, any>;
}


/**
 * block & app
 */
type SubModel = new(...args : any[]) => Model<any>;
type ModelMap = Dict<SubModel>;

type ModelInstance<T extends typeof Model> = T['prototype'];

type SelectStruct<P> = {
    [key in keyof P] ?: Selector<Dict, P[key]>;
};
type SelectorArg<P> =
    Selector<Dict, Partial<P>> | SelectStruct<P> | null;

type SagaMap = Dict<Saga>;
type EffectFunc<P extends any[] = any[]> =
    (...args : P) => Task;

type FuncArgs<T> =
    T extends (...args : infer P) => any ? P : any[];

interface IApp {
    getStore () : Store;
    getModel (name : string) : Model<any> | undefined;
    useModel (...args : Array<Model<any>>) : void;
    runSaga : RunSaga;
}

declare class Block {
    constructor (app : IApp);

    model : Dict<Model<any>>;
    container : Dict<ComponentClass<any>>;

    loadModel <M extends ModelMap>(modelMap : M) : {
        [k in keyof M] : ModelInstance<M[k]>;
    };
    loadEffect <M extends SagaMap>(sagaMap : M) : {
        [k in keyof M] : (...args : FuncArgs<M[k]>) => Task;
    };
    connect <P>(
        selector : SelectorArg<P>, effect : SagaMap,
    ) : InferableComponentEnhancerWithProps<Partial<P>, {}>;
}

type SubBlock = new(...args : any[]) => Block;
type BlockMap = Dict<SubBlock>;

type BlockInstance<B extends typeof Block> = B['prototype'];
type BlockCreator<B extends BlockMap> = {
    [key in keyof B] : () => BlockInstance<B[key]>;
};

declare class Application<B extends BlockMap> implements IApp {
    constructor (initialState ?: Dict);

    history : History;

    loadBlockCreator (block : B) : BlockCreator<B>;
    getStore () : Store;
    getBlock (name : keyof B) : BlockInstance<B[keyof B]>;
    getModel (name: string) : Model<any>;
    useModel (...args: Model<any>[]) : void;
    runSaga <P extends any[]>(saga: Saga<P>, ...args: P) : Task;
}

type AppCreator = <B extends BlockMap>(blockMap : B) =>
    { new(initialState ?: Dict) : Application<B> };

declare const app : AppCreator;
