const checkEligibility = (student, drive, applicationDetails = {}) => {
  const studentCgpa = Number(
    applicationDetails.cgpa ??
      student.cgpa ??
      student.academicDetails?.graduation?.cgpa ??
      0,
  );
  const studentBacklogs = Number(
    applicationDetails.backlogs ??
      student.backlogs ??
      student.activeBacklogs ??
      0,
  );
  const studentBranch =
    applicationDetails.branch ??
    student.branch ??
    student.academicDetails?.graduation?.branch ??
    "";
  const minimumCGPA =
    drive.minimumCGPA > 0 ? drive.minimumCGPA : (drive.cgpa ?? 0);
  const maximumBacklogs =
    drive.maximumBacklogs > 0 ? drive.maximumBacklogs : drive.backlog ? 1 : 0;
  const eligibleBranches = drive.eligibleBranches?.length
    ? drive.eligibleBranches
    : drive.allowedBranches?.length
      ? drive.allowedBranches
      : drive.branches;

  // CGPA
  if (studentCgpa < minimumCGPA) {
    return {
      eligible: false,
      reason: `Minimum CGPA required is ${minimumCGPA}`,
    };
  }

  // Backlogs
  if (studentBacklogs > maximumBacklogs) {
    return {
      eligible: false,
      reason: `Maximum allowed backlogs are ${maximumBacklogs}`,
    };
  }

  // Branch
  if (eligibleBranches && eligibleBranches.length > 0) {
    const normalizeBranch = (branch) => {
      const normalized = branch.toLowerCase().replace(/[^a-z0-9]/g, "");
      const aliases = {
        cse: "computerscienceengineering",
        cs: "computerscienceengineering",
        ece: "electronicscommunication",
        it: "informationtechnology",
        ee: "electricalengineering",
        me: "mechanicalengineering",
        ce: "civilengineering",
      };
      return aliases[normalized] || normalized;
    };

    const normalizedStudentBranch = normalizeBranch(studentBranch);

    const branches = eligibleBranches.map(normalizeBranch);

    if (!branches.includes(normalizedStudentBranch)) {
      return {
        eligible: false,
        reason: "Your branch is not eligible",
      };
    }
  }

  return {
    eligible: true,
    reason: "Student is eligible",
  };
};

module.exports = checkEligibility;
