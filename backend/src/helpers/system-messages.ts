const createMessage = (action: string, resource: string) =>
  `${resource} ${action}`;
export const UNAUTHORIZED_ACTION = 'Unauthorized to perform this action';

// Resource messages
export const RESOURCE_NOT_FOUND = (resource: string) =>
  createMessage('not found', resource);
export const RESOURCE_ALREADY_EXISTS = (resource: string) =>
  createMessage('already exists', resource);
export const RESOURCE_CREATION_FAILED = (resource: string) =>
  createMessage('creation failed', resource);
export const RESOURCE_UPDATE_FAILED = (resource: string) =>
  createMessage('update failed', resource);
export const RESOURCE_DELETE_FAILED = (resource: string) =>
  createMessage('delete failed', resource);
export const RESOURCE_OPERATION_FAILED = (resource: string) =>
  createMessage('operation failed', resource);
export const RESOURCE_OPERATION_SUCCESSFUL = (resource: string) =>
  createMessage('operation successful', resource);
export const RESOURCE_CREATED_SUCCESSFULLY = (resource: string) =>
  createMessage('created successfully', resource);
export const RESOURCE_UPDATED_SUCCESSFULLY = (resource: string) =>
  createMessage('updated successfully', resource);
export const RESOURCE_DELETED_SUCCESSFULLY = (resource: string) =>
  createMessage('deleted successfully', resource);
export const RESOURCE_FETCHED_SUCCESSFULLY = (resource: string) =>
  createMessage('fetched successfully', resource);
export const RESOURCE_FETCH_FAILED = (resource: string) =>
  createMessage(resource, 'Failed to fetch');
export const RESOURCE_CURRENTLY_UNAVAILABLE = (resource: string) =>
  createMessage('is currently unavailable', resource);
export const RESOURCE_ALREADY_VERIFIED = (resource: string) =>
  createMessage('is already verified', resource);
export const RESOURCE_NOT_VERIFIED = (resource: string) =>
  createMessage('is not verified', resource);
export const RESOURCE_OPERATION_TOO_FREQUENT = (resource: string) =>
  createMessage('operation is too frequent', resource);
export const RESOURCE_CONFLICT = (idType: string, resource: string) =>
  `${idType} conflict in ${resource} resource`;
export const RESOURCE_EXPORTED_SUCCESSFULLY = (resource: string) =>
  createMessage('exported successfully', resource);
export const RESOURCE_EXPORT_FAILED = (resource: string) =>
  createMessage('export failed', resource);
export const FORBIDDEN_ACTION = 'Access to this resource is denied';

// Validation messages
export const INVALID_PARAMETER = (param: string) =>
  createMessage('is invalid', param);
export const INVALID_PARAMETERS = (params: string[]) =>
  `The following parameters are invalid: ${params.join(', ')}`;
export const INVALID_CREDENTIALS = (credentials: string[]) =>
  `The following credentials are invalid: ${credentials.join(', ')}`;
export const MISSING_REQUIRED_PARAMETER = (param: string) =>
  createMessage('is required', param);
export const MISSING_REQUIRED_PARAMETERS = (params: string[]) =>
  `The following required parameters are missing: ${params.join(', ')}`;

// Auth messages
export const TOKEN_INVALID = (param: string) =>
  createMessage('is invalid', `${param} token`);
export const TOKEN_EXPIRED = (param: string) =>
  createMessage('is expired', `${param} token`);

// System messages
export const INTERNAL_SERVER_ERROR = 'Internal server error';
export const RATE_LIMIT_EXCEEDED =
  'Rate limit exceeded. Please try again later';
