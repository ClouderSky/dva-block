
import {
    Store, Middleware, createStore, combineReducers, applyMiddleware,
} from 'redux';
import createSagaMiddleware, { SagaMiddleware, Task } from 'redux-saga';
import { defaultMemoize } from 'reselect';
import { History, createBrowserHistory } from 'history';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { composeWithDevTools } from 'redux-devtools-extension';

import {
    Dict, Model, Saga, IApp, AppCreator, NodeEnv,
    BlockMap, BlockCreator, Block,
} from './';


export class Application<B extends BlockMap> implements IApp {

    public history : History;

    private env : NodeEnv;

    private store : Store;

    private model : Map<string, Model<any>> = new Map();

    protected blockCreator : BlockCreator<B>;

    private sagaMiddleware : SagaMiddleware<{}>;

    private initialState : Dict;

    constructor (env : NodeEnv, initialState ?: Dict) {
        this.env = env;
        this.initialState = initialState;
    }

    public loadBlockCreator (block : B) {
        return Object.keys(block).reduce((
            data : { [k in keyof B] : () => Block },
            key : keyof B,
        ) => {
            data[key] = defaultMemoize(
                () => new block[key](this),
            );
            return data;
        }, {}) as BlockCreator<B>;
    }

    private getModelReducer () {
        const routeWrapper = connectRouter(this.history);

        if ( 0 === this.model.size ) {
            return routeWrapper((state : Dict) => state);
        }

        const reducers : Dict = {};
        this.model.forEach(model => {
            reducers[model.name] = model.getReducer();
        });

        return routeWrapper(combineReducers(reducers));
    }

    public getMiddleware () : Middleware[] {
        return [];
    }

    public getStore () {
        if ( !this.store ) {
            this.history = createBrowserHistory();
            this.sagaMiddleware = createSagaMiddleware();

            const middleware = applyMiddleware(
                this.sagaMiddleware,
                routerMiddleware(this.history),
                ...this.getMiddleware(),
            );
            const storeEnhancer = 'development' === this.env ?
                composeWithDevTools(middleware) : middleware;

            this.store = createStore(
                this.getModelReducer(),
                this.initialState,
                storeEnhancer,
            )
        }
        return this.store;
    }

    public getBlock (name : keyof B) {
        return this.blockCreator[name]();
    }

    public getModel (name : string) {
        return this.model.get(name);
    }

    public useModel (...args : Array<Model<any>>) {
        args.forEach(model => this.model.set(model.name, model));
        return this.updateModel();
    }

    private updateModel () {
        if ( this.store ) {
            this.store.replaceReducer(this.getModelReducer());
        }
    }

    public runSaga <P extends any[]>(
        saga : Saga<P>, ...args : P
    ) {
        const [
            arg1, arg2, arg3, arg4, arg5, arg6, ...rest
        ] = args;
        return this.sagaMiddleware.run(
            saga as Saga<any[]>,
            arg1, arg2, arg3, arg4, arg5, arg6, ...rest
        );
    }

}

export const app : AppCreator = <B extends BlockMap>(
    blockMap : B,
) => {
    return class extends Application<B> {

        public blockCreator = this.loadBlockCreator(blockMap);

    };
};
