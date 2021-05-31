/**
 * parse HTTP Link header
 * e.g. <https://api.github.com/repositories/8514/issues?page=2>; rel="next", <https://api.github.com/repositories/8514/issues?page=30>; rel="last"
 * 
 * Syntax:
 *   Link: < uri-reference >; param1=value1; param2="value2"
 *   ref. https://developer.mozilla.org/ja/docs/Web/HTTP/Headers/Link
 * 
 * Implementation reference:
 *   https://github.com/eclipse/egit-github/blob/master/org.eclipse.egit.github.core/src/org/eclipse/egit/github/core/client/PageLinks.java
 */
export type RelLinks = {
  first?: string;
  next?: string;
  prev?: string;
  last?: string;
};

const parseLinkHeader = (headerString: string): RelLinks => {
  const linkStrings = headerString.split(',');
  const links = linkStrings.reduce((prev, linkString) => {
    const uriAndParams = linkString.split(';');
    if (uriAndParams.length < 2) {
      return prev; // too few params
    }

    const uriString = uriAndParams[0].trim();
    if (!uriString.startsWith('<') || !uriString.endsWith('>')) {
      return prev; // unexpected link
    }
    const uri = uriString.slice(1, uriString.length-1);

    const rel = uriAndParams.slice(1).reduce((prev, current) => {
      const fragments = current.trim().split('=');
      if (!Array.isArray(fragments) || fragments.length < 2) {
        return prev;
      }

      const key = fragments[0];
      if (key !== 'rel') {
        return prev;
      }

      let value = fragments.slice(1).join('=');
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, value.length-1);
      }

      return value;
    }, "");

    switch (rel) {
      case 'first':
        prev.first = uri;
        break;
      case 'next':
        prev.next = uri;
        break;
      case 'prev':
        prev.prev = uri;
        break;
      case 'last':
        prev.last = uri;
        break;
    }

    return prev;
  }, {} as RelLinks);

  return links;
}

export default parseLinkHeader;
