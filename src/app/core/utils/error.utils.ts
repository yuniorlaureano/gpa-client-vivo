export function processError(
  error: any,
  defaultError: string = 'Error desconocido'
) {
  if (error?.status == 401 && error?.error == null) {
    return ['Debe autenticarse'];
  }
  if (!error) {
    return [defaultError];
  }
  const errors: string[] = [];
  if (error) {
    let err = null;
    try {
      err = JSON.parse(JSON.stringify(error));
    } catch (e) {}
    iterateErrorObject(err, errors);
  }

  return errors;
}

function iterateErrorObject(error: any, errors: string[] = [], cumulative = 0) {
  if (cumulative > 10) {
    return;
  }
  if (!error || errors.length > 10 || error.hasOwnProperty('XMLHttpRequest')) {
    return;
  }

  if (error.hasOwnProperty('errors')) {
    error = error.errors;
  }

  if (typeof error === 'object') {
    for (const key in error) {
      try {
        if (cumulative <= 10) {
          iterateErrorObject(error[key], errors, cumulative + 1);
        }
      } catch (e) {
        return;
      }
    }
  } else if (Array.isArray(error)) {
    error.forEach((err) => {
      if (cumulative <= 10) {
        iterateErrorObject(err, errors, cumulative + 1);
      }
    });
  } else {
    let strErr = error?.toString();
    if (
      strErr != '<root>' &&
      strErr != 'root' &&
      strErr != 'error' &&
      strErr != 'true' &&
      strErr != 'false' &&
      strErr != null &&
      strErr != undefined &&
      strErr != '0' &&
      strErr.length > 15 &&
      typeof error === 'string'
    ) {
      errors.push(error);
    }

    return;
  }
}
