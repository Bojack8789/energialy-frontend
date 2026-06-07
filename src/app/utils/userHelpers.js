// Helper function to get company ID from user data in various possible structures
export const getCompanyId = (userData) => {
  if (!userData) return null;
  
  // Try all possible locations where the company ID might be stored
  const possiblePaths = [
    userData?.company?.id,
    userData?.CompanyId,
    userData?.companyId,
    userData?.Company?.id,
    userData?.user?.CompanyId,
    userData?.user?.companyId,
    userData?.user?.company?.id,
    userData?.id // Sometimes the user ID is the company ID
  ];
  
  for (const path of possiblePaths) {
    if (path && path !== 'undefined') {
      return path;
    }
  }
  
  console.warn('No company ID found in user data:', userData);
  return null;
};

// Helper function to get user ID from user data
export const getUserId = (userData) => {
  if (!userData) return null;
  
  const possiblePaths = [
    userData?.id,
    userData?.userId,
    userData?.user?.id,
    userData?.User?.id
  ];
  
  for (const path of possiblePaths) {
    if (path && path !== 'undefined') {
      return path;
    }
  }
  
  console.warn('No user ID found in user data:', userData);
  return null;
};
