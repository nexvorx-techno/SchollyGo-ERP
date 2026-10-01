import { cookies } from 'next/headers';

/**
 * Retrieves the current logged-in user and determines their class access restrictions.
 * 
 * @param {object} db - Database connection instance
 * @returns {object} {
 *    currentUser: object | null,
 *    isRestricted: boolean, // If true, filter by allowedClasses
 *    allowedClasses: object | null // JSON mapping of { "ClassName": ["SecA", "SecB"] }
 * }
 */
export async function getAccessibleClasses(db) {
  const cookieStore = await cookies();
  const session = cookieStore.get('auth_session');
  
  let currentUser = null;
  if (session?.value) {
    currentUser = await db.get('SELECT * FROM users WHERE username = ?', [session.value]);
  }

  if (!currentUser) {
    return { currentUser: null, isRestricted: false, allowedClasses: null };
  }

  if (currentUser.role === 'Super Admin') {
    return { currentUser, isRestricted: false, allowedClasses: null };
  }

  if (currentUser.role === 'Admin' && (!currentUser.assigned_classes || currentUser.assigned_classes === '{}' || currentUser.assigned_classes === '{"classes":[],"sections":[]}')) {
    // Legacy Admin with full default access
    return { currentUser, isRestricted: false, allowedClasses: null };
  }

  // Parse assigned classes
  let allowedClasses = {};
  if (currentUser.assigned_classes) {
    try {
      allowedClasses = JSON.parse(currentUser.assigned_classes);
    } catch (e) {
      allowedClasses = {};
    }
  }

  return { currentUser, isRestricted: true, allowedClasses };
}

/**
 * Helper to check if a user has access to a specific class and optionally a section.
 */
export function hasClassAccess(rbacData, className, sectionName = null) {
  if (!rbacData.isRestricted) return true;
  
  const sections = rbacData.allowedClasses[className];
  if (!sections) return false;
  
  if (sectionName) {
    return sections.includes(sectionName);
  }
  
  return true;
}
