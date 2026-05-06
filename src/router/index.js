import {
  createRouter,
  createWebHashHistory
} from 'vue-router'
import RecordsPage from '@/views/RecordsPage.vue'
import StartingPage from '@/views/StartingPage.vue'
import PublicProfilePage from '@/views/PublicProfilePage.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return {
      top: 0,
      left: 0 
    }
  },
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: {
        requiresAuth: false,
        title: 'auth.login.tabTitle' 
      }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: {
        requiresAuth: false,
        title: 'auth.register.tabTitle' 
      }
    },
    {
      path: '/user/:id',
      name: 'PublicProfile',
      component: PublicProfilePage,
      meta: {
        requiresAuth: false,
        isPublic: true,
        title: 'Listify'
      }
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
            title: 'categories.start',
          }
        },
        {
          path: '/games',
          name: 'Games',
          component: RecordsPage,
          meta: {
            requiresAuth: true,
            tag: 'games',
            title: 'categories.games',
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
            title: 'categories.tvshows',
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
            title: 'categories.films',
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
            title: 'categories.anime',
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
            title: 'categories.manga',
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
            title: 'categories.books',
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
            title: 'categories.music',
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
            title: 'store.customListName',
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
            title: 'categories.about',
          }
        },
      ]
    },
  ]
})

import { useAuthStore } from '@/stores/auth.store'
import { useRecordsStore } from '@/stores/records.store'

let scrollContentToTopFn = null

export function setScrollContentToTop(fn) {
  scrollContentToTopFn = fn
}

router.beforeEach((to, from, next) => {
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

router.afterEach((to) => {
  window.scrollTo(0, 0)
  scrollContentToTopFn?.()
})

export default router
