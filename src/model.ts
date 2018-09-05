
import {
    Reducer, handleActions,
    createAction as createActionCreator,
} from 'redux-actions';

import {
    Dict,
    IActionDef, IActionFunction,
    ActionMap, SelectMap,
} from './';


export class Model<S> {

    public name : string;

    public initialState : S;

    public action : ActionMap<S>;

    public select : SelectMap = {};

    constructor (name : string) {
        this.name = name;
    }

    public fetch = (state : Dict = {}) : S => state[this.name];

    public createAction <A, M = any>(
        type : string, option : IActionFunction<A, S, M>,
    ) {
        const action : IActionDef<A, S> =
            createActionCreator<A, M>(
                this.keyInNamespace(type),
                option.payload,
                option.meta,
            );

        if ( option.reducer ) {
            action.reducer = option.reducer;
        }

        return action;
    }

    public getReducer () {
        const handler : Dict<Reducer<S, any>> = Object.keys(this.action)
            .filter(key => this.action[key].reducer)
            .reduce((temp : Dict, key) => {
                temp[this.keyInNamespace(key)] = this.action[key].reducer;
                return temp;
            }, {});
        return handleActions<S, any>(handler, this.initialState);
    }

    private keyInNamespace (key : string) {
        return `${this.name}/${key}`;
    }

}
