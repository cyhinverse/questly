// Validation schemas and functions

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    errors.push({ field: 'password', message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Confirm password validation
export const validateConfirmPassword = (password: string, confirmPassword: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Please confirm your password' });
  } else if (password !== confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Quiz title validation
export const validateQuizTitle = (title: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!title || !title.trim()) {
    errors.push({ field: 'title', message: 'Quiz title is required' });
  } else if (title.trim().length < 3) {
    errors.push({ field: 'title', message: 'Quiz title must be at least 3 characters long' });
  } else if (title.trim().length > 100) {
    errors.push({ field: 'title', message: 'Quiz title must be less than 100 characters' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Quiz description validation
export const validateQuizDescription = (description: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (description && description.length > 500) {
    errors.push({ field: 'description', message: 'Description must be less than 500 characters' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Question content validation
export const validateQuestionContent = (content: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!content || !content.trim()) {
    errors.push({ field: 'content', message: 'Question content is required' });
  } else if (content.trim().length < 10) {
    errors.push({ field: 'content', message: 'Question must be at least 10 characters long' });
  } else if (content.trim().length > 500) {
    errors.push({ field: 'content', message: 'Question must be less than 500 characters' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Question options validation
export const validateQuestionOptions = (options: string[]): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!options || options.length < 2) {
    errors.push({ field: 'options', message: 'At least 2 options are required' });
  } else if (options.length > 6) {
    errors.push({ field: 'options', message: 'Maximum 6 options allowed' });
  } else {
    options.forEach((option, index) => {
      if (!option || !option.trim()) {
        errors.push({ field: `option_${index}`, message: `Option ${index + 1} is required` });
      } else if (option.trim().length > 200) {
        errors.push({ field: `option_${index}`, message: `Option ${index + 1} must be less than 200 characters` });
      }
    });
    
    // Check for duplicate options
    const uniqueOptions = new Set(options.map(opt => opt.trim().toLowerCase()));
    if (uniqueOptions.size !== options.length) {
      errors.push({ field: 'options', message: 'All options must be unique' });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Room code validation
export const validateRoomCode = (roomCode: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!roomCode || !roomCode.trim()) {
    errors.push({ field: 'roomCode', message: 'Room code is required' });
  } else if (!/^[A-Z0-9]{6}$/.test(roomCode.trim())) {
    errors.push({ field: 'roomCode', message: 'Room code must be exactly 6 characters (letters and numbers only)' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Nickname validation
export const validateNickname = (nickname: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!nickname || !nickname.trim()) {
    errors.push({ field: 'nickname', message: 'Nickname is required' });
  } else if (nickname.trim().length < 2) {
    errors.push({ field: 'nickname', message: 'Nickname must be at least 2 characters long' });
  } else if (nickname.trim().length > 20) {
    errors.push({ field: 'nickname', message: 'Nickname must be less than 20 characters' });
  } else if (!/^[a-zA-Z0-9_\s]+$/.test(nickname.trim())) {
    errors.push({ field: 'nickname', message: 'Nickname can only contain letters, numbers, spaces, and underscores' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Display name validation
export const validateDisplayName = (displayName: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (displayName && displayName.trim().length > 50) {
    errors.push({ field: 'displayName', message: 'Display name must be less than 50 characters' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Bio validation
export const validateBio = (bio: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (bio && bio.length > 500) {
    errors.push({ field: 'bio', message: 'Bio must be less than 500 characters' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Combined validation for multiple fields
export const validateMultiple = (validations: ValidationResult[]): ValidationResult => {
  const allErrors: ValidationError[] = [];
  
  validations.forEach(validation => {
    if (!validation.isValid) {
      allErrors.push(...validation.errors);
    }
  });
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
};

// Sanitize input
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// Validate file upload
export const validateFileUpload = (file: File, maxSize: number = 5 * 1024 * 1024): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!file) {
    errors.push({ field: 'file', message: 'File is required' });
  } else {
    if (file.size > maxSize) {
      errors.push({ field: 'file', message: `File size must be less than ${maxSize / (1024 * 1024)}MB` });
    }
    
    if (!file.type.startsWith('image/')) {
      errors.push({ field: 'file', message: 'File must be an image' });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
