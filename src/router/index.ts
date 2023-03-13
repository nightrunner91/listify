import { createRouter, createWebHistory } from 'vue-router'
import ListFavourites from '@/views/ListFavourites.vue'
import ListUniversal from '@/views/ListUniversal.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
            title: 'My Favourites'
          }
        },
        {
          path: '/games',
          name: 'Games',
          component: ListUniversal,
          meta: {
            tag: 'games',
            title: 'My Games'
          }
        },
        {
          path: '/tvshows',
          name: 'TVShows',
          component: ListUniversal,
          meta: {
            tag: 'tvshows',
            title: 'My TV Shows'
          }
        },
        {
          path: '/films',
          name: 'Films',
          component: ListUniversal,
          meta: {
            tag: 'films',
            title: 'My Films'
          }
        },
        {
          path: '/books',
          name: 'Books',
          component: ListUniversal,
          meta: {
            tag: 'books',
            title: 'My Books'
          }
        },
      ]
    },
  ]
})

export default router
