// Copyright 2019 Xlab
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import fengari from 'fengari';
import { TextDecoder } from 'text-encoding';

const lua = fengari.lua;
const lauxlib = fengari.lauxlib;
const lualib = fengari.lualib;

export class LuaVm {

  private L: any;
  private ctx: Map<string, any>;
  private decoder: any;
  private MAGIC = 29384123;

  constructor() {
    this.L = lauxlib.luaL_newstate();
    lualib.luaL_openlibs(this.L);
    this.ctx = new Map<string, any>();
    this.decoder = new TextDecoder('utf-8');
  }

  public run(source: string): any {
    for (const [ key, value ] of this.ctx) {
      const n = this.pushStackValue(value);
      if (n !== 0) {
        lua.lua_setglobal(this.L, key);
      }
    }
    lauxlib.luaL_dostring(this.L, fengari.to_luastring(source));
    return this.getStackValue(-1);
  }

  public set(key: string, value: any): this {
    if (typeof value === 'function') {
      value = this.wrapFunc(value);
    }
    this.ctx.set(key, value);
    return this;
  }

  private wrapFunc(func: (...args: any[]) => any): any {
    const wrapped = (): any => {
      // call in ts
      const nArgs = lua.lua_gettop(this.L);
      const args: any[] = [];
      for (let i = 0 ; i < nArgs; i++) {
        args.push(this.getStackValue(i + 1));
      }
      const res = func(...args);
      // set return value
      return this.pushStackValue(res);
    };
    return wrapped;
  }

  private getStackValue(index: number): any {
    const type = this.getStackType(index);
    switch (type) {
      case 'number':
        return lua.lua_tonumber(this.L, index);
      case 'string':
        return lua.lua_tojsstring(this.L, index);
      case 'boolean':
        return lua.lua_toboolean(this.L, index);
      case 'userdata':
        return lua.lua_touserdata(this.L, index);
      case 'function':
        // lua_pushvalue will load index value on stack top
        // lua_setglobal will pop the stack top and set to global reference
        // so current callback function can be used later
        const funcName = Math.random().toString();
        lua.lua_pushvalue(this.L, index);
        lua.lua_setglobal(this.L, funcName);
        return (...args: any[]): any => {
          // get callback funtion and push to stack top
          const oldStackTop = lua.lua_gettop(this.L);
          lua.lua_getglobal(this.L, funcName);
          args.forEach(p => {
            // push all args in sequence
            this.pushStackValue(p);
          });
          // call current function
          let ret = lua.lua_pcall(this.L, args.length, lua.LUA_MULTRET, 0);
          if (ret !== lua.LUA_OK) {
            // If ret !=== lua.LUA_OK, means there are errors while executing the function
            console.log(`Error when exec function, ret=${ret}, name=${funcName}, msg=${this.getStackValue(-1)}`);
          }
          ret = undefined;
          if (lua.lua_gettop(this.L) !== oldStackTop) {
            // after function call, stack top not equal means have return value
            // get the last return value from stack
            ret = this.getStackValue(-1);
          }
          return ret;
        };
      case 'table':
        let magic = this.MAGIC + 1;
        try {
          lua.lua_rawgeti(this.L, -1, 0);
          magic = this.getStackValue(-1);
          lua.lua_pop(this.L, 1);
        // tslint:disable-next-line: no-empty
        } catch { }
        if (magic === this.MAGIC) {
          // array
          const arr: any[] = [];
          for (let i = 1; ; i++) {
            lua.lua_rawgeti(this.L, -1, i);
            const v = this.getStackValue(-1);
            lua.lua_pop(this.L, 1);
            if (!v) break;
            arr.push(v);
          }
          return arr;
        } else {
          const map = new Map<string, any>();
          lua.lua_pushnil(this.L);
          while (lua.lua_next(this.L, index) !== 0) {
            // iterate keys and values from table at index
            // lua_next will push key and value on stack
            const value = this.getStackValue(-1);
            const key = this.getStackValue(-2);
            if (typeof key === 'string') {
              map.set(key, value);
            }
            lua.lua_pop(this.L, 1);
          }
          return map;
        }
      case 'no value':
        return undefined;
      case 'nil':
        return null;
      default:
        console.log(`Not supported type=${type}, index=${index}`);
        return undefined;
    }
  }

  private pushStackValue(value: any): number {
    const type = typeof value;
    switch (type) {
      case 'number':
        lua.lua_pushnumber(this.L, value);
        break;
      case 'string':
        lua.lua_pushstring(this.L, value);
        break;
      case 'boolean':
        lua.lua_pushboolean(this.L, value);
        break;
      case 'object':
        if (value instanceof Map) {
          // if pass in a Map, push as a table, so can use it in lua
          // the key must be in string type, the value can be any type
          lua.lua_newtable(this.L);
          for (const [ k, v ] of value) {
            if (typeof k === 'string') {
              lua.lua_pushstring(this.L, k);
              const n = this.pushStackValue(v);
              if (n === 0) {
                // not support type or not push into stack
                // pop out the key
                lua.lua_pop(this.L, 1);
              } else {
                // set table value into table
                lua.lua_settable(this.L, -3);
              }
            }
          }
        } else if (Array.isArray(value)) {
          // if pass in an array, push as a table, set index and value
          lua.lua_newtable(this.L);
          this.pushStackValue(this.MAGIC);
          lua.lua_rawseti(this.L, -2, 0); // set -1 to MAGIC
          (value as any[]).forEach((v, i) => {
            const n = this.pushStackValue(v);
            if (n !== 0) {
              lua.lua_rawseti(this.L, -2, i + 1);
            } else {
              lua.lua_pop(this.L, 1);
            }
          });
        } else {
          lua.lua_pushlightuserdata(this.L, value);
        }
        break;
      case 'function':
        lua.lua_pushjsfunction(this.L, value);
        break;
      case 'undefined':
        return 0;
      default:
        console.log(`Not supported type: ${type}`);
        return 0;
    }
    return 1;
  }

  private getStackType(index: number): string {
    const luaType = lua.lua_type(this.L, index);
    const type = lua.lua_typename(this.L, luaType);
    return this.decoder.decode(type);
  }

}