// Validador de entrada para prevenir inyecciones y ataques
class InputValidator {
  
  // Patrones peligrosos que deben ser bloqueados
  static DANGEROUS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Scripts
    /javascript:/gi, // JavaScript URLs
    /on\w+\s*=/gi, // Event handlers
    /expression\s*\(/gi, // CSS expressions
    /vbscript:/gi, // VBScript
    /data:text\/html/gi, // Data URLs HTML
    /<iframe/gi, // iframes
    /<object/gi, // Objects
    /<embed/gi, // Embeds
    /<link/gi, // Links
    /<meta/gi, // Meta tags
    /\beval\s*\(/gi, // eval()
    /\bFunction\s*\(/gi, // Function constructor
    /\bsetTimeout\s*\(/gi, // setTimeout
    /\bsetInterval\s*\(/gi, // setInterval
  ];

  // Caracteres SQL peligrosos - Versión más específica y menos agresiva
  static SQL_INJECTION_PATTERNS = [
    // Solo palabras SQL completas al inicio de línea o después de espacios
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\s)/gi,
    // Caracteres realmente peligrosos en contexto SQL
    /(\s*;\s*(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION))/gi,
    // Comentarios SQL específicos
    /(\s*--\s*)/gi,
    /(\s*\/\*.*\*\/\s*)/gi,
    // Comillas seguidas de OR/AND (inyección típica)
    /('\s*(OR|AND)\s*')/gi,
    /('\s*(OR|AND)\s*\d)/gi
  ];

  // Validar email
  static isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // Validar teléfono
  static isValidPhone(phone) {
    if (!phone || typeof phone !== 'string') return false;
    
    // Permitir solo números, espacios, guiones y paréntesis
    const phoneRegex = /^[\d\s\-\(\)\+]{7,15}$/;
    return phoneRegex.test(phone);
  }

  // Validar nombre de usuario - Versión más permisiva
  static isValidUsername(username) {
    if (!username || typeof username !== 'string') return false;
    
    // Permitir letras, números, puntos, guiones y guiones bajos, 3-50 caracteres
    const usernameRegex = /^[a-zA-Z0-9._-]{3,50}$/;
    return usernameRegex.test(username);
  }

  // Validar contraseña
  static isValidPassword(password) {
    if (!password || typeof password !== 'string') return false;
    
    // Mínimo 8 caracteres
    if (password.length < 8) return false;
    
    // Verificar tipos de caracteres
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    // Requiere al menos 3 de los 4 tipos
    const criteriaCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar]
      .filter(Boolean).length;
    
    return criteriaCount >= 3;
  }

  // Sanitizar texto general
  static sanitizeText(text) {
    if (!text || typeof text !== 'string') return '';
    
    return text
      .trim()
      .replace(/[<>]/g, '') // Remover < y >
      .replace(/['"]/g, '') // Remover comillas
      .replace(/[&]/g, '&amp;') // Escapar &
      .substring(0, 1000); // Limitar longitud
  }

  // Sanitizar HTML
  static sanitizeHtml(html) {
    if (!html || typeof html !== 'string') return '';
    
    return html
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Detectar patrones peligrosos
  static containsDangerousPatterns(input) {
    if (!input || typeof input !== 'string') return false;
    
    return this.DANGEROUS_PATTERNS.some(pattern => pattern.test(input));
  }

  // Detectar inyección SQL
  static containsSqlInjection(input) {
    if (!input || typeof input !== 'string') return false;
    
    return this.SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input));
  }

  // Validar entrada completa
  static validateInput(input, type = 'text') {
    const result = {
      isValid: false,
      sanitized: '',
      errors: []
    };

    if (!input) {
      result.errors.push('Input vacío');
      return result;
    }

    if (typeof input !== 'string') {
      result.errors.push('Input debe ser string');
      return result;
    }

    // Verificar patrones peligrosos
    if (this.containsDangerousPatterns(input)) {
      result.errors.push('Contiene patrones peligrosos');
      return result;
    }

    if (this.containsSqlInjection(input)) {
      result.errors.push('Posible inyección SQL detectada');
      return result;
    }

    // Validar según tipo
    switch (type) {
      case 'email':
        result.isValid = this.isValidEmail(input);
        if (!result.isValid) result.errors.push('Email inválido');
        break;
        
      case 'phone':
        result.isValid = this.isValidPhone(input);
        if (!result.isValid) result.errors.push('Teléfono inválido');
        break;
        
      case 'username':
        result.isValid = this.isValidUsername(input);
        if (!result.isValid) result.errors.push('Usuario inválido');
        break;
        
      case 'password':
        result.isValid = this.isValidPassword(input);
        if (!result.isValid) result.errors.push('Contraseña no cumple requisitos');
        break;
        
      case 'text':
      default:
        result.isValid = input.length > 0 && input.length <= 1000;
        if (!result.isValid) result.errors.push('Texto inválido');
        break;
    }

    // Sanitizar si es válido
    if (result.isValid) {
      result.sanitized = this.sanitizeText(input);
    }

    return result;
  }

  // Validar objeto completo
  static validateObject(obj, schema) {
    const result = {
      isValid: true,
      sanitized: {},
      errors: []
    };

    for (const [key, rules] of Object.entries(schema)) {
      const value = obj[key];
      const validation = this.validateInput(value, rules.type);
      
      if (!validation.isValid) {
        result.isValid = false;
        result.errors.push(`${key}: ${validation.errors.join(', ')}`);
      } else {
        result.sanitized[key] = validation.sanitized;
      }
    }

    return result;
  }

  // Validar datos de registro
  static validateRegistrationData(data) {
    const schema = {
      nombre: { type: 'text' },
      apellido: { type: 'text' },
      usuario: { type: 'username' },
      correo: { type: 'email' },
      telefono: { type: 'phone' },
      contrasena: { type: 'password' }
    };

    return this.validateObject(data, schema);
  }

  // Validar datos de login - Versión menos restrictiva
  static validateLoginData(data) {
    const result = {
      isValid: true,
      sanitized: {},
      errors: []
    };

    // Validación básica de usuario
    if (!data.usuario || typeof data.usuario !== 'string') {
      result.isValid = false;
      result.errors.push('usuario: Usuario requerido');
    } else {
      const usuario = data.usuario.trim();
      
      // Solo verificar longitud y caracteres básicos para login
      if (usuario.length < 3 || usuario.length > 50) {
        result.isValid = false;
        result.errors.push('usuario: Usuario debe tener entre 3 y 50 caracteres');
      } else if (!/^[a-zA-Z0-9._-]+$/.test(usuario)) {
        result.isValid = false;
        result.errors.push('usuario: Usuario solo puede contener letras, números, puntos, guiones y guiones bajos');
      } else {
        result.sanitized.usuario = usuario;
      }
    }

    // Validación básica de contraseña
    if (!data.contrasena || typeof data.contrasena !== 'string') {
      result.isValid = false;
      result.errors.push('contrasena: Contraseña requerida');
    } else {
      const contrasena = data.contrasena;
      
      // Solo verificar longitud para login (no formato)
      if (contrasena.length < 1 || contrasena.length > 100) {
        result.isValid = false;
        result.errors.push('contrasena: Contraseña debe tener entre 1 y 100 caracteres');
      } else {
        result.sanitized.contrasena = contrasena;
      }
    }

    return result;
  }
}

export default InputValidator;