import { describe, expect, it } from 'vitest';
import { Gender } from '../enums';
import { KENYA_COUNTIES } from '../constants';
import { updateProfileSchema } from './user';

describe('updateProfileSchema', () => {
  it('allows a partial update', () => {
    expect(updateProfileSchema.parse({})).toEqual({});
    expect(updateProfileSchema.parse({ firstName: '  Faith ' })).toEqual({ firstName: 'Faith' });
  });

  it('accepts a full profile', () => {
    expect(
      updateProfileSchema.parse({
        firstName: 'Faith',
        lastName: 'Cheruiyot',
        locale: 'sw',
        county: 'Uasin Gishu',
        gender: Gender.FEMALE,
        dateOfBirth: '1996-04-18',
        bio: '  Living in Eldoret.  ',
      }),
    ).toEqual({
      firstName: 'Faith',
      lastName: 'Cheruiyot',
      locale: 'sw',
      county: 'Uasin Gishu',
      gender: Gender.FEMALE,
      dateOfBirth: '1996-04-18',
      bio: 'Living in Eldoret.',
    });
  });

  it('accepts every supported county', () => {
    for (const county of KENYA_COUNTIES) {
      expect(updateProfileSchema.safeParse({ county }).success).toBe(true);
    }
  });

  it.each([
    [{ county: 'Lagos' }, 'county outside the supported list'],
    [{ dateOfBirth: '18-04-1996' }, 'non-ISO date of birth'],
    [{ gender: 'UNKNOWN' }, 'unknown gender'],
    [{ firstName: '   ' }, 'blank first name'],
    [{ bio: 'x'.repeat(2001) }, 'bio over 2000 characters'],
  ])('rejects %o (%s)', (input) => {
    expect(updateProfileSchema.safeParse(input).success).toBe(false);
  });
});
