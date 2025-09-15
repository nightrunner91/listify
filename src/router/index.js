import { createRouter, createWebHashHistory } from 'vue-router'
import RecordsPage from '@/views/RecordsPage.vue'
import StartingPage from '@/views/StartingPage.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
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
            tag: 'start',
            title: 'Welcome to Listify!',
          }
        },
        {
          path: '/games',
          name: 'Games',
          component: RecordsPage,
          meta: {
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
            tag: 'custom',
            title: 'Custom List',
            thing: 'Custom',
            isCustom: true
          }
        },
      ]
    },
  ]
})

router.beforeEach((to, from, next) => {
  let title = 'Listify'
  if (to.meta.title && (to.meta.tag !== 'start')) {
    title = `${to.meta.title} - Listify`
  }
  // Handle dynamic tag for custom lists
  if (to.meta.isCustom && to.params.id) {
    title = `Custom List (${to.params.id}) - Listify`
  }
  document.title = title
  next()
})

export default router
