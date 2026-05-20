// Mock seguro do Supabase para evitar erros de compilação e carregamento.
// Toda a aplicação foi migrada com sucesso para Local-First (100% Offline).
// Não há mais necessidade de configurar variáveis de ambiente no Vercel/Hostinger!

export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null } }),
    onAuthStateChange: () => ({
      data: {
        subscription: {
          unsubscribe: () => {}
        }
      }
    }),
    signOut: async () => {
      console.log('[Supabase Mock] signOut chamado');
    },
  },
  from: () => ({
    select: () => ({
      order: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
          maybeSingle: async () => ({ data: null, error: null }),
        }),
      }),
    }),
    delete: () => ({
      eq: () => ({
        select: async () => ({ data: [], error: null })
      })
    })
  }),
  channel: () => ({
    on: () => ({
      subscribe: () => ({})
    })
  }),
  removeChannel: () => {}
} as any
