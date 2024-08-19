export function processError(error: any) {
  const errors: string[] = [];
  iterateErrorObject(error, errors);
  return errors;
}

function iterateErrorObject(error: any, errors: string[] = []) {
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
