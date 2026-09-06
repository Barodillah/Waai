export const getPersonaAvatar = (name) => {
  if (!name) return 'https://api.dicebear.com/9.x/micah/svg?seed=Unknown';
  return `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(name)}`;
};

export const getModelAvatar = (name) => {
  if (!name) return 'https://robohash.org/Unknown.png?set=set1';
  return `https://robohash.org/${encodeURIComponent(name)}.png?set=set1`;
};

export const getGroupAvatar = (id) => {
  if (!id) return 'https://api.dicebear.com/9.x/bottts/svg?seed=group';
  return `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(id)}`;
};

export const getDefaultAiAvatar = () => {
  return 'https://api.dicebear.com/9.x/bottts/svg?seed=ai';
};
