export function getCompletionItems(user) {
  if (!user) return [];

  const skills = user.skills || [];

  const academic = user.academicDetails || {};
  const graduation = academic.graduation || {};

  const projects = user.projects || [];

  return [
    {
      label: "Basic Info",
      done: !!(user.firstName && user.lastName && user.phone),
    },
    {
      label: "Academic Details",
      done: !!(graduation.branch && graduation.cgpa),
    },
    {
      label: "Skills",
      done: skills.length > 0,
    },
    {
      label: "Projects",
      done: projects.length > 0,
    },
    {
      label: "Resume Upload",
      done: !!user.resume,
    },
  ];
}

export function calculateProfileCompletion(user) {
  const completionItems = getCompletionItems(user);

  if (completionItems.length === 0) return 0;

  const doneCount = completionItems.filter((item) => item.done).length;

  return Math.round((doneCount / completionItems.length) * 100);
}
