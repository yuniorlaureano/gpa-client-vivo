export function processProfile(
  profile: any,
  path: string[] = [],
  permissions: string[] = []
) {
  if (Array.isArray(profile)) {
    let index = 0;
    for (let item of profile) {
      path.push('[' + index + ']');
      processProfile(item, path, permissions);
      index++;
      path.pop();
    }
  } else if (typeof profile === 'object') {
    for (let item of Object.keys(profile)) {
      path.push(item);
      processProfile(profile[item], path, permissions);
      path.pop();
    }
  } else {
    permissions.push(`${path.join('.')}=${profile}`);
  }
}

export function splitPermissionPathsIntoArrayOfTokens(
  permissionsAsPaths: string[]
) {
  let pathsAsToken = [];
  for (let permissionsAsPath of permissionsAsPaths) {
    let path = permissionsAsPath.split('=');
    pathsAsToken.push([...path[0].split('.'), path[1]]);
  }

  return pathsAsToken;
}

export function buildProfileObjectFromArrayOfToken(
  profile: any,
  tokenArray: any[],
  index: number = 0
) {
  let len = tokenArray.length;
  let isLastToken = index == len - 1;
  let isTokenArray = index < len && tokenArray[index][0] == '[';
  let isObjectToken = index < len;

  if (isLastToken) {
    profile['value'] = tokenArray[index];
  } else if (isTokenArray) {
    let property = tokenArray[index].substr(1, tokenArray[index].length - 2);
    if (!profile[property]) {
      profile[property] = {};
    }
    buildProfileObjectFromArrayOfToken(
      profile[property],
      tokenArray,
      index + 1
    );
  } else if (isObjectToken) {
    let property = tokenArray[index];
    if (!profile[property]) {
      profile[property] = {};
    }
    buildProfileObjectFromArrayOfToken(
      profile[property],
      tokenArray,
      index + 1
    );
  }
}
