import { createRouter, createWebHashHistory } from 'vue-router'
import RecordsPage from '@/views/RecordsPage.vue'
import StartingPage from '@/views/StartingPage.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { requiresAuth: false, title: 'Login' }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { requiresAuth: false, title: 'Register' }
    },
    {
      path: '/',
      name: 'Home',
      redirect: '/start',
      children: [
        {
          path: '/start',
          name: 'Start',
          component: StartingPage,
          meta: {
            requiresAuth: true,
            tag: 'start',
            title: 'My Collection',
          }
        },
        {
          path: '/games',
          name: 'Games',
          component: RecordsPage,
          meta: {
            requiresAuth: true,
            tag: 'games',
            title: 'Games',
            thing: 'Game',
          }
        },
        {
          path: '/tvshows',
          name: 'TVShows',
          component: RecordsPage,
          meta: {
            requiresAuth: true,
            tag: 'tvshows',
            title: 'TV Shows',
            thing: 'TV Show'
          }
        },
        {
          path: '/films',
          name: 'Films',
          component: RecordsPage,
          meta: {
            requiresAuth: true,
            tag: 'films',
            title: 'Films',
            thing: 'Film',
          }
        },
        {
          path: '/anime',
          name: 'Anime',
          component: RecordsPage,
          meta: {
            requiresAuth: true,
            tag: 'anime',
            title: 'Anime',
            thing: 'Anime'
          }
        },
        {
          path: '/manga',
          name: 'Manga',
          component: RecordsPage,
          meta: {
            requiresAuth: true,
            tag: 'manga',
            title: 'Manga',
            thing: 'Manga'
          }
        },
        {
          path: '/books',
          name: 'Books',
          component: RecordsPage,
          meta: {
            requiresAuth: true,
            tag: 'books',
            title: 'Books',
            thing: 'Book',
          }
        },
        {
          path: '/music',
          name: 'Music',
          component: RecordsPage,
          meta: {
            requiresAuth: true,
            tag: 'music',
            title: 'Music',
            thing: 'Music',
          }
        },
        {
          path: '/custom/:id',
          name: 'CustomList',
          component: () => import('@/views/CustomListPage.vue'),
          meta: {
            requiresAuth: true,
            tag: 'custom',
            title: 'Custom List',
            thing: 'Item',
            isCustom: true
          }
        },
        {
          path: '/about',
          name: 'About',
          component: () => import('@/views/AboutPage.vue'),
          meta: {
            requiresAuth: true,
            tag: 'about',
            title: 'About Listify',
          }
        },
      ]
    },
  ]
})

import { useAuthStore } from '@/stores/auth.store'
import { useRecordsStore } from '@/stores/records.store'

router.beforeEach((to, from, next) => {
  let title = 'Listify'
  if (to.meta.title && (to.meta.tag !== 'start')) {
    title = `${to.meta.title} - Listify`
  }
  // Handle dynamic tag for custom lists
  if (to.meta.isCustom && to.params.id) {
    const recordsStore = useRecordsStore()
    const list = recordsStore.getCustomList(to.params.id)
    title = list ? `${list.name} - Listify` : 'Custom List - Listify'
  }
  document.title = title

  // Auth Guard
  const authStore = useAuthStore()
  if (to.meta.requiresAuth !== false && !authStore.user) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && authStore.user) {
    next('/')
  } else {
    next()
  }
})

export default router
