import { createRouter, createWebHashHistory } from 'vue-router'
import ListFavourites from '@/views/ListFavourites.vue'
import ListUniversal from '@/views/ListUniversal.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      redirect: '/favourites',
      children: [
        {
          path: '/favourites',
          name: 'Favourites',
          component: ListFavourites,
          meta: {
            tag: 'favourites',
            title: 'Favourites',
          }
        },
        {
          path: '/games',
          name: 'Games',
          component: ListUniversal,
          meta: {
            tag: 'games',
            title: 'Games',
            thing: 'Game',
          }
        },
        {
          path: '/tvshows',
          name: 'TVShows',
          component: ListUniversal,
          meta: {
            tag: 'tvshows',
            title: 'TV Shows',
            thing: 'TV Show'
          }
        },
        {
          path: '/films',
          name: 'Films',
          component: ListUniversal,
          meta: {
            tag: 'films',
            title: 'Films',
            thing: 'Film',
          }
        },
        {
          path: '/books',
          name: 'Books',
          component: ListUniversal,
          meta: {
            tag: 'books',
            title: 'Books',
            thing: 'Book',
          }
        },
      ]
    },
  ]
})

export default router
