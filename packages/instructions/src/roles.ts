/**
 * Quick primer on bitwise operations: https://stackoverflow.com/a/1436448/802047
 */

export enum AccountRole {
    // Bitflag guide: is signer ⌄⌄ is writable
    WRITABLE_SIGNER = /* 3 */ 0b11, // prettier-ignore
    READONLY_SIGNER = /* 2 */ 0b10, // prettier-ignore
    WRITABLE =        /* 1 */ 0b01, // prettier-ignore
    READONLY =        /* 0 */ 0b00, // prettier-ignore
}

const IS_SIGNER_BITMASK = 0b10;
const IS_WRITABLE_BITMASK = 0b01;

export function downgradeRoleToNonSigner(role: AccountRole.READONLY_SIGNER): AccountRole.READONLY;
export function downgradeRoleToNonSigner(role: AccountRole.WRITABLE_SIGNER): AccountRole.WRITABLE;
export function downgradeRoleToNonSigner(role: AccountRole): AccountRole;
export function downgradeRoleToNonSigner(role: AccountRole): AccountRole {
    return role & ~IS_SIGNER_BITMASK;
}

export function downgradeRoleToReadonly(role: AccountRole.WRITABLE): AccountRole.READONLY;
export function downgradeRoleToReadonly(role: AccountRole.WRITABLE_SIGNER): AccountRole.READONLY_SIGNER;
export function downgradeRoleToReadonly(role: AccountRole): AccountRole;
export function downgradeRoleToReadonly(role: AccountRole): AccountRole {
    return role & ~IS_WRITABLE_BITMASK;
}

export function isSignerRole(role: AccountRole): role is AccountRole.READONLY_SIGNER | AccountRole.WRITABLE_SIGNER {
    return role >= AccountRole.READONLY_SIGNER;
}

export function isWritableRole(role: AccountRole): role is AccountRole.WRITABLE | AccountRole.WRITABLE_SIGNER {
    return (role & IS_WRITABLE_BITMASK) !== 0;
}

export function mergeRoles(roleA: AccountRole.WRITABLE, roleB: AccountRole.READONLY_SIGNER): AccountRole.WRITABLE_SIGNER; // prettier-ignore
export function mergeRoles(roleA: AccountRole.READONLY_SIGNER, roleB: AccountRole.WRITABLE): AccountRole.WRITABLE_SIGNER; // prettier-ignore
export function mergeRoles(roleA: AccountRole, roleB: AccountRole.WRITABLE_SIGNER): AccountRole.WRITABLE_SIGNER; // prettier-ignore
export function mergeRoles(roleA: AccountRole.WRITABLE_SIGNER, roleB: AccountRole): AccountRole.WRITABLE_SIGNER; // prettier-ignore
export function mergeRoles(roleA: AccountRole, roleB: AccountRole.READONLY_SIGNER): AccountRole.READONLY_SIGNER; // prettier-ignore
export function mergeRoles(roleA: AccountRole.READONLY_SIGNER, roleB: AccountRole): AccountRole.READONLY_SIGNER; // prettier-ignore
export function mergeRoles(roleA: AccountRole, roleB: AccountRole.WRITABLE): AccountRole.WRITABLE; // prettier-ignore
export function mergeRoles(roleA: AccountRole.WRITABLE, roleB: AccountRole): AccountRole.WRITABLE; // prettier-ignore
export function mergeRoles(roleA: AccountRole.READONLY, roleB: AccountRole.READONLY): AccountRole.READONLY; // prettier-ignore
export function mergeRoles(roleA: AccountRole, roleB: AccountRole): AccountRole; // prettier-ignore
export function mergeRoles(roleA: AccountRole, roleB: AccountRole): AccountRole {
    return roleA | roleB;
}

export function upgradeRoleToSigner(role: AccountRole.READONLY): AccountRole.READONLY_SIGNER;
export function upgradeRoleToSigner(role: AccountRole.WRITABLE): AccountRole.WRITABLE_SIGNER;
export function upgradeRoleToSigner(role: AccountRole): AccountRole;
export function upgradeRoleToSigner(role: AccountRole): AccountRole {
    return role | IS_SIGNER_BITMASK;
}

export function upgradeRoleToWritable(role: AccountRole.READONLY): AccountRole.WRITABLE;
export function upgradeRoleToWritable(role: AccountRole.READONLY_SIGNER): AccountRole.WRITABLE_SIGNER;
export function upgradeRoleToWritable(role: AccountRole): AccountRole;
export function upgradeRoleToWritable(role: AccountRole): AccountRole {
    return role | IS_WRITABLE_BITMASK;
}
