import parseLinkHeader from '../../src/utils/parseLinkHeader';

describe('parseLinkHeader', () => {
  it('should parse Link header correctly', () => {
    const links = parseLinkHeader('<https://api.github.com/repositories/8514/issues?page=2>; rel="next", <https://api.github.com/repositories/8514/issues?page=30>; rel="last"');
    expect(links).toStrictEqual({
      next: 'https://api.github.com/repositories/8514/issues?page=2',
      last: 'https://api.github.com/repositories/8514/issues?page=30',
    });
  });
});
