
import { createSelector } from 'reselect';

import { Model } from '../src/model';


describe('模型类测试', () => {

    interface IAuthState { name : string; }

    interface IState { auth : IAuthState; }

    interface ILoginPayload { name : string; };


    class AuthModel extends Model<IAuthState> {

        public initialState = { name : 'init' };

        public action = {
            login : this.createAction<ILoginPayload>('login', {
                payload : (name : string) => ({ name }),
                reducer : (state, { payload }) => {
                    return { ...state, name : payload.name };
                },
            }),
        };

        public select = {
            name : createSelector(this.fetch, auth => auth.name),
        };

    }

    const model = new AuthModel('auth');


    test('查询状态', () => {
        const state : IState = { auth : { name : 'testing' } };

        expect(model.fetch(state)).toBe(state.auth);
        expect(model.select.name(state)).toBe(state.auth.name);
    });

    test('生成事件', () => {
        expect(model.action.login('user')).toEqual({
            type : model.name + '/login',
            payload : { name : 'user' },
        });
    });

    test('处理事件', () => {
        const reducer = model.getReducer();

        expect(reducer(undefined, model.action.login('user')))
            .toEqual({ name : 'user', });
    });

});
