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
