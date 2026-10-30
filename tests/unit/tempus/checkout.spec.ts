import { describe, expect, it } from 'vitest';
import { initialState, remaining, safeState, validEmail } from '../../../lib/tempus/checkout';
describe('Tempus checkout boundaries',()=>{
 it('rejects malformed email addresses',()=>{expect(validEmail('sem-arroba')).toBe(false);expect(validEmail('nome@dominio')).toBe(false);expect(validEmail('nome@dominio.com.br')).toBe(true);});
 it('does not restore personal data or authentication from browser storage',()=>{const state=safeState({...initialState,screen:'confirmado',email:'private@example.com',name:'Private',account:true});expect(state.email).toBe('');expect(state.name).toBe('');expect(state.account).toBe(false);});
 it('rejects unknown plans and routes',()=>{expect(safeState({plan:'inventado',screen:'confirmado'})).toEqual(initialState);expect(safeState({plan:'essencial',screen:'admin'})).toEqual(initialState);});
 it('clamps expiration and calculates remaining seconds',()=>{expect(remaining(1000,2000)).toBe(0);expect(remaining(3500,1000)).toBe(3);});
});

