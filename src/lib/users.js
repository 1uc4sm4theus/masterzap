/** Available WhatsApp contexts shown by the profile switcher. */
export const APP_USERS = [
  {
    id: 'daniel-vorcaro',
    name: 'Daniel Vorcaro',
    owner: 'DV',
    avatar: '/assets/avatar-dv.jpg',
  },
  {
    id: 'jair-bolsonaro',
    name: 'Jair Bolsonaro',
    owner: 'Jair Bolsonaro',
    conversationIds: ['meyer-nigri'],
  },
];

/** Return only the conversations visible from a user's phone. */
export function conversationsForUser(user, conversations) {
  if (user.conversationIds) {
    const allowed = new Set(user.conversationIds);
    return conversations.filter(conversation => allowed.has(conversation.id));
  }
  return conversations.filter(conversation => (conversation.owner || 'DV') === user.owner);
}
