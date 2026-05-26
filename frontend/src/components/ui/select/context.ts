/**
 * Select 与 SelectOption 共享的 inject key，
 * 必须使用同一 symbol 才能正确 provide/inject。
 */
export const SELECT_CTX = Symbol('Select') as symbol
