// Placeholder para utilitários de validação de leitura
export function isValidBarcode(code) {
  return typeof code === 'string' && code.length > 0;
}
