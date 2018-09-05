
import { ComponentClass } from 'react';
import { connect } from 'react-redux';
import { Task } from 'redux-saga';
import { createStructuredSelector } from 'reselect';

import {
    Dict, FuncArgs, IApp,
    SagaMap, EffectFunc,
    SelectorArg, SelectStruct,
    ModelMap, ModelInstance, Model,
} from './';


const isSelectStruct = <P>(
    selector : SelectorArg<P>,
) : selector is SelectStruct<P> => {
    return selector && 'object' === typeof selector;
}

export class Block {

    private app : IApp;

    public model : Dict<Model<any>> = {};

    public container : Dict<ComponentClass<any>> = {};

    constructor (app : IApp) {
        this.app = app;
    }

    public loadModel <M extends ModelMap>(modelMap : M) {
        const keys = Object.keys(modelMap);

        const newModel = keys
            .filter(key => !this.app.getModel(key))
            .map(key => new modelMap[key](key));
        if ( 0 < newModel.length ) {
            this.app.useModel(...newModel);
        }

        return Object.keys(modelMap).reduce((
            data : { [k in keyof M] : Model<any> },
            key : string,
        ) => {
            data[key] = this.app.getModel(key);
            return data;
        }, {}) as { [k in keyof M] : ModelInstance<M[k]> };
    }

    public loadEffect <M extends SagaMap>(sagaMap : M) {
        return Object.keys(sagaMap).reduce((
            data : { [k in keyof M] : EffectFunc },
            key : keyof M,
        ) => {
            data[key] = <T1, T2, T3, T4, T5, T6>(
                arg1 ?: T1, arg2 ?: T2, arg3 ?: T3, arg4 ?: T4,
                arg5 ?: T5, arg6 ?: T6, ...rest: any[]
            ) => this.app.runSaga(
                sagaMap[key].bind(this), arg1, arg2, arg3,
                arg4, arg5, arg6, ...rest
            );
            return data;
        }, {}) as {
            [k in keyof M] : (...args : FuncArgs<M[k]>) => Task;
        };
    }

    public connect <P>(
        selector : SelectorArg<P>,
        effect : SagaMap = {},
    ) {
        const mapStateToProps = isSelectStruct(selector) ?
            createStructuredSelector(selector as {}) : selector;
        const mapDispatchToProps = () => this.loadEffect(effect);
        return connect<Partial<P>>(
            mapStateToProps, mapDispatchToProps,
        );
    }

}
