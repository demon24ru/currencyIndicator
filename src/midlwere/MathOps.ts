import config from '../config';

const _cf = (n: number)=> Math.round(Number(n) * Math.pow(10, config.accuracyMoneyMathOp));
const _ret= (n: number)=> Math.round(n) / Math.pow(10, config.accuracyMoneyMathOp);

// Преобразование для дальнейшего вычисления
// @ts-ignore
Math.r = (n: number) => _ret(_cf(n));

// Сложение "+"
// @ts-ignore
Math.a = (a: number, b: number) => _ret(_cf(a) + _cf(b));

// Вычитание "-"
// @ts-ignore
Math.s = (a: number, b: number) => _ret(_cf(a) - _cf(b));

// Умножение "*"
// @ts-ignore
Math.m = (a: number, b: number) => _ret((_cf(a) * _cf(b)) / Math.pow(10, config.accuracyMoneyMathOp));

// Деление "/"
// @ts-ignore
Math.d = (a: number, b: number) => _ret((_cf(a) / _cf(b)) * Math.pow(10, config.accuracyMoneyMathOp));
