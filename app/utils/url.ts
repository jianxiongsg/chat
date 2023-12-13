import { HomePath, UserPath } from "../constant";

export function toPath(
  baseUrl: string,
  route: string,
  params?: { [key: string]: any },
) {
  const url = new URL(route, baseUrl);
  if (params) {
    for (let key in params) {
      url.searchParams.append(key, params[key]);
    }
  }
  return url;
}
export function isEnumValue(enumType: any, value: any): boolean {
  return Object.values(enumType).includes(value);
}
export function routePath(path: UserPath | HomePath) {
  if (isEnumValue(UserPath, path)) {
    return `/user/${path}`;
  }
  if (isEnumValue(HomePath, path)) {
    return `/home/${path}`;
  }
  return path;
}
