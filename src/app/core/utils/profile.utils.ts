import { ElementRef } from '@angular/core';
import { Profile } from '../models/profile.type';
import { PermissionType } from '../models/permission.type';
import {
  ModuleRequiredPermissionType,
  RequiredPermissionType,
} from '../models/required-permission.type';

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

function moveOneUlBackward(
  ul: string[],
  ulLevel: number[],
  permissionsAsArrayOfToken: string[]
) {
  while (ulLevel[ulLevel.length - 1] != permissionsAsArrayOfToken.length) {
    ul.push(`</ol>`);
    ulLevel.pop();
  }
}
function liInput(val: string, id: string) {
  return `<li>
          <div class="form-check">
            <input
              type="checkbox"
              id="${id}"
              class="form-check-input"
            />
            <label
              class="form-check-label"
              for="${id}"
              >${val}</label
            >
          </div>
        </li>`;
}

export function buildProfileUI(permissionsAsArrayOfTokens: string[][]) {
  let ul = [];
  let previous = 0;
  let ulLevel = [];
  for (let permissionsAsArrayOfToken of permissionsAsArrayOfTokens) {
    let val = permissionsAsArrayOfToken[permissionsAsArrayOfToken.length - 1];
    let isAddUlLevel = permissionsAsArrayOfToken.length > previous;
    let isAddLIInTheSameLevel = permissionsAsArrayOfToken.length == previous;

    if (isAddUlLevel) {
      ulLevel.push(permissionsAsArrayOfToken.length);
      ul.push(`<ol style="list-style-type:disclosure-closed">`);
      ul.push(liInput(val, permissionsAsArrayOfToken.join('|')));
    } else if (isAddLIInTheSameLevel) {
      ul.push(liInput(val, permissionsAsArrayOfToken.join('|')));
    } else {
      moveOneUlBackward(ul, ulLevel, permissionsAsArrayOfToken);
      ul.push(`</ol>`);
      ul.push(`<ol style="list-style-type:disclosure-closed">`);
      ul.push(liInput(val, permissionsAsArrayOfToken.join('|')));
    }

    previous = permissionsAsArrayOfToken.length;
  }
  for (let i = 0; i < ulLevel.length; i++) {
    ul.push(`</ol>`);
  }
  return ul;
}

export function GetValueBasedProfile(containerElement: ElementRef) {
  let valueBasedProfile: any = {};
  const els = containerElement.nativeElement.querySelectorAll(
    'input[type="checkbox"]'
  );
  els.forEach((el: any) => {
    if (el.checked) {
      let profileValues = el.id.split('-');
      if (valueBasedProfile[profileValues[0]] == undefined)
        valueBasedProfile[profileValues[0]] = {};

      if (valueBasedProfile[profileValues[0]][profileValues[1]] == undefined)
        valueBasedProfile[profileValues[0]][profileValues[1]] = {};

      if (
        valueBasedProfile[profileValues[0]][profileValues[1]][
          profileValues[2]
        ] == undefined
      )
        valueBasedProfile[profileValues[0]][profileValues[1]][
          profileValues[2]
        ] = {};

      if (
        valueBasedProfile[profileValues[0]][profileValues[1]][profileValues[2]][
          profileValues[3]
        ] == undefined
      )
        valueBasedProfile[profileValues[0]][profileValues[1]][profileValues[2]][
          profileValues[3]
        ] = {};
    }
  });

  return valueBasedProfile;
}

export function buildNewProfile(valueBasedProfile: any) {
  let newProfile: any[] = [];
  let apps = Object.keys(valueBasedProfile);
  for (let app_index = 0; app_index < apps.length; app_index++) {
    newProfile.push({ app: apps[app_index], modules: [] });

    let modules = Object.keys(valueBasedProfile[apps[app_index]]);
    for (let module_index = 0; module_index < modules.length; module_index++) {
      newProfile[app_index].modules.push({
        id: modules[module_index],
        components: [],
      });

      let components = Object.keys(
        valueBasedProfile[apps[app_index]][modules[module_index]]
      );
      for (
        let component_index = 0;
        component_index < components.length;
        component_index++
      ) {
        newProfile[app_index].modules[module_index].components.push({
          id: components[component_index],
          permissions: [],
        });

        let permissions = Object.keys(
          valueBasedProfile[apps[app_index]][modules[module_index]][
            components[component_index]
          ]
        );
        for (
          let permission_index = 0;
          permission_index < permissions.length;
          permission_index++
        ) {
          newProfile[app_index].modules[module_index].components[
            component_index
          ].permissions.push(permissions[permission_index]);
        }
      }
    }
  }
  return newProfile;
}

export function GetProfileAsPermissions(profile: string) {
  let jsonProfile: Profile[] = JSON.parse(profile);
  let permissions: string[] = [];
  for (let app of jsonProfile) {
    for (let module of app.modules) {
      for (let component of module.components) {
        for (let permission of component.permissions) {
          permissions.push(
            `${app.app}-${module.id}-${component.id}-${permission}`
          );
        }
      }
    }
  }

  return permissions;
}

export function setSelectedPermission(
  containerElement: ElementRef,
  permissions: string[]
) {
  const els = containerElement.nativeElement.querySelectorAll(
    'input[type="checkbox"]'
  );

  els.forEach((el: any) => {
    el.checked = permissions.includes(el.id);
  });
}

export function hasPermission(
  permissions: PermissionType,
  app: string,
  module: string,
  component: string,
  permission: string
) {
  return permissions[app][module][component][permission];
}

export function hasPermissionByRequiredPermission(
  permissions: PermissionType,
  requiredPermissions: RequiredPermissionType,
  app: string,
  module: string,
  component: string
) {
  Object.keys(requiredPermissions).forEach((requiredPermission) => {
    requiredPermissions[requiredPermission].valid =
      permissions[app][module][component][
        requiredPermissions[requiredPermission].expected
      ];
  });
}

export function hasPermissionByRequiredPermissionForModules(
  permissions: PermissionType,
  requiredPermissions: ModuleRequiredPermissionType,
  app: string
) {
  Object.keys(requiredPermissions).forEach((module) => {
    Object.keys(requiredPermissions[module]).forEach((component) => {
      Object.keys(requiredPermissions[module][component]).forEach(
        (requiredPermission) => {
          try {
            requiredPermissions[module][component][requiredPermission].valid =
              permissions[app][module][component][
                requiredPermissions[module][component][
                  requiredPermission
                ].expected
              ];
          } catch (error) {
            console.log(module);
            console.log(component);
            console.log(requiredPermission);
          }
        }
      );
    });
  });
}

export function validateIfCan(
  permissions: RequiredPermissionType,
  permission: string
) {
  return permissions[permission] && permissions[permission].valid;
}
