import {
    AccountRole,
    downgradeRoleToNonSigner,
    downgradeRoleToReadonly,
    isSignerRole,
    isWritableRole,
    mergeRoles,
    upgradeRoleToSigner,
    upgradeRoleToWritable,
} from '../roles';

describe('downgradeRoleToNonSigner', () => {
    it.each`
        role                 | expected
        ${'READONLY'}        | ${'READONLY'}
        ${'WRITABLE'}        | ${'WRITABLE'}
        ${'READONLY_SIGNER'} | ${'READONLY'}
        ${'WRITABLE_SIGNER'} | ${'WRITABLE'}
    `(
        'downgrades $role to $expected',
        ({ role, expected }: { expected: keyof typeof AccountRole; role: keyof typeof AccountRole }) => {
            expect(downgradeRoleToNonSigner(AccountRole[role])).toBe(AccountRole[expected]);
        },
    );
});

describe('downgradeRoleToReadonly', () => {
    it.each`
        role                 | expected
        ${'READONLY'}        | ${'READONLY'}
        ${'WRITABLE'}        | ${'READONLY'}
        ${'READONLY_SIGNER'} | ${'READONLY_SIGNER'}
        ${'WRITABLE_SIGNER'} | ${'READONLY_SIGNER'}
    `(
        'downgrades $role to $expected',
        ({ role, expected }: { expected: keyof typeof AccountRole; role: keyof typeof AccountRole }) => {
            expect(downgradeRoleToReadonly(AccountRole[role])).toBe(AccountRole[expected]);
        },
    );
});

describe('isSignerRole', () => {
    it.each([AccountRole.READONLY, AccountRole.WRITABLE])('returns `false` for AccountRole.$role', role => {
        expect(isSignerRole(role)).toBe(false);
    });
    it.each([AccountRole.READONLY_SIGNER, AccountRole.WRITABLE_SIGNER])(
        'returns `true` for AccountRole.$role',
        role => {
            expect(isSignerRole(role)).toBe(true);
        },
    );
});

describe('isWritableRole', () => {
    it.each([AccountRole.READONLY, AccountRole.READONLY_SIGNER])('returns `false` for AccountRole.$role', role => {
        expect(isWritableRole(role)).toBe(false);
    });
    it.each([AccountRole.WRITABLE, AccountRole.WRITABLE_SIGNER])('returns `true` for AccountRole.$role', role => {
        expect(isWritableRole(role)).toBe(true);
    });
});

describe('mergeRoles', () => {
    it.each`
        aRole                | bRole                | expected
        ${'READONLY'}        | ${'READONLY'}        | ${'READONLY'}
        ${'READONLY'}        | ${'WRITABLE'}        | ${'WRITABLE'}
        ${'READONLY'}        | ${'READONLY_SIGNER'} | ${'READONLY_SIGNER'}
        ${'READONLY'}        | ${'WRITABLE_SIGNER'} | ${'WRITABLE_SIGNER'}
        ${'WRITABLE'}        | ${'READONLY'}        | ${'WRITABLE'}
        ${'WRITABLE'}        | ${'WRITABLE'}        | ${'WRITABLE'}
        ${'WRITABLE'}        | ${'READONLY_SIGNER'} | ${'WRITABLE_SIGNER'}
        ${'WRITABLE'}        | ${'WRITABLE_SIGNER'} | ${'WRITABLE_SIGNER'}
        ${'READONLY_SIGNER'} | ${'READONLY'}        | ${'READONLY_SIGNER'}
        ${'READONLY_SIGNER'} | ${'WRITABLE'}        | ${'WRITABLE_SIGNER'}
        ${'READONLY_SIGNER'} | ${'READONLY_SIGNER'} | ${'READONLY_SIGNER'}
        ${'READONLY_SIGNER'} | ${'WRITABLE_SIGNER'} | ${'WRITABLE_SIGNER'}
        ${'WRITABLE_SIGNER'} | ${'READONLY'}        | ${'WRITABLE_SIGNER'}
        ${'WRITABLE_SIGNER'} | ${'WRITABLE'}        | ${'WRITABLE_SIGNER'}
        ${'WRITABLE_SIGNER'} | ${'READONLY_SIGNER'} | ${'WRITABLE_SIGNER'}
        ${'WRITABLE_SIGNER'} | ${'WRITABLE_SIGNER'} | ${'WRITABLE_SIGNER'}
    `(
        'returns $expected when given $aRole and $bRole',
        ({
            aRole,
            bRole,
            expected,
        }: {
            aRole: keyof typeof AccountRole;
            bRole: keyof typeof AccountRole;
            expected: keyof typeof AccountRole;
        }) => {
            expect(mergeRoles(AccountRole[aRole], AccountRole[bRole])).toBe(AccountRole[expected]);
        },
    );
});

describe('upgradeRoleToSigner', () => {
    it.each`
        role                 | expected
        ${'READONLY'}        | ${'READONLY_SIGNER'}
        ${'WRITABLE'}        | ${'WRITABLE_SIGNER'}
        ${'READONLY_SIGNER'} | ${'READONLY_SIGNER'}
        ${'WRITABLE_SIGNER'} | ${'WRITABLE_SIGNER'}
    `(
        'upgrades $role to $expected',
        ({ role, expected }: { expected: keyof typeof AccountRole; role: keyof typeof AccountRole }) => {
            expect(upgradeRoleToSigner(AccountRole[role])).toBe(AccountRole[expected]);
        },
    );
});

describe('upgradeRoleToWritable', () => {
    it.each`
        role                 | expected
        ${'READONLY'}        | ${'WRITABLE'}
        ${'WRITABLE'}        | ${'WRITABLE'}
        ${'READONLY_SIGNER'} | ${'WRITABLE_SIGNER'}
        ${'WRITABLE_SIGNER'} | ${'WRITABLE_SIGNER'}
    `(
        'upgrades $role to $expected',
        ({ role, expected }: { expected: keyof typeof AccountRole; role: keyof typeof AccountRole }) => {
            expect(upgradeRoleToWritable(AccountRole[role])).toBe(AccountRole[expected]);
        },
    );
});
