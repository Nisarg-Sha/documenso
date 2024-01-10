import { TeamMemberRole } from '@documenso/prisma/client';

export const TEAM_MEMBER_ROLE_MAP: Record<keyof typeof TeamMemberRole, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  MEMBER: 'Member',
};

export const TEAM_MEMBER_ROLE_PERMISSIONS_MAP = {
  /**
   * Includes permissions to:
   * - Manage team members
   * - Manage team settings, changing name, url, etc.
   */
  MANAGE_TEAM: [TeamMemberRole.ADMIN, TeamMemberRole.MANAGER],
  DELETE_TEAM_TRANSFER_REQUEST: [TeamMemberRole.ADMIN],
} satisfies Record<string, TeamMemberRole[]>;

/**
 * A hierarchy of team member roles to determine which role has higher permission than another.
 */
export const TEAM_MEMBER_ROLE_HIERARCHY = {
  [TeamMemberRole.ADMIN]: [TeamMemberRole.ADMIN, TeamMemberRole.MANAGER, TeamMemberRole.MEMBER],
  [TeamMemberRole.MANAGER]: [TeamMemberRole.MANAGER, TeamMemberRole.MEMBER],
  [TeamMemberRole.MEMBER]: [TeamMemberRole.MEMBER],
} satisfies Record<TeamMemberRole, TeamMemberRole[]>;

export const PROTECTED_TEAM_URLS = [
  '403',
  '404',
  '500',
  '502',
  '503',
  '504',
  'about',
  'account',
  'admin',
  'administrator',
  'api',
  'app',
  'archive',
  'auth',
  'backup',
  'config',
  'configure',
  'contact',
  'contact-us',
  'copyright',
  'crime',
  'criminal',
  'dashboard',
  'docs',
  'documenso',
  'documentation',
  'document',
  'documents',
  'error',
  'exploit',
  'exploitation',
  'exploiter',
  'feedback',
  'finance',
  'forgot-password',
  'fraud',
  'fraudulent',
  'hack',
  'hacker',
  'harassment',
  'help',
  'helpdesk',
  'illegal',
  'internal',
  'legal',
  'login',
  'logout',
  'maintenance',
  'malware',
  'newsletter',
  'policy',
  'privacy',
  'profile',
  'public',
  'reset-password',
  'scam',
  'scammer',
  'settings',
  'setup',
  'sign',
  'signin',
  'signout',
  'signup',
  'spam',
  'support',
  'system',
  'team',
  'terms',
  'virus',
  'webhook',
];

/**
 * Determines whether a team member can execute a given action.
 *
 * @param action The action the user is trying to execute.
 * @param role The current role of the user.
 * @returns Whether the user can execute the action.
 */
export const canExecuteTeamAction = (
  action: keyof typeof TEAM_MEMBER_ROLE_PERMISSIONS_MAP,
  role: keyof typeof TEAM_MEMBER_ROLE_MAP,
) => {
  return TEAM_MEMBER_ROLE_PERMISSIONS_MAP[action].some((i) => i === role);
};

/**
 * Compares the provided `currentUserRole` with the provided `roleToCheck` to determine
 * whether the `currentUserRole` has permission to modify the `roleToCheck`.
 *
 * @param currentUserRole Role of the current user
 * @param roleToCheck Role of another user to see if the current user can modify
 * @returns True if the current user can modify the other user, false otherwise
 */
export const isTeamRoleWithinUserHierarchy = (
  currentUserRole: keyof typeof TEAM_MEMBER_ROLE_MAP,
  roleToCheck: keyof typeof TEAM_MEMBER_ROLE_MAP,
) => {
  return TEAM_MEMBER_ROLE_HIERARCHY[currentUserRole].some((i) => i === roleToCheck);
};
