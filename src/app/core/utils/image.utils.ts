export function validateImage(
  photo: File,
  maxSizeInMB = 10,
  validExtensions = ['image/jpeg', 'image/jpeg', 'image/png']
) {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  if (!validExtensions.includes(photo.type)) {
    return 'Solo admite imágenes .jpg, .jpeg, .png.';
  }

  if (photo.size > maxSizeInBytes) {
    return `El tamaño excede el límite ${maxSizeInMB} MB.`;
  }
  return null;
}

export function validateFiles(
  files: FileList,
  maxSizeInMB = 10,
  validFileTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ]
) {
  if (files && files.length > 0) {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

    for (let i = 0; i < files.length; i++) {
      if (!validFileTypes.includes(files[i].type)) {
        return 'Solo adminte PDF, Excel, e imágenes .jpg, .jpeg, .png.';
      }

      if (files[i].size > maxSizeInBytes) {
        return `El tamaño excede el límite ${maxSizeInMB} MB.`;
      }
    }
  }
  return null;
}
