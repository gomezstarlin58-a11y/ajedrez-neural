import CryptoJS from 'crypto-js';

// 🛡️ MOTOR DE CIFRADO AES-256 
export const Blindaje = {
  // Convierte texto legible en una matriz incomprensible
  cifrar: (textoPlano: string, llaveMaestra: string): string => {
    try {
      // Retorna una cadena codificada en Base64
      return CryptoJS.AES.encrypt(textoPlano, llaveMaestra).toString();
    } catch (error) {
      console.error("Fallo crítico en el cifrado:", error);
      return "";
    }
  },

  // Intenta revertir la matriz a texto usando la llave
  descifrar: (textoCifrado: string, llaveMaestra: string): string => {
    try {
      const bytes = CryptoJS.AES.decrypt(textoCifrado, llaveMaestra);
      const textoOriginal = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!textoOriginal) throw new Error("Llave incorrecta o datos corruptos");
      return textoOriginal;
    } catch (error) {
      return "ACCESO DENEGADO: Clave inválida o datos manipulados.";
    }
  }
};