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
  if (!error || errors.length > 10 || error.hasOwnProperty('XMLHttpRequest'))
    return;

  if (error.hasOwnProperty('errors')) {
    error = error.errors;
  }

  if (typeof error === 'object') {
    for (const key in error) {
      try {
        iterateErrorObject(error[key], errors);
      } catch (e) {
        return;
      }
    }
  } else if (Array.isArray(error)) {
    error.forEach((err) => {
      iterateErrorObject(err, errors);
    });
  } else {
    if (
      error !== '<root>' &&
      error !== 'root' &&
      error !== 'error' &&
      error !== true &&
      error !== false &&
      error !== null &&
      error !== undefined &&
      error !== 0
    ) {
      console.log(error);
      errors.push(error);
    }

    return;
  }
}
