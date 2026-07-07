import Login from '@/components/auth/Login.vue';

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: '/admin',
    component: () => import('@/layout/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'home',
        name: 'home',
        component: () => import('@/layout/AppHome.vue'),
      },
      {
        path: 'clientes',
        name: 'clientes',
        component: () => import('@/views/Clientes.vue'),
        meta: { roles: ['SUPER_ADMIN'] },
      },
      {
        path: 'agentes',
        name: 'agentes',
        component: () => import('@/views/Agentes.vue'),
      },
      {
        path: 'agentes/:id',
        name: 'agente-detalle',
        component: () => import('@/views/AgenteDetalle.vue'),
      },
      {
        path: 'pipeline',
        name: 'pipeline',
        component: () => import('@/views/Pipeline.vue'),
      },
      {
        path: 'contactos',
        name: 'contactos',
        component: () => import('@/views/Contactos.vue'),
      },
      {
        path: 'herramientas',
        name: 'herramientas',
        component: () => import('@/views/Herramientas.vue'),
      },
      {
        path: 'conversaciones',
        name: 'conversaciones',
        component: () => import('@/views/Conversaciones.vue'),
      },
      {
        path: 'calificacion',
        name: 'calificacion',
        component: () => import('@/views/Calificacion.vue'),
      },
      {
        path: 'remarketing',
        name: 'remarketing',
        component: () => import('@/views/Remarketing.vue'),
      },
      {
        path: 'redes-sociales',
        name: 'redes-sociales',
        component: () => import('@/views/RedesSociales.vue'),
        meta: { roles: ['SUPER_ADMIN', 'ADMIN_CLIENTE'] },
      },
      {
        path: 'configuracion',
        name: 'configuracion',
        component: () => import('@/views/Configuracion.vue'),
        meta: { roles: ['SUPER_ADMIN', 'ADMIN_CLIENTE'] },
      },
      {
        path: 'reportes',
        name: 'reportes',
        component: () => import('@/views/Reportes.vue'),
      },
      {
        path: 'catalogo',
        name: 'catalogo',
        component: () => import('@/views/Catalogo.vue'),
      },
      {
        path: 'soporte',
        name: 'soporte',
        component: () => import('@/views/Soporte.vue'),
      },
      {
        path: 'mi-cuenta',
        name: 'mi-cuenta',
        component: () => import('@/views/MiCuenta.vue'),
      },
    ],
  },
  {
    path: '/404',
    name: 'not-found',
    component: () => import('@/layout/AppNotFound.vue'),
  },
  {
    path: '/403',
    name: 'forbidden',
    component: () => import('@/layout/AppForbidden.vue'),
  },
  {
    path: '*',
    redirect: '/404',
  },
];

export default routes;
