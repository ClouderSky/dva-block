
import update from 'immutability-helper';

import { Dict, Path, KeyPath } from './';


const autoKeyToPath = (keyPath : KeyPath) : Path =>
    keyPath instanceof Array ? keyPath : (keyPath ? keyPath.split('.') : []);

const pathToEmbed = (path : Path, value : any) : Dict => {
    if ( !path.length ) { return value; }
    const [key, ...other] = path;
    return { [key] : pathToEmbed(other, value) };
}

export const embedData = (keyPath : KeyPath, value : any) =>
    pathToEmbed(autoKeyToPath(keyPath), value);

const opWrapper = (method : string) => (value : any) => ({ [method] : value });

const opSet = opWrapper('$set');
const opUnset = opWrapper('$unset');

const updateData = (op : (value : any) => {}) =>
    (data : Dict) => (path : KeyPath, value : any) : Dict =>
        update(data, embedData(path, op(value)));

export const immutable = (data : Dict) => ({
    $set : updateData(opSet)(data), $unset : updateData(opUnset)(data),
    $fetch : (keyPath : KeyPath) =>
        autoKeyToPath(keyPath).reduce((
            item : Dict, key : string,
        ) => {
            return undefined === item ? undefined : item[key];
        }, data),
});
