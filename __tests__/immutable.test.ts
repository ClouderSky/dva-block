


import { embedData, immutable } from '../src/immutable';


describe('不可变数据接口封装辅助功能', () => {

    test('路径列表转换为嵌套数据', () => {
        expect(embedData([], true)).toEqual(true);
        expect(embedData(['a'], true)).toEqual({ a : true });
        expect(embedData(['a', 'b'], true)).toEqual({ a : { b : true } });
        expect(embedData(['a', 'b', 'c'], true))
            .toEqual({ a : { b : { c : true } } });

        expect(embedData([], true)).toEqual(embedData('', true));
        expect(embedData(['a'], true)).toEqual(embedData('a', true));
        expect(embedData(['a', 'b'], true)).toEqual(embedData('a.b', true));
        expect(embedData(['a', 'b', 'c'], true))
            .toEqual(embedData('a.b.c', true));
    });

    const original = {
        a : { b : { c : 1, d : 2, e : [3, 4, 5] } },
        f : 6,
    };

    test('测试修改赋值', () => {
        const data = immutable(original).$set(['a', 'b', 'c'], 2);

        expect(data.a.b.c).toEqual(2);
        expect(data.a.b.d).toBe(original.a.b.d);
        expect(data.a.b.e).toBe(original.a.b.e);
        expect(data.f).toBe(original.f);

        expect(data.a.b).not.toBe(original.a.b);
        expect(data.a).not.toBe(original.a);
        expect(data).not.toBe(original);
    });

    test('测试删除键', () => {
        const data = immutable(original).$unset(['a', 'b'], ['e']);

        expect(data.a.b).toEqual({ c : 1, d : 2 });
        expect(data.a.b.c).toBe(original.a.b.c);
        expect(data.a.b.d).toBe(original.a.b.d);
        expect(data.f).toBe(original.f);

        expect(data.a.b).not.toBe(original.a.b);
        expect(data.a).not.toBe(original.a);
        expect(data).not.toBe(original);
    });

});
