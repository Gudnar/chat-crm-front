import Vue from 'vue';
import VueRouter from 'vue-router';
import routes from './routes';

Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

const getUser = () => {
  try { return JSON.parse(localStorage.getItem('ide_ia_user')); } catch { return null; }
};

router.beforeEach((to, from, next) => {
  const hasToken = localStorage.getItem('ide_ia_token') !== null;

  // Sesiones guardadas antes de que el login almacenara el rol: sin este campo
  // el menú se filtra mal (rol 'USER') y desaparecen módulos. Forzar re-login.
  if (hasToken && to.name !== 'login') {
    const user = getUser();
    if (!user || !user.rol) {
      Object.keys(localStorage)
        .filter(k => k.startsWith('ide_ia_'))
        .forEach(k => localStorage.removeItem(k));
      return next({ name: 'login' });
    }
  }

  if (to.meta?.requiresAuth && !hasToken) {
    return next({ name: 'login' });
  }

  if (to.name === 'login' && hasToken) {
    return next({ name: 'home' });
  }

  // Role check for routes with meta.roles
  if (to.meta?.roles && hasToken) {
    const user = getUser();
    const rol = user?.rol;
    if (!rol || !to.meta.roles.includes(rol)) {
      return next({ name: 'forbidden' });
    }
  }

  next();
});

export default router;
