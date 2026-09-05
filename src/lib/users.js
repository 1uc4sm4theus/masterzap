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
    avatar: '/assets/avatar-jair-bolsonaro.webp',
    conversationIds: ['meyer-nigri', 'jair-bolsonaro', 'silas-malafaia', 'eduardo-bolsonaro'],
  },
  {
    id: 'lula',
    name: 'Lula',
    owner: 'Lula',
    avatar: '/assets/avatar-lula.webp',
    conversationIds: ['dilma-rousseff', 'jaques-wagner', 'lindbergh-farias', 'roberto-teixeira', 'lurian-lula-da-silva'],
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
