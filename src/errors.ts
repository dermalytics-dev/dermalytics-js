/** Custom error classes for the Dermalytics SDK */

export class DermalyticsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DermalyticsError';
    Object.setPrototypeOf(this, DermalyticsError.prototype);
  }
}

export class APIError extends DermalyticsError {
  constructor(message: string) {
    super(message);
    this.name = 'APIError';
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

export class AuthenticationError extends DermalyticsError {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class NotFoundError extends DermalyticsError {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class RateLimitError extends DermalyticsError {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

export class ValidationError extends DermalyticsError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotImplementedError extends DermalyticsError {
  constructor(message: string = 'Not implemented') {
    super(message);
    this.name = 'NotImplementedError';
    Object.setPrototypeOf(this, NotImplementedError.prototype);
  }
}
