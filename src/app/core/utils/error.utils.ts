export function processError(
  error: any,
  defaultError: string = 'Error desconocido'
) {
  if (!error) {
    return [defaultError];
  }
  const errors: string[] = [];
  iterateErrorObject(error, errors);
  return errors;
}

function iterateErrorObject(error: any, errors: string[] = []) {
  if (error.hasOwnProperty('errors')) {
    error = error.errors;
  }

  if (!error) return;

  if (typeof error === 'object') {
    for (const key in error) {
      iterateErrorObject(error[key], errors);
    }
  } else if (Array.isArray(error)) {
    error.forEach((err) => {
      iterateErrorObject(err, errors);
    });
  } else {
    errors.push(error);
    return;
  }
}
