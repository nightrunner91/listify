import { createRouter, createWebHashHistory } from 'vue-router'
import RecordsPage from '@/views/RecordsPage.vue'
import AboutPage from '@/views/AboutPage.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      redirect: '/about',
      children: [
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
            thing: 'Artist',
          }
        },
        {
          path: '/about',
          name: 'About',
          component: AboutPage,
          meta: {
            tag: 'about',
            title: 'Welcome to Listify!',
          }
        },
      ]
    },
  ]
})

export default router
